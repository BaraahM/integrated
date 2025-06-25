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
import Link from 'next/link';
import { useAuthContext } from '../../context/AuthContextProvider';
import AuthPageLayout from '../../components/layout/AuthPageLayout';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';

export default function SignupPage() {
  const { signUp, error, isLoading } = useAuthContext();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : 'Please enter a valid email address',
      password: (value) =>
        value.length < 6
          ? 'Your password should have at least 6 characters'
          : null,
      confirmPassword: (value, values) =>
        value !== values.password ? 'Passwords do not match' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await signUp({
        email: values.email,
        password: values.password,
      });
    } catch (err) {
      console.error('Signup error:', err);
    }
  };

  return (
    <AuthPageLayout>
      <Title order={1} size="h1">
        Create your account
      </Title>
      <Space h="xs" />
      <Text size="xl">Join us today</Text>
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
            {...form.getInputProps('email')}
          />

          <PasswordInput
            required
            label="Password"
            size="md"
            placeholder="Your password"
            {...form.getInputProps('password')}
          />

          <PasswordInput
            required
            label="Confirm Password"
            size="md"
            placeholder="Confirm your password"
            {...form.getInputProps('confirmPassword')}
          />

          <Space h="lg" />
          <Button size="md" loading={isLoading} type="submit">
            Create Account
          </Button>

          <Divider my="xs" label="OR" labelPosition="center" />

          <GoogleSignInButton fullWidth />
        </Stack>
      </form>

      <Space h="xl" />
      <Group justify="center" mb="md">
        <Anchor size="xs" component={Link} href="/login">
          Already have an account? Sign in!
        </Anchor>
      </Group>
    </AuthPageLayout>
  );
}
