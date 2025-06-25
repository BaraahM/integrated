import { useState } from 'react';
import { Box } from '@mantine/core';
import TemplateGalleryList, {
  Template,
} from '@/components/molecules/TemplateGalleryList/TemplateGalleryList';
import TemplatePreview from '@/components/molecules/TemplateGalleryPreview/TemplatePreview';

interface TemplateGalleryProps {
  onBack: () => void;
}

const TemplateGallery = ({ onBack }: TemplateGalleryProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );

  return (
    <Box style={{ display: 'flex', height: '100vh' }}>
      <TemplateGalleryList
        onBack={onBack}
        selectedTemplate={selectedTemplate}
        onTemplateSelect={setSelectedTemplate}
      />
      <TemplatePreview selectedTemplate={selectedTemplate} />
    </Box>
  );
};

export default TemplateGallery;
