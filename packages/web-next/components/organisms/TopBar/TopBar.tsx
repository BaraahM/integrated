'use client';

import { Group, Paper } from '@mantine/core';
import Button from '@/components/atoms/Button/Button';
import Avatar from '@/components/atoms/Avatar/Avatar';

export interface TopBarProps {
  user: string | null;
  onRegister: () => void;
  onSignOut: () => void;
}

const TopBar = ({ user, onRegister, onSignOut }: TopBarProps) => {
  return (
    <Paper
      style={{
        width: '100%',
        borderBottom: 'solid var(--mantine-color-gray-3)',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderRadius: 0,
      }}
    >
      <Group gap="sm">
        {user ? (
          <Avatar
            label={user}
            backgroundColor="var(--mantine-color-dark-9)"
            color="var(--mantine-color-white)"
            hoverBackgroundColor="var(--mantine-color-gray-7)"
            hoverColor="var(--mantine-color-white)"
            onClick={onSignOut}
            title="Click to sign out"
          />
        ) : (
          <>
            <Button
              radius={50}
              customStyles={{
                backgroundColor: 'var(--mantine-color-dark-9)',
                color: 'var(--mantine-color-white)',
                transition: 'all 0.2s ease',
              }}
              customHoverStyles={{
                backgroundColor: 'var(--mantine-color-dark-7)',
                transform: 'scale(1.03)',
              }}
            >
              Login
            </Button>

            <Button
              radius={50}
              onClick={onRegister}
              customStyles={{
                backgroundColor: 'var(--mantine-color-white)',
                color: 'var(--mantine-color-dark-9)',
                transition: 'all 0.2s ease',
                border: '1px solid var(--mantine-color-dark-9)',
              }}
              customHoverStyles={{
                backgroundColor: 'var(--mantine-color-gray-1)',
                transform: 'scale(1.03)',
              }}
            >
              Sign Up
            </Button>
          </>
        )}
      </Group>
    </Paper>
  );
};

export default TopBar;
