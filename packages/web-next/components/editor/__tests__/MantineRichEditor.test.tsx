import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MantineRichEditor } from '../MantineRichEditor';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe('MantineRichEditor', () => {
  it('renders editor with toolbar', () => {
    render(<MantineRichEditor placeholder="Test editor" />, {
      wrapper: TestWrapper,
    });

    expect(screen.getByText('Test editor')).toBeInTheDocument();
  });

  it('handles content changes', () => {
    const mockOnChange = jest.fn();

    render(<MantineRichEditor onChange={mockOnChange} />, {
      wrapper: TestWrapper,
    });

    // Add test interactions here
  });
});
