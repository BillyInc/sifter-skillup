import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

function ProblemChild(): React.JSX.Element {
  throw new Error('Test error');
}

describe('ErrorBoundary', () => {
  const originalError = console.error;
  beforeEach(() => { console.error = jest.fn(); });
  afterEach(() => { console.error = originalError; });

  it('renders children when no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>Hello</Text>
      </ErrorBoundary>
    );
    expect(getByText('Hello')).toBeTruthy();
  });

  it('renders fallback on error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );
    expect(getByText('Something went wrong')).toBeTruthy();
  });
});
