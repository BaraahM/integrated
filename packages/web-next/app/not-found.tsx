'use client';

import { Container, Text, Button, Stack } from '@mantine/core';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Container size="sm" mt="xl">
      <Stack align="center" ta="center">
        <Text size="120" fw={900} c="dimmed">
          404
        </Text>
        <Text size="xl" fw={700}>
          Page Not Found
        </Text>
        <Text c="dimmed">
          Sorry, the page you are looking for doesn't exist.
        </Text>
        <Button component={Link} href="/">
          Go Home
        </Button>
      </Stack>
    </Container>
  );
}
