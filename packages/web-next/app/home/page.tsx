'use client';

import { useRouter } from 'next/navigation';
import DocumentEditor from '@/components/templates/DocumentEditor';
import RightPanel from '@/components/organisms/RightPanel/RightPanel';
import { useAuth } from '@/hooks/useAuth';
import RegisterModal from '@/components/molecules/RegisterModal/RegisterModal';
import { Notifications } from '@mantine/notifications';
import { useModalsContext } from '@/context/ModalContext';

const HomePage = () => {
  const router = useRouter();
  const { isModalOpen, closeModal } = useModalsContext();
  const {
    handleRegister,
    isLoading: isRegisterLoading,
    error,
    signInWithOAuth,
  } = useAuth();

  const handleRegisterSuccess = async (email: string, password: string) => {
    try {
      await handleRegister(email, password);
      closeModal('register');
    } catch (err: any) {
      Notifications.show({
        title: 'Sign up failed',
        message: err.message || 'Something went wrong. Please try again.',
        color: 'red',
        autoClose: 3000,
      });
    }
  };

  return (
    <>
      <DocumentEditor />
      <RightPanel
        onExploreTemplates={() => router.push('/home/templates')}
        onUploadDocument={() => {}}
      />
      <RegisterModal
        opened={isModalOpen('register')}
        onClose={() => closeModal('register')}
        onSubmit={handleRegisterSuccess}
        isLoading={isRegisterLoading}
        error={error}
        onOAuthLogin={signInWithOAuth}
      />
    </>
  );
};

export default HomePage;
