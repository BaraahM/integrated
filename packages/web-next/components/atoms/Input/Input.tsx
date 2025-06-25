import {
  TextInput,
  PasswordInput,
  TextInputProps,
  PasswordInputProps,
  useMantineTheme,
} from '@mantine/core';
import { CSSProperties } from 'react';

type InputType = 'text' | 'password';

export interface BaseInputProps {
  inputType?: InputType;
  color?: string;
  customStyles?: CSSProperties;
}

type TextFieldProps = BaseInputProps &
  Omit<TextInputProps, 'type'> & {
    inputType?: 'text';
  };

type PasswordFieldProps = BaseInputProps &
  Omit<PasswordInputProps, 'type'> & {
    inputType: 'password';
  };

type InputProps = TextFieldProps | PasswordFieldProps;

const Input = ({
  inputType = 'text',
  color,
  customStyles = {},
  ...props
}: InputProps) => {
  const theme = useMantineTheme();
  const inputColor = color || theme.colors.dark[9];

  const sharedStyles = {
    input: {
      borderRadius: 8,
      padding: '12px 16px',
      fontSize: 14,
      height: 40,
      border: `1px solid ${theme.colors.gray[3]}`,
      backgroundColor: theme.colors.gray[0],
      color: inputColor,
      ...customStyles,
    },
  };

  const Component = inputType === 'password' ? PasswordInput : TextInput;

  return <Component size="md" styles={sharedStyles} {...(props as any)} />;
};

export default Input;
