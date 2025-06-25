import { Button } from '@mantine/core';
import { useState } from 'react';
import { GoogleIcon } from './GoogleIcon';
import { useAuthContext } from '../../context/AuthContextProvider';

interface GoogleSignInButtonProps {
  fullWidth?: boolean;
}

export default function GoogleSignInButton({
  fullWidth = false,
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuthContext();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in error:', error);
      setLoading(false);
    }
  };

  return (
    <Button
      leftSection={<GoogleIcon />}
      variant="default"
      fullWidth={fullWidth}
      onClick={handleGoogleSignIn}
      loading={loading}
    >
      Continue with Google
    </Button>
  );
}
