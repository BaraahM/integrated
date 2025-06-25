'use client';

import { useQuery } from '@apollo/client';
import {
  Stack,
  Text,
  Button,
  Grid,
  Card,
  Container,
  LoadingOverlay,
  Alert,
} from '@mantine/core';
import {
  IconPlus,
  IconList,
  IconTag,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';
import Link from 'next/link';
import { QUERY_GET_HOME_PAGE_DATA } from '../../api/queries';

export default function DashboardPage() {
  const { loading, error, data } = useQuery(QUERY_GET_HOME_PAGE_DATA);

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
        <Alert color="red" title="Error loading dashboard">
          {error.message}
        </Alert>
      </Container>
    );
  }

  const { taskStats, tagStats, teamStats } = data || {};

  return (
    <Container size="xl" mt="xl">
      <Stack>
        <Text size="xl" fw={700}>
          Dashboard
        </Text>

        {/* Stats Grid */}
        <Grid>
          <Grid.Col span={4}>
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Stack align="center">
                <IconList size={32} />
                <Text fw={500}>Total Tasks</Text>
                <Text size="xl" fw={700}>
                  {taskStats?.total || 0}
                </Text>
                <Text size="sm" c="dimmed">
                  {taskStats?.pending || 0} pending, {taskStats?.completed || 0}{' '}
                  completed
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={4}>
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Stack align="center">
                <IconTag size={32} />
                <Text fw={500}>Tags</Text>
                <Text size="xl" fw={700}>
                  {tagStats?.total || 0}
                </Text>
                <Text size="sm" c="dimmed">
                  Organization labels
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={4}>
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Stack align="center">
                <IconUser size={32} />
                <Text fw={500}>Team Members</Text>
                <Text size="xl" fw={700}>
                  {teamStats?.total || 0}
                </Text>
                <Text size="sm" c="dimmed">
                  Active members
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Quick Actions */}
        <Grid>
          <Grid.Col span={6}>
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Stack>
                <IconList size={32} />
                <Text fw={500}>Tasks</Text>
                <Text size="sm" c="dimmed">
                  Manage your tasks
                </Text>
                <Button
                  component={Link}
                  href="/tasks"
                  leftSection={<IconPlus size={16} />}
                >
                  View Tasks
                </Button>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={6}>
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Stack>
                <IconTag size={32} />
                <Text fw={500}>Tags</Text>
                <Text size="sm" c="dimmed">
                  Organize with tags
                </Text>
                <Button
                  component={Link}
                  href="/tags"
                  leftSection={<IconPlus size={16} />}
                >
                  View Tags
                </Button>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={6}>
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Stack>
                <IconSettings size={32} />
                <Text fw={500}>Settings</Text>
                <Text size="sm" c="dimmed">
                  Account settings
                </Text>
                <Button
                  component={Link}
                  href="/settings"
                  leftSection={<IconSettings size={16} />}
                >
                  Settings
                </Button>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
