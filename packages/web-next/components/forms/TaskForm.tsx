'use client';

import {
  Stack,
  TextInput,
  Textarea,
  Button,
  Group,
  MultiSelect,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation, useQuery } from '@apollo/client';
import { QUERY_GET_TAGS } from '../../api/queries';
import {
  MUTATION_CREATE_TASK,
  MUTATION_UPDATE_TASK,
} from '../../api/mutations';
import { notifications } from '@mantine/notifications';

interface TaskFormProps {
  taskId?: string;
  initialValues?: {
    title: string;
    description: string;
    tags: string[];
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TaskForm({
  taskId,
  initialValues,
  onSuccess,
  onCancel,
}: TaskFormProps) {
  const isEditing = !!taskId;

  const form = useForm({
    initialValues: initialValues || {
      title: '',
      description: '',
      tags: [],
    },
    validate: {
      title: (value) =>
        value.length < 2 ? 'Title must be at least 2 characters' : null,
      description: (value) =>
        value.length < 5 ? 'Description must be at least 5 characters' : null,
    },
  });

  // Get available tags
  const { data: tagsData } = useQuery(QUERY_GET_TAGS, {
    variables: { onlyInUse: false },
  });

  const [createTask, { loading: creating }] = useMutation(
    MUTATION_CREATE_TASK,
    {
      refetchQueries: ['GetTasks'],
    },
  );

  const [updateTask, { loading: updating }] = useMutation(
    MUTATION_UPDATE_TASK,
    {
      refetchQueries: ['GetTasks'],
    },
  );

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (isEditing) {
        await updateTask({
          variables: {
            taskId,
            data: {
              title: values.title,
              description: values.description,
              tagIds: values.tags,
            },
          },
        });
        notifications.show({
          title: 'Task updated',
          message: 'Task has been updated successfully',
          color: 'green',
        });
      } else {
        await createTask({
          variables: {
            data: {
              title: values.title,
              description: values.description,
              tagIds: values.tags,
            },
          },
        });
        notifications.show({
          title: 'Task created',
          message: 'Task has been created successfully',
          color: 'green',
        });
      }

      onSuccess?.();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Something went wrong',
        color: 'red',
      });
    }
  };

  const tagOptions =
    tagsData?.getTags?.edges?.map((edge: any) => ({
      value: edge.node.id,
      label: edge.node.name,
    })) || [];

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          label="Title"
          placeholder="Enter task title"
          {...form.getInputProps('title')}
          required
        />

        <Textarea
          label="Description"
          placeholder="Enter task description"
          {...form.getInputProps('description')}
          required
          minRows={3}
        />

        <MultiSelect
          label="Tags"
          placeholder="Select tags"
          data={tagOptions}
          {...form.getInputProps('tags')}
          searchable
        />

        <Group justify="flex-end" mt="md">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" loading={creating || updating}>
            {isEditing ? 'Update Task' : 'Create Task'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
