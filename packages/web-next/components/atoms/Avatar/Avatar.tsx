import { UnstyledButton, px } from '@mantine/core';
import { useState, CSSProperties } from 'react';

export interface AvatarProps {
  label: string;
  size?: number;
  radius?: number | string;
  backgroundColor?: string;
  color?: string;
  hoverBackgroundColor?: string;
  hoverColor?: string;
  onClick?: () => void;
  style?: CSSProperties;
  title?: string;
}

const Avatar = ({
  label,
  size = 40,
  radius = '50%',
  backgroundColor = 'var(--mantine-color-dark-9)',
  color = 'var(--mantine-color-white)',
  hoverBackgroundColor = 'var(--mantine-color-gray-7)',
  hoverColor = 'var(--mantine-color-white)',
  onClick,
  style,
  title,
}: AvatarProps) => {
  const [hovered, setHovered] = useState(false);

  const getInitial = (label: string) => {
    const match = label.trim().match(/[a-zA-Z0-9]/);
    return match ? match[0].toUpperCase() : '?';
  };

  const initial = getInitial(label);

  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        width: px(size),
        height: px(size),
        borderRadius: radius,
        backgroundColor: hovered ? hoverBackgroundColor : backgroundColor,
        color: hovered ? hoverColor : color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 500,
        fontSize: '14px',
        transition: 'background-color 0.2s ease, color 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={title}
    >
      {initial}
    </UnstyledButton>
  );
};

export default Avatar;
