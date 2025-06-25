'use client';

import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { ApolloProvider } from '@apollo/client';
import { Notifications } from '@mantine/notifications';
import { theme } from '../theme/theme';
import apolloClient from '../lib/apolloClient';
import { AuthContextProvider } from '../context/AuthContextProvider';
import { ModalProvider } from '../context/ModalContext';
import AppSidebar from '@/components/organisms/AppSidebar/AppSidebar';
import TopBar from '@/components/organisms/TopBar/TopBar';
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useModalsContext } from '@/context/ModalContext';
import { useMemo } from 'react';
import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.layer.css';
import '@mantine/core/styles.layer.css';
import 'mantine-datatable/styles.layer.css';
import './globals.css';

function AppLayout({ children }: { children: ReactNode }) {
  const { username, handleSignOut, isAuthenticated } = useAuth();
  const { openModal } = useModalsContext();

  // Memoize the TopBar props to prevent unnecessary re-renders
  const topBarProps = useMemo(
    () => ({
      user: isAuthenticated ? username : null,
      onSignOut: handleSignOut,
      onRegister: () => openModal('register'),
    }),
    [isAuthenticated, username, handleSignOut, openModal],
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--mantine-color-gray-0)',
        display: 'flex',
      }}
    >
      <AppSidebar />
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          backgroundColor: 'var(--mantine-color-gray-0)',
        }}
      >
        <TopBar {...topBarProps} />
        <div
          style={{
            flex: 1,
            display: 'flex',
            backgroundColor: 'var(--mantine-color-gray-0)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ApolloProvider client={apolloClient}>
          <MantineProvider theme={theme} defaultColorScheme="light">
            <ModalsProvider>
              <Notifications position="bottom-right" />
              <AuthContextProvider>
                <ModalProvider>
                  <AppLayout>{children}</AppLayout>
                </ModalProvider>
              </AuthContextProvider>
            </ModalsProvider>
          </MantineProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}
