import { useState } from 'react';
import { Box, Stack, ScrollArea, Group, TextInput } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Text from '@/components/atoms/Text/Text';
import Button from '@/components/atoms/Button/Button';
import templatesData from '../../../data/templates.json';

export interface Template {
  id: number;
  name: string;
  category: string;
  content: string;
}

interface TemplateGalleryListProps {
  onBack: () => void;
  selectedTemplate: Template | null;
  onTemplateSelect: (template: Template) => void;
}

const TemplateGalleryList = ({
  onBack,
  selectedTemplate,
  onTemplateSelect,
}: TemplateGalleryListProps) => {
  const getAllTemplates = (): Template[] => {
    return templatesData as Template[];
  };

  const templates = getAllTemplates();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const groupedTemplates = filteredTemplates.reduce<Record<string, Template[]>>(
    (acc, template) => {
      if (!acc[template.category]) acc[template.category] = [];
      acc[template.category].push(template);
      return acc;
    },
    {},
  );

  return (
    <Box
      style={{
        width: 400,
        borderRight: '1px solid var(--mantine-color-gray-3)',
        backgroundColor: 'var(--mantine-color-white)',
      }}
    >
      <Box
        style={{
          padding: 16,
          borderBottom: '1px solid var(--mantine-color-gray-3)',
        }}
      >
        <Group gap="sm" mb="sm">
          <Button
            variant="subtle"
            size="sm"
            onClick={onBack}
            leftSection={<IconArrowLeft size={16} />}
            c="gray.6"
          >
            Template Gallery
          </Button>
        </Group>

        <TextInput
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
          size="sm"
          mt="sm"
          autoComplete="off"
        />
      </Box>

      <ScrollArea style={{ height: 'calc(100vh - 112px)' }}>
        <Box style={{ padding: 16 }}>
          <Stack gap="lg">
            {Object.entries(groupedTemplates).map(
              ([category, categoryTemplates]) => (
                <Box key={category}>
                  <Text size="sm" fw={600} mb="sm" c="gray.6">
                    {category}
                  </Text>
                  <Stack gap="xs">
                    {categoryTemplates.map((template) => (
                      <Button
                        key={template.id}
                        variant={
                          selectedTemplate?.id === template.id
                            ? 'filled'
                            : 'subtle'
                        }
                        color={
                          selectedTemplate?.id === template.id
                            ? 'dark.6'
                            : 'gray.6'
                        }
                        justify="flex-start"
                        fullWidth
                        size="sm"
                        c={
                          selectedTemplate?.id === template.id
                            ? 'white'
                            : 'dark.6'
                        }
                        style={{
                          backgroundColor:
                            selectedTemplate?.id === template.id
                              ? 'var(--mantine-color-dark-6)'
                              : 'transparent',
                          fontWeight:
                            selectedTemplate?.id === template.id ? 500 : 400,
                        }}
                        onClick={() => onTemplateSelect(template)}
                      >
                        {template.name}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              ),
            )}

            {filteredTemplates.length === 0 && (
              <Text
                size="sm"
                c="gray.5"
                mt="md"
                style={{ textAlign: 'center' }}
              >
                No templates found.
              </Text>
            )}
          </Stack>
        </Box>
      </ScrollArea>
    </Box>
  );
};

export default TemplateGalleryList;
