'use client';

import {
  Avatar,
  Button,
  FileInput,
  Group,
  Stack,
  TextInput,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUpload, IconX } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { QUERY_GET_ME } from '../../api/queries';
import Section from '../../components/page/Section';
import { useAuthContext } from '../../context/AuthContextProvider';

export default function ProfileForm() {
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthContext();

  // Query user data
  const { data, loading } = useQuery(QUERY_GET_ME);

  const form = useForm({
    initialValues: {
      firstname: '',
      lastname: '',
      email: '',
      avatar: null as File | null,
    },
    validate: {
      firstname: (value) =>
        value.length < 2 ? 'First name is too short' : null,
      lastname: (value) => (value.length < 2 ? 'Last name is too short' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (data?.me) {
      form.setValues({
        firstname: data.me.firstname || '',
        lastname: data.me.lastname || '',
        email: data.me.email || '',
        avatar: null,
      });
    }
  }, [data]);

  const iconFileinput = (
    <IconUpload style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
  );

  const handleFileChange = (file: File | null) => {
    setPreviewFile(file);
    form.setFieldValue('avatar', file);
  };

  const getAvatarDisplayUrl = () => {
    if (previewFile) {
      return URL.createObjectURL(previewFile);
    }
    if (user?.avatar) {
      return user.avatar;
    }
    return null;
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setIsSubmitting(true);
      console.log('Profile update values:', values);
      // TODO: Implement profile update mutation
      alert('Profile update functionality coming soon!');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="xl">
        <Section
          heading="Personal information"
          description="Change your personal information here."
        >
          <Stack gap="lg" maw={400}>
            <TextInput
              required
              size="md"
              label="First name"
              placeholder="Enter your first name"
              {...form.getInputProps('firstname')}
            />
            <TextInput
              required
              size="md"
              label="Last name"
              placeholder="Enter your last name"
              {...form.getInputProps('lastname')}
            />
            <TextInput
              disabled
              size="md"
              readOnly
              label="Email"
              {...form.getInputProps('email')}
            />
          </Stack>
        </Section>

        <Section
          heading="Profile picture"
          description="Your picture should have one of the following endings: png, jpeg, gif, jpg."
        >
          <Stack maw={400}>
            <Group gap="lg" justify="flex-start" align="center">
              <Avatar
                src={getAvatarDisplayUrl()}
                alt="Your profile pic"
                size="lg"
                mr="xs"
              />
              {user?.avatar && !previewFile ? (
                <Button
                  variant="default"
                  leftSection={<IconX size={16} />}
                  onClick={() => {
                    setPreviewFile(null);
                    form.setFieldValue('avatar', null);
                  }}
                >
                  Remove
                </Button>
              ) : (
                <FileInput
                  placeholder="Upload your photo"
                  leftSection={iconFileinput}
                  accept="image/png,image/jpeg,image/gif,image/jpg"
                  variant="default"
                  clearable
                  onChange={handleFileChange}
                />
              )}
            </Group>
          </Stack>
        </Section>

        <Group justify="flex-start">
          <Button type="submit" loading={isSubmitting}>
            Save changes
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
