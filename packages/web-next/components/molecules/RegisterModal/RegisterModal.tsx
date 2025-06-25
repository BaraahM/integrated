import { Modal, Stack, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import Divider from '@/components/atoms/Divider/Divider';
import TermsLinks from '../TermsLinks/TermsLinks';
import Button from '@/components/atoms/Button/Button';
import Input from '@/components/atoms/Input/Input';
import Text from '@/components/atoms/Text/Text';
import { FcGoogle } from 'react-icons/fc';
import { SiMicrosoft } from 'react-icons/si';

export interface RegisterModalProps {
  opened: boolean;
  isLoading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (email: string, password: string) => Promise<void>;
  onOAuthLogin?: (provider: 'google' | 'azure') => void;
}
const PROVIDER_BUTTONS: {
  label: string;
  icon: React.ReactNode;
  provider: 'google' | 'azure';
}[] = [
  { label: 'Google', icon: <FcGoogle size={18} />, provider: 'google' },
  { label: 'Microsoft', icon: <SiMicrosoft size={18} />, provider: 'azure' },
];

const ProviderButton = ({
  label,
  icon,
  provider,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  provider: 'google' | 'azure';
  onClick: (provider: 'google' | 'azure') => void;
}) => (
  <Button
    variant="outline"
    size="md"
    fullWidth
    onClick={() => onClick(provider)}
    leftSection={icon}
    customStyles={{
      borderRadius: '8px',
      height: '40px',
      border: '1px solid var(--mantine-color-gray-3)',
      color: 'var(--mantine-color-gray-8)',
      fontSize: '14px',
      fontWeight: 500,
    }}
    customHoverStyles={{
      backgroundColor: 'var(--mantine-color-gray-0)',
    }}
  >
    Continue with {label}
  </Button>
);

const RegisterModal = ({
  opened,
  onClose,
  onSubmit,
  onOAuthLogin,
  isLoading,
  error,
}: RegisterModalProps) => {
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : 'Please enter a valid email address',
      password: (value) =>
        value.length < 6
          ? 'Your password should have at least 6 characters'
          : null,
    },
  });

  const handleFormSubmit = async (values: typeof form.values) => {
    await onSubmit(values.email, values.password);
    form.reset();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      centered
      size="lg"
      styles={{ content: { padding: '5px 5px', borderRadius: '16px' } }}
    >
      <Stack gap="l" align="center">
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <img
              src="/icons/barum-black-cropped.svg"
              alt="Barum Logo"
              style={{
                height: 50,
                width: 120,
                paddingBottom: 10,
                objectFit: 'contain',
              }}
            />
          </div>
          <Text size="lg" fw={400} c="gray.7">
            Create an account
          </Text>
        </div>

        {error && (
          <Alert color="red" title="Error" style={{ width: '100%' }}>
            {error}
          </Alert>
        )}

        <form
          onSubmit={form.onSubmit(handleFormSubmit)}
          style={{ width: '100%' }}
        >
          <Stack gap="lg">
            <Input
              required
              placeholder="Email Address"
              {...form.getInputProps('email')}
            />
            <Input
              inputType="password"
              required
              placeholder="Password"
              {...form.getInputProps('password')}
            />
            <Button
              size="md"
              loading={isLoading}
              type="submit"
              fullWidth
              customStyles={{
                backgroundColor: 'var(--mantine-color-dark-9)',
                color: 'var(--mantine-color-gray-0)',
                borderRadius: '8px',
                height: '40px',
                fontSize: '14px',
                fontWeight: 500,
              }}
              customHoverStyles={{
                backgroundColor: 'var(--mantine-color-dark-8)',
              }}
            >
              Continue
            </Button>
          </Stack>
        </form>

        <Divider label="OR" w="100%" />

        <Stack gap="md" style={{ width: '100%' }}>
          {PROVIDER_BUTTONS.map((provider) => (
            <ProviderButton
              key={provider.label}
              label={provider.label}
              icon={provider.icon}
              provider={provider.provider}
              onClick={(p) => onOAuthLogin?.(p)}
            />
          ))}
        </Stack>

        <TermsLinks />
      </Stack>
    </Modal>
  );
};

export default RegisterModal;
