'use client';

import TemplateGallery from '@/components/organisms/TemplateGallery/TemplateGallery';
import { useRouter } from 'next/navigation';

const TemplatesPage = () => {
  const router = useRouter();

  const handleBack = () => {
    router.push('/home');
  };

  return <TemplateGallery onBack={handleBack} />;
};

export default TemplatesPage;
