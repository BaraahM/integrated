import { Text as MantineText, TextProps } from '@mantine/core';

interface BarTextProps extends TextProps {
  children: React.ReactNode;
}

const Text = ({ children, ...props }: BarTextProps) => {
  return <MantineText {...props}>{children}</MantineText>;
};

export default Text;
