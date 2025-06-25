import React from 'react';
import { Text as MantineText, TextProps } from '@mantine/core';

export interface CustomTextProps extends TextProps {
  children: React.ReactNode;
}

export const Text: React.FC<CustomTextProps> = ({ children, ...props }) => {
  return <MantineText {...props}>{children}</MantineText>;
};
