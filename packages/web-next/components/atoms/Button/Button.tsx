import {
  Button as MantineButton,
  ButtonProps,
  px,
  UnstyledButton,
  Group,
  Text,
  UnstyledButtonProps,
} from '@mantine/core';
import {
  ReactNode,
  useState,
  ComponentType,
  CSSProperties,
  ButtonHTMLAttributes,
} from 'react';

type TablerIcon = ComponentType<{
  size?: number;
  className?: string;
  stroke?: number;
}>;

export interface BarButtonProps extends ButtonProps {
  iconOnly?: boolean;
  children?: ReactNode;
  onClick?: () => void;
  radius?: number | string;
  backgroundColor?: string;
  color?: string;
  sidebarOnly?: boolean;
  icon?: TablerIcon;
  label?: string;
  active?: boolean;
  hoverBackgroundColor?: string;
  hoverColor?: string;
  leftSection?: ReactNode;
  customStyles?: CSSProperties;
  customHoverStyles?: CSSProperties;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

const Button = ({
  iconOnly = false,
  sidebarOnly = false,
  icon: Icon,
  label,
  children,
  onClick,
  radius,
  style: propStyle,
  backgroundColor,
  color,
  active = false,
  hoverBackgroundColor,
  hoverColor,
  leftSection,
  customStyles,
  customHoverStyles,
  type,
  ...props
}: BarButtonProps) => {
  const [hovered, setHovered] = useState(false);

  const borderRadius = radius ?? (iconOnly ? '50%' : sidebarOnly ? '8px' : 5);

  if (sidebarOnly && Icon && label) {
    const { ...unstyledProps } = props;

    const sidebarBgColor =
      active || hovered
        ? hoverBackgroundColor ?? 'var(--mantine-color-dark-9)'
        : backgroundColor ?? 'transparent';
    const sidebarTextColor =
      active || hovered
        ? hoverColor ?? 'var(--mantine-color-white)'
        : color ?? 'var(--mantine-color-gray-6)';

    return (
      <UnstyledButton
        onClick={onClick}
        style={{
          display: 'block',
          width: '100%',
          padding: '12px 16px',
          borderRadius,
          backgroundColor: sidebarBgColor,
          color: sidebarTextColor,
          transition: 'all 0.15s ease',
          cursor: 'pointer',
          ...(propStyle as React.CSSProperties),
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...(unstyledProps as UnstyledButtonProps)}
      >
        <Group gap={12} wrap="nowrap">
          <Icon size={18} stroke={1.5} />
          <Text size="sm" style={{ fontWeight: 500 }}>
            {label}
          </Text>
        </Group>
      </UnstyledButton>
    );
  }

  const iconStyle: React.CSSProperties = {
    borderRadius,
    width: px(40),
    height: px(40),
    padding: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: hovered
      ? hoverBackgroundColor ?? 'var(--mantine-color-green-7)'
      : backgroundColor ?? 'var(--mantine-color-green-6)',
    transform: hovered ? 'scale(1.1)' : 'scale(1)',
    transition: 'all 0.2s ease-in-out',
    color: hovered
      ? hoverColor ?? 'var(--mantine-color-white)'
      : color ?? 'var(--mantine-color-white)',
  };

  const normalStyle: React.CSSProperties = {
    borderRadius,
    backgroundColor,
    color,
  };

  if (customStyles) {
    const combinedStyle = {
      ...customStyles,
      ...(hovered && customHoverStyles ? customHoverStyles : {}),
      ...((propStyle as React.CSSProperties) ?? {}),
    };

    return (
      <MantineButton
        {...props}
        type={type}
        leftSection={leftSection}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={combinedStyle}
        onClick={onClick}
      >
        {children}
      </MantineButton>
    );
  }

  const combinedStyle = iconOnly
    ? { ...iconStyle, ...((propStyle as React.CSSProperties) ?? {}) }
    : { ...normalStyle, ...((propStyle as React.CSSProperties) ?? {}) };

  return (
    <MantineButton
      {...props}
      type={type}
      leftSection={leftSection}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={combinedStyle}
      onClick={onClick}
    >
      {children}
    </MantineButton>
  );
};

export default Button;
