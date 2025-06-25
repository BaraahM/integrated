'use client';

import { Container, Loader, Text, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState('processing');
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Simulate processing authentication callback
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simulate successful authentication
        setStatus('success');

        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');

        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <Container size="sm" mt="xl">
      <Stack align="center" ta="center">
        {status === 'processing' && (
          <>
            <Loader size="lg" />
            <Text size="lg">Processing authentication...</Text>
          </>
        )}

        {status === 'success' && (
          <>
            <Text size="lg" c="green">
              Authentication successful!
            </Text>
            <Text>Redirecting to dashboard...</Text>
          </>
        )}

        {status === 'error' && (
          <>
            <Text size="lg" c="red">
              Authentication failed
            </Text>
            <Text>Redirecting to login...</Text>
          </>
        )}
      </Stack>
    </Container>
  );
}
