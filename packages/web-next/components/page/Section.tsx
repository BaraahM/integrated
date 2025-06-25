import { Stack, Text, Box } from '@mantine/core';

interface SectionProps {
  heading: string;
  description?: string;
  children: React.ReactNode;
}

export default function Section({
  heading,
  description,
  children,
}: SectionProps) {
  return (
    <Stack gap="md">
      <Box>
        <Text size="lg" fw={600}>
          {heading}
        </Text>
        {description && (
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        )}
      </Box>
      {children}
    </Stack>
  );
}
