import React from 'react';
import { Button as MantineButton, ButtonProps } from '@mantine/core';

export interface CustomButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export const Button: React.FC<CustomButtonProps> = ({ children, ...props }) => {
  return <MantineButton {...props}>{children}</MantineButton>;
};
