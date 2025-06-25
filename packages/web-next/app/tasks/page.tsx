'use client';

import { useQuery, useMutation } from '@apollo/client';
import {
  Stack,
  Text,
  Button,
  Table,
  Container,
  Group,
  Badge,
  LoadingOverlay,
  Alert,
  Drawer,
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { QUERY_GET_TASKS } from '../../api/queries';
import {
  MUTATION_DELETE_TASK,
  MUTATION_TOGGLE_TASK_STATUS,
} from '../../api/mutations';
import { openConfirmModal } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import TaskForm from '../../components/forms/TaskForm';

// Simple notification utility
const showNotification = ({
  title,
  message,
  color = 'blue',
}: {
  title: string;
  message?: string;
  color?: string;
}) => {
  notifications.show({
    title,
    message,
    color,
  });
};

const initialSearchState = {
  currentPage: 1,
  itemsPerPage: 20,
  searchQuery: '',
  filterTagSelection: [],
  status: undefined,
  orderBy: {
    field: 'createdAt',
    direction: 'desc',
  },
};

export default function TasksPage() {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const [searchState] = useState(initialSearchState);

  const { loading, error, data, refetch } = useQuery(QUERY_GET_TASKS, {
    variables: searchState,
  });

  const [deleteTaskMutation] = useMutation(MUTATION_DELETE_TASK, {
    refetchQueries: [{ query: QUERY_GET_TASKS }],
  });

  const [toggleTaskStatus] = useMutation(MUTATION_TOGGLE_TASK_STATUS, {
    refetchQueries: [{ query: QUERY_GET_TASKS }],
  });

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { data: deleteData } = await deleteTaskMutation({
        variables: { taskId },
      });

      showNotification({
        title: `Deleted task: ${deleteData.deleteTaskById.title}`,
        message: 'Task deleted successfully!',
        color: 'green',
      });

      refetch();
    } catch (e: any) {
      showNotification({
        title: 'Error deleting task',
        message: e.message,
        color: 'red',
      });
    }
  };

  const handleToggleStatus = async (taskId: string) => {
    try {
      await toggleTaskStatus({
        variables: { taskId },
      });
      refetch();
    } catch (e: any) {
      showNotification({
        title: 'Error updating task status',
        message: e.message,
        color: 'red',
      });
    }
  };

  const onDeleteTask = (taskId: string, taskTitle: string) => {
    openConfirmModal({
      title: 'Delete task',
      centered: true,
      children: (
        <Text size="sm">Are you sure you want to delete "{taskTitle}"?</Text>
      ),
      labels: { confirm: 'Delete task', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => handleDeleteTask(taskId),
    });
  };

  if (loading) {
    return (
      <Container size="xl" mt="xl">
        <LoadingOverlay visible />
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" mt="xl">
        <Alert color="red" title="Error loading tasks">
          {error.message}
        </Alert>
      </Container>
    );
  }

  const tasks = data?.getTasks?.edges?.map((edge: any) => edge.node) || [];

  return (
    <Container size="xl" mt="xl">
      <Stack>
        <Group justify="space-between">
          <Text size="xl" fw={700}>
            Tasks
          </Text>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setDrawerIsOpen(true)}
          >
            Add Task
          </Button>
        </Group>

        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Title</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Tags</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tasks.map((task: any) => (
              <Table.Tr key={task.id}>
                <Table.Td>{task.title}</Table.Td>
                <Table.Td>
                  <Badge
                    color={task.status === 'COMPLETED' ? 'green' : 'blue'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleToggleStatus(task.id)}
                  >
                    {task.status === 'COMPLETED' ? 'completed' : 'pending'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {task.tags?.map((tag: any) => (
                      <Badge key={tag.id} variant="light" size="sm">
                        {tag.name}
                      </Badge>
                    ))}
                  </Group>
                </Table.Td>
                <Table.Td>
                  {new Date(task.createdAt).toLocaleDateString()}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button
                      size="xs"
                      variant="light"
                      leftSection={<IconEdit size={14} />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      color="red"
                      leftSection={<IconTrash size={14} />}
                      onClick={() => onDeleteTask(task.id, task.title)}
                    >
                      Delete
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {tasks.length === 0 && (
          <Text ta="center" c="dimmed" py="xl">
            No tasks found. Create your first task to get started!
          </Text>
        )}
      </Stack>

      <Drawer
        opened={drawerIsOpen}
        onClose={() => setDrawerIsOpen(false)}
        title="Create Task"
        padding="xl"
        size="md"
        position="right"
      >
        <TaskForm
          onSuccess={() => {
            setDrawerIsOpen(false);
            refetch();
          }}
          onCancel={() => setDrawerIsOpen(false)}
        />
      </Drawer>
    </Container>
  );
}
