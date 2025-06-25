'use client';

import {
  Stack,
  Text,
  PasswordInput,
  Button,
  Paper,
  Container,
} from '@mantine/core';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.password !== passwords.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsLoading(true);
    console.log('Resetting password...');

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Password reset successfully!');
      router.push('/login');
    }, 2000);
  };

  return (
    <Container size="sm" mt="xl">
      <Paper shadow="md" p="xl" radius="md">
        <Stack>
          <Text size="xl" fw={700} ta="center">
            Reset Your Password
          </Text>

          <Text ta="center" c="dimmed">
            Enter your new password below.
          </Text>

          <form onSubmit={handleSubmit}>
            <Stack>
              <PasswordInput
                label="New Password"
                placeholder="Enter new password"
                value={passwords.password}
                onChange={(e) =>
                  setPasswords({ ...passwords, password: e.target.value })
                }
                required
                minLength={8}
              />

              <PasswordInput
                label="Confirm New Password"
                placeholder="Confirm new password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: e.target.value,
                  })
                }
                required
                minLength={8}
              />

              <Button type="submit" fullWidth loading={isLoading}>
                Reset Password
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
}
