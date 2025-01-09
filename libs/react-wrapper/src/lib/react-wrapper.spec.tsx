import { render } from '@testing-library/react';

import ReactWrapper from './react-wrapper';

describe('ReactWrapper', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ReactWrapper />);
    expect(baseElement).toBeTruthy();
  });
});
