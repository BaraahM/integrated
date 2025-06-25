'use client';

import {
  Alert,
  Anchor,
  Button,
  Divider,
  Group,
  PasswordInput,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '../../context/AuthContextProvider';
import AuthPageLayout from '../../components/layout/AuthPageLayout';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';

export default function LoginPage() {
  const [emailLoginViaPassword, setEmailLoginViaPassword] = useState(true);
  const [showSuccessMessageForMagicLink, setShowSuccessMessageForMagicLink] =
    useState(false);
  const { signIn, error, isLoading } = useAuthContext();

  const isDemoMode =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  const form = useForm({
    initialValues: {
      email: 'admin@barum.com',
      password: 'secret42',
    },
    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : 'Please enter a valid email address',
      password: (value) =>
        emailLoginViaPassword && value.length < 6
          ? 'Your password should have at least 6 characters'
          : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (emailLoginViaPassword) {
        // Check if Supabase is configured
        if (isDemoMode) {
          // Demo mode - simulate successful login
          console.log('Demo mode: Simulating login for:', values.email);
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

          // Navigate to dashboard
          window.location.href = '/dashboard';
          return;
        }

        await signIn(values);
      } else {
        // Handle magic link request
        setShowSuccessMessageForMagicLink(true);
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <AuthPageLayout>
      {isDemoMode && (
        <>
          <Alert color="blue" title="Demo Mode">
            Supabase is not configured. You can still test the UI functionality.
          </Alert>
          <Space h="md" />
        </>
      )}

      {showSuccessMessageForMagicLink && (
        <>
          <Alert
            variant="light"
            withCloseButton
            onClose={() => setShowSuccessMessageForMagicLink(false)}
            color="lime"
            title="Check your inbox!"
          >
            We´ve sent you a magic link to sign in.
          </Alert>
          <Space h="md" />
        </>
      )}

      <Title order={1} size="h1">
        Hello, who's this?
      </Title>
      <Space h="xs" />
      <Text size="xl">Sign in to your account</Text>
      <Space h="xl" />

      {error && (
        <>
          <Alert color="red" title="Error">
            {error}
          </Alert>
          <Space h="md" />
        </>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="0" justify="left">
          <TextInput
            required
            label="Email"
            size="md"
            description={
              !emailLoginViaPassword &&
              'We´ll send you a magic link to sign in.'
            }
            placeholder="hello@mantine.dev"
            {...form.getInputProps('email')}
          />

          {emailLoginViaPassword ? (
            <>
              <Space h="md" />
              <PasswordInput
                required
                id="password"
                label="Password"
                size="md"
                placeholder="Your password"
                {...form.getInputProps('password')}
              />
              <Space h="md" />
              <Group justify="center">
                <Anchor
                  size="sm"
                  onClick={() =>
                    setEmailLoginViaPassword(!emailLoginViaPassword)
                  }
                >
                  Sign in without a password
                </Anchor>
              </Group>
            </>
          ) : (
            <>
              <Space h="md" />
              <Group justify="space-between">
                <Anchor
                  size="sm"
                  onClick={() =>
                    setEmailLoginViaPassword(!emailLoginViaPassword)
                  }
                >
                  Use password instead
                </Anchor>
              </Group>
            </>
          )}

          <Space h="lg" />
          <Button size="md" loading={isLoading} type="submit">
            {emailLoginViaPassword ? 'Sign in' : 'Send magic link'}
          </Button>

          <Divider my="xs" label="OR" labelPosition="center" />

          <GoogleSignInButton fullWidth />
        </Stack>
      </form>

      <Space h="xl" />
      <Group justify="space-between" mb="md">
        <Anchor size="xs" component={Link} href="/signup">
          Don&apos;t have an account yet? Sign up!
        </Anchor>
        <Anchor size="xs" component={Link} href="/forgot-password">
          Forgot password?
        </Anchor>
      </Group>
    </AuthPageLayout>
  );
}
