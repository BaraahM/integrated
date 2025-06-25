import { Stack, Paper, Flex } from '@mantine/core';
import {
  IconFileText,
  IconUsers,
  IconFolder,
  IconCreditCard,
  IconSettings,
} from '@tabler/icons-react';
import SidebarItem from '@/components/molecules/SidebarItem/SidebarItem';
import Divider from '@/components/atoms/Divider/Divider';
import { useRouter, usePathname } from 'next/navigation';

const AppSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isPathActive = (href: string) => {
    if (href === '/') {
      return (
        pathname === '/' ||
        pathname === '/home' ||
        pathname?.startsWith('/home')
      );
    }
    return pathname === href || pathname?.startsWith(href);
  };

  const menuItems = [
    {
      icon: IconFileText,
      label: 'Document Editor',
      href: '/',
    },
    {
      icon: IconUsers,
      label: 'Engagements',
      href: '/engagements',
    },
    {
      icon: IconFolder,
      label: 'My Files',
      href: '/files',
    },
  ];

  const bottomItems = [
    {
      icon: IconCreditCard,
      label: 'Free Plan',
      href: '/billing',
    },
    {
      icon: IconSettings,
      label: 'Settings',
      href: '/settings',
    },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handleLogoClick = () => {
    router.push('/home');
  };

  return (
    <Paper
      style={{
        width: 288,
        height: '100vh',
        borderRight: '1px solid var(--mantine-color-gray-3)',
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
      }}
    >
      <Flex
        direction="column"
        justify="center"
        align="flex-start"
        style={{
          height: 50,
          width: '100%',
          cursor: 'pointer',
        }}
        onClick={handleLogoClick}
      >
        <img
          src="/icons/barum-black-cropped.svg"
          alt="Barum Logo"
          style={{
            height: 30,
            width: 100,
            objectFit: 'contain',
          }}
        />
      </Flex>

      <Divider />

      <Stack style={{ flex: 1 }} gap="xs">
        {menuItems.map((item, index) => (
          <SidebarItem
            key={index}
            icon={item.icon}
            label={item.label}
            active={isPathActive(item.href)}
            onClick={() => handleNavigation(item.href)}
          />
        ))}
      </Stack>

      <Divider />

      <Stack gap="xs">
        {bottomItems.map((item, index) => (
          <SidebarItem
            key={index}
            icon={item.icon}
            label={item.label}
            active={isPathActive(item.href)}
            onClick={() => handleNavigation(item.href)}
          />
        ))}
      </Stack>
    </Paper>
  );
};

export default AppSidebar;
