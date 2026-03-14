import { ApiError, NetworkError } from '../src/lib/api';

describe('ApiError', () => {
  it('creates error with status code', () => {
    const error = new ApiError('Not found', 404);
    expect(error.message).toBe('Not found');
    expect(error.status).toBe(404);
    expect(error.name).toBe('ApiError');
  });
});

describe('NetworkError', () => {
  it('creates error with default message', () => {
    const error = new NetworkError();
    expect(error.message).toBe('Network request failed');
    expect(error.name).toBe('NetworkError');
  });
});
