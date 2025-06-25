import { Box, Stack, Group, ActionIcon } from '@mantine/core';
import { IconSearch, IconUpload, IconTemplate } from '@tabler/icons-react';
import Text from '@/components/atoms/Text/Text';
import Button from '@/components/atoms/Button/Button';

interface RightPanelProps {
  onExploreTemplates: () => void;
  onUploadDocument?: () => void;
}

const RightPanel = ({
  onExploreTemplates,
  onUploadDocument,
}: RightPanelProps) => {
  const frequentlyDraftedItems = [
    { label: 'NDA', type: 'document' },
    { label: 'MOU', type: 'document' },
    { label: 'LOI', type: 'document' },
  ];

  return (
    <Box
      style={{
        width: 300,
        padding: 16,
        borderLeft: '1px solid var(--mantine-color-gray-3)',
      }}
    >
      <Group justify="space-between" mb="md">
        <ActionIcon variant="subtle" size="lg">
          <IconSearch size={20} />
        </ActionIcon>
      </Group>

      <Stack gap="lg">
        <Box>
          <Text fw={600} mb="sm" c="dark.6">
            Continue Editing
          </Text>
          <Text size="sm" c="dimmed">
            No recent documents
          </Text>
        </Box>

        <Box>
          <Text fw={600} mb="sm" c="dark.6">
            Create Document
          </Text>
          <Stack gap="xs">
            <Button
              variant="subtle"
              leftSection={<IconUpload size={16} />}
              justify="flex-start"
              fullWidth
              c="dark.6"
              onClick={onUploadDocument}
            >
              Upload document
            </Button>
            <Button
              variant="subtle"
              leftSection={<IconTemplate size={16} />}
              justify="flex-start"
              fullWidth
              c="dark.6"
              onClick={onExploreTemplates}
            >
              Explore templates
            </Button>
          </Stack>
        </Box>

        <Box>
          <Text fw={600} mb="sm" c="dark.6">
            Frequently Drafted
          </Text>
          <Stack gap="xs">
            {frequentlyDraftedItems.map((item, index) => (
              <Button
                key={index}
                variant="subtle"
                justify="flex-start"
                fullWidth
                c="dark.6"
              >
                + {item.label}
              </Button>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default RightPanel;
