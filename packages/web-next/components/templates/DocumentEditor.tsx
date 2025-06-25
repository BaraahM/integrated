import { Paper, Group, Box, TextInput } from '@mantine/core';
import { IconSparkles, IconWand } from '@tabler/icons-react';
import Button from '@/components/atoms/Button/Button';
import Text from '@/components/atoms/Text/Text';

const DocumentEditor = () => {
  return (
    <Box
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
      }}
    >
      <Paper
        style={{
          width: '100%',
          maxWidth: 800,
          borderRadius: 8,
          border: '1px solid var(--mantine-color-gray-3)',
          padding: 40,
        }}
        shadow="sm"
      >
        <Group justify="space-between" mb="xl">
          <Text size="xl" fw={600}>
            Welcome, [First Name]
          </Text>
        </Group>

        <TextInput
          placeholder="Draft me an"
          style={{ marginBottom: 20 }}
          styles={{
            input: {
              border: 'none',
              fontSize: '16px',
              padding: 0,
            },
          }}
        />

        <Group justify="space-between" align="center" style={{ marginTop: 20 }}>
          <Button variant="outline" leftSection={<IconSparkles size={16} />}>
            Self-Drafting
          </Button>

          <Button
            iconOnly
            color="var(--mantine-color-white)"
            onClick={() => console.log('Button clicked')}
          >
            <IconWand size={16} />
          </Button>
        </Group>
      </Paper>
    </Box>
  );
};

export default DocumentEditor;
