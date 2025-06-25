import { Stack, Text, Title } from '@mantine/core';

interface SectionHeaderProps {
  title: string;
  description?: string;
}

export default function SectionHeader({
  title,
  description,
}: SectionHeaderProps) {
  return (
    <Stack gap="xs">
      <Title order={2} size="h2">
        {title}
      </Title>
      {description && (
        <Text size="lg" c="dimmed">
          {description}
        </Text>
      )}
    </Stack>
  );
}
