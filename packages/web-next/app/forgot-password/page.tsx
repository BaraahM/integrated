'use client';

import {
  Alert,
  Anchor,
  Button,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import Link from 'next/link';
import AuthPageLayout from '../../components/layout/AuthPageLayout';

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : 'Please enter a valid email address',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Implement forgot password functionality
      console.log('Forgot password for:', values.email);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthPageLayout>
        <Title order={1} size="h1">
          Check your email
        </Title>
        <Space h="xs" />
        <Text size="xl">We've sent you a password reset link</Text>
        <Space h="xl" />

        <Alert color="green" title="Email sent!">
          If an account with that email exists, we've sent you a password reset
          link.
        </Alert>

        <Space h="xl" />
        <Anchor component={Link} href="/login" size="sm">
          Back to sign in
        </Anchor>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout>
      <Title order={1} size="h1">
        Forgot your password?
      </Title>
      <Space h="xs" />
      <Text size="xl">Enter your email to reset it</Text>
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
        <Stack gap="md">
          <TextInput
            required
            label="Email"
            size="md"
            placeholder="hello@mantine.dev"
            description="We'll send you a link to reset your password"
            {...form.getInputProps('email')}
          />

          <Space h="lg" />
          <Button size="md" loading={isLoading} type="submit">
            Send Reset Link
          </Button>
        </Stack>
      </form>

      <Space h="xl" />
      <Anchor component={Link} href="/login" size="sm">
        Back to sign in
      </Anchor>
    </AuthPageLayout>
  );
}
