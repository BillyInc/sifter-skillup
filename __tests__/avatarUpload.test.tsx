import React from 'react';
import { fireEvent, render, screen, waitFor, act } from '@testing-library/react-native';
import { ThemeProvider } from '../src/theme';

jest.mock('expo-image-picker', () => ({
  MediaTypeOptions: { Images: 'images' },
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));
jest.mock('../src/lib/api', () => ({
  API: { updateMe: jest.fn(), uploadAvatar: jest.fn(), removeAvatar: jest.fn() },
}));

import * as ImagePicker from 'expo-image-picker';
import { API } from '../src/lib/api';
import { avatarFileProblem, AVATAR_MAX_BYTES } from '../src/lib/avatarUpload';
import { isUploadedAvatar } from '../src/lib/avatarPresets';
import Avatar from '../src/components/account/Avatar';
import AvatarPicker from '../src/components/account/AvatarPicker';

const picker = ImagePicker as unknown as Record<string, jest.Mock>;
const api = API as unknown as Record<string, jest.Mock>;
const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('avatarFileProblem', () => {
  it('accepts jpeg/png/webp within the cap', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp']) expect(avatarFileProblem({ type, size: 1000 })).toBeNull();
  });
  it('rejects other types and oversize in plain language', () => {
    expect(avatarFileProblem({ type: 'image/gif', size: 10 })).toMatch(/JPEG, PNG or WebP/);
    expect(avatarFileProblem({ type: 'image/svg+xml', size: 10 })).not.toBeNull();
    expect(avatarFileProblem({ type: 'image/png', size: AVATAR_MAX_BYTES + 1 })).toMatch(/2 MB/);
  });
});

describe('isUploadedAvatar', () => {
  it('distinguishes uploads from presets and nothing', () => {
    expect(isUploadedAvatar('upload:u/x.webp')).toBe(true);
    expect(isUploadedAvatar('preset:icon-star')).toBe(false);
    expect(isUploadedAvatar(null)).toBe(false);
  });
});

describe('Avatar', () => {
  const user = { username: 'Ada', avatar_url: 'upload:u/x.webp', avatar_display_url: 'https://signed.test/x.webp' };
  it('renders the signed photo', () => {
    wrap(<Avatar user={user} />);
    expect(screen.getByLabelText('Avatar: your photo')).toBeTruthy();
  });
  it('falls back to the initial when the photo fails to load', () => {
    const { UNSAFE_getByType } = wrap(<Avatar user={user} />);
    const { Image } = require('react-native');
    act(() => { UNSAFE_getByType(Image).props.onError(); });
    expect(screen.getByLabelText('Avatar')).toBeTruthy();
    expect(screen.getByText('A')).toBeTruthy();
  });
  it('shows the initial when an upload has no signed URL', () => {
    wrap(<Avatar user={{ username: 'Ada', avatar_url: 'upload:u/x.webp' }} />);
    expect(screen.getByText('A')).toBeTruthy();
  });
});

describe('AvatarPicker photo flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true });
    global.fetch = jest.fn().mockResolvedValue({ blob: async () => ({ type: 'image/jpeg', size: 1000 }) }) as unknown as typeof fetch;
  });
  const asset = { uri: 'file:///p.jpg', mimeType: 'image/jpeg', fileName: 'p.jpg', fileSize: 1000 };

  it('shows guidance and the privacy note', () => {
    wrap(<AvatarPicker user={{ username: 'Ada' }} onSaved={jest.fn()} />);
    expect(screen.getByText(/up to 2 MB/)).toBeTruthy();
    expect(screen.getByText('Only you can see your photo.')).toBeTruthy();
    expect(screen.queryByLabelText('Remove photo')).toBeNull();
  });

  it('previews, uploads on confirm, then refreshes', async () => {
    picker.launchImageLibraryAsync.mockResolvedValue({ canceled: false, assets: [asset] });
    api.uploadAvatar.mockResolvedValue({ avatar_url: 'upload:u/x.webp', avatar_display_url: 'https://s' });
    const onSaved = jest.fn();
    wrap(<AvatarPicker user={{ username: 'Ada' }} onSaved={onSaved} />);
    fireEvent.press(screen.getByLabelText('Upload a photo'));
    await screen.findByLabelText('Preview of the photo you chose');
    expect(api.uploadAvatar).not.toHaveBeenCalled();
    fireEvent.press(screen.getByLabelText('Use this photo'));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(api.uploadAvatar).toHaveBeenCalledWith(expect.anything(), 'p.jpg');
  });

  it('keeps the preview and shows the server message when upload fails', async () => {
    picker.launchImageLibraryAsync.mockResolvedValue({ canceled: false, assets: [asset] });
    api.uploadAvatar.mockRejectedValue(new Error('We could not read that photo.'));
    const onSaved = jest.fn();
    wrap(<AvatarPicker user={{ username: 'Ada' }} onSaved={onSaved} />);
    fireEvent.press(screen.getByLabelText('Upload a photo'));
    await screen.findByLabelText('Use this photo');
    fireEvent.press(screen.getByLabelText('Use this photo'));
    expect(await screen.findByText('We could not read that photo.')).toBeTruthy();
    expect(screen.getByLabelText('Use this photo')).toBeTruthy();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('cancelling the picker changes nothing', async () => {
    picker.launchImageLibraryAsync.mockResolvedValue({ canceled: true, assets: [] });
    wrap(<AvatarPicker user={{ username: 'Ada' }} onSaved={jest.fn()} />);
    fireEvent.press(screen.getByLabelText('Upload a photo'));
    await waitFor(() => expect(picker.launchImageLibraryAsync).toHaveBeenCalled());
    expect(screen.queryByLabelText('Use this photo')).toBeNull();
  });

  it('rejects an oversize photo before uploading', async () => {
    picker.launchImageLibraryAsync.mockResolvedValue({ canceled: false, assets: [{ ...asset, fileSize: AVATAR_MAX_BYTES + 5 }] });
    wrap(<AvatarPicker user={{ username: 'Ada' }} onSaved={jest.fn()} />);
    fireEvent.press(screen.getByLabelText('Upload a photo'));
    expect(await screen.findByText(/larger than 2 MB/)).toBeTruthy();
    expect(api.uploadAvatar).not.toHaveBeenCalled();
  });

  it('remove photo calls the API and refreshes', async () => {
    api.removeAvatar.mockResolvedValue({ avatar_url: null, avatar_display_url: null });
    const onSaved = jest.fn();
    wrap(<AvatarPicker user={{ username: 'Ada', avatar_url: 'upload:u/x.webp', avatar_display_url: 'https://s' }} onSaved={onSaved} />);
    fireEvent.press(screen.getByLabelText('Remove photo'));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(api.removeAvatar).toHaveBeenCalledTimes(1);
  });

  it('choosing a preset while a photo is set still saves the preset', async () => {
    api.updateMe.mockResolvedValue({});
    const onSaved = jest.fn();
    wrap(<AvatarPicker user={{ username: 'Ada', avatar_url: 'upload:u/x.webp' }} onSaved={onSaved} />);
    fireEvent.press(screen.getByLabelText('Compass'));
    await waitFor(() => expect(api.updateMe).toHaveBeenCalledWith({ avatar_url: 'preset:icon-compass' }));
  });
});
