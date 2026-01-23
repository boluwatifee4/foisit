import { render } from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';

import App from './app';

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ answer: 'Mocked response' }),
  } as Response)
);

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(baseElement).toBeTruthy();
  });

  it('should have a greeting as the title', () => {
    const { getByText } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(getByText(/Build Conversational UIs in Minutes/gi)).toBeTruthy();
  });
});
