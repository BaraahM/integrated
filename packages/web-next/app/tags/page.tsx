'use client';

import {
  Stack,
  Text,
  Button,
  Group,
  Container,
  Badge,
  Grid,
  Card,
} from '@mantine/core';
import { IconPlus, IconTag } from '@tabler/icons-react';

export default function TagsPage() {
  const tags = ['React', 'Next.js', 'TypeScript', 'GraphQL', 'Mantine'];

  return (
    <Container size="xl" mt="xl">
      <Stack>
        <Group justify="space-between">
          <Text size="xl" fw={700}>
            Tags
          </Text>
          <Button leftSection={<IconPlus size={16} />}>Add Tag</Button>
        </Group>

        <Grid>
          {tags.map((tag) => (
            <Grid.Col key={tag} span={3}>
              <Card shadow="sm" p="md" radius="md" withBorder>
                <Group>
                  <IconTag size={20} />
                  <Badge variant="light">{tag}</Badge>
                </Group>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
}
