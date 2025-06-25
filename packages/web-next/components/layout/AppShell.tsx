'use client';

import {
  AppShell,
  Burger,
  Group,
  Button,
  Stack,
  NavLink,
  Text,
  Menu,
  Divider,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDashboard,
  IconListCheck,
  IconTags,
  IconSettings,
  IconLogout,
  IconHome,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthContext } from '../../context/AuthContextProvider';
import { useEffect } from 'react';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: IconDashboard },
  { href: '/tasks', label: 'Tasks', icon: IconListCheck },
  { href: '/tags', label: 'Tags', icon: IconTags },
  { href: '/settings', label: 'Settings', icon: IconSettings },
];

interface AppShellLayoutProps {
  children: React.ReactNode;
}

export default function AppShellLayout({ children }: AppShellLayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthContext();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (
      !isLoading &&
      !isAuthenticated &&
      ![
        '/login',
        '/signup',
        '/forgot-password',
        '/reset-password',
        '/',
      ].includes(pathname)
    ) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Don't show navigation for auth pages or loading state
  if (
    !isAuthenticated ||
    ['/login', '/signup', '/forgot-password', '/reset-password', '/'].includes(
      pathname,
    )
  ) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Button
              component={Link}
              href="/"
              variant="subtle"
              leftSection={<IconHome size={20} />}
            >
              Barum
            </Button>
          </Group>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button variant="subtle">{user?.firstname || 'User'}</Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconLogout size={14} />}
                onClick={handleLogout}
              >
                Sign out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack>
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              component={Link}
              href={link.href}
              label={link.label}
              leftSection={<link.icon size={20} />}
              active={pathname === link.href}
              variant="filled"
            />
          ))}
        </Stack>

        <Divider my="md" />

        <Stack gap="xs">
          <Text size="xs" c="dimmed">
            {user?.email}
          </Text>
          <Text size="xs" c="dimmed">
            {typeof user?.role === 'string'
              ? user.role
              : user?.role?.name || 'User'}
          </Text>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
