'use client';

import { Button, Group, PasswordInput, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import Section from '../../components/page/Section';

export default function PasswordChangeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
    },
    validate: {
      currentPassword: (value) =>
        value.length < 1 ? 'Current password is required' : null,
      newPassword: (value) =>
        value.length < 8 ? 'Password must be at least 8 characters' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setIsSubmitting(true);
      console.log('Password change values:', values);
      // TODO: Implement password change functionality
      alert('Password change functionality coming soon!');
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Section
        heading="New password"
        description="Your password must be at least 8 characters long."
      >
        <Stack gap="lg" maw={400}>
          <PasswordInput
            required
            size="md"
            label="Current password"
            placeholder="Enter your current password."
            {...form.getInputProps('currentPassword')}
          />
          <PasswordInput
            required
            size="md"
            label="New password"
            description="Password must include at least one letter, number and special character"
            placeholder="New password"
            {...form.getInputProps('newPassword')}
          />
        </Stack>
        <Group justify="flex-start" mt="xl">
          <Button size="md" loading={isSubmitting} type="submit">
            Update password
          </Button>
        </Group>
      </Section>
    </form>
  );
}
