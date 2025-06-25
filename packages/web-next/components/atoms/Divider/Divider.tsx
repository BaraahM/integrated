import { Divider as MantineDivider, DividerProps, Text } from '@mantine/core';

export interface BarDividerProps extends DividerProps {
  label?: string;
}

const Divider = ({ label, ...props }: BarDividerProps) => {
  return (
    <MantineDivider
      label={
        label ? (
          <Text size="xs" c="gray.6" px="sm">
            {label}
          </Text>
        ) : undefined
      }
      labelPosition="center"
      my="sm"
      color="gray.3"
      size="sm"
      variant="solid"
      {...props}
    />
  );
};

export default Divider;
