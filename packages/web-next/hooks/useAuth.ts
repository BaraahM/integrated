import { useAuthContext } from '@/context/AuthContextProvider';
import { useEffect, useMemo, useRef } from 'react';
import { notifications } from '@mantine/notifications';

export function useAuth() {
  const {
    user,
    signUp,
    signOut,
    isAuthenticated,
    isLoading: authLoading,
    error,
    signInWithOAuth,
  } = useAuthContext();

  const username = useMemo(() => {
    if (!user) return null;
    return user.firstname || user.email?.split('@')[0] || null;
  }, [user]);
  const NOTIFICATION_AUTO_CLOSE_MS = 3000;

  const showNotification = (
    title: string,
    message: string,
    color: 'green' | 'blue' | 'red',
  ) => {
    notifications.clean(); // Prevent duplicates
    notifications.show({
      title,
      message,
      color,
      autoClose: NOTIFICATION_AUTO_CLOSE_MS,
    });
  };

  const handleRegister = async (email: string, password: string) => {
    try {
      const session = await signUp({ email, password });
      if (session) {
        return { success: true, username: email.split('@')[0] };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err: any) {
      console.error('Signup failed:', err);
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out failed:', err);
      showNotification(
        'Sign out failed',
        'Failed to sign out. Please try again.',
        'red',
      );
    }
  };

  const handleSignInWithOAuth = async (provider: 'google' | 'azure') => {
    try {
      await signInWithOAuth(provider); // triggers redirect
    } catch (err) {
      console.error('OAuth Sign-in failed:', err);
      showNotification(
        'OAuth Sign-in Failed',
        'Could not sign in with the selected provider.',
        'red',
      );
    }
  };

  const previousAuthRef = useRef<boolean | null>(null);

  // Detect sign-in and sign-out changes to show notifications
  useEffect(() => {
    if (previousAuthRef.current === null) {
      previousAuthRef.current = isAuthenticated;
      return;
    }

    if (previousAuthRef.current !== isAuthenticated) {
      if (isAuthenticated) {
        showNotification(
          'Welcome back!',
          'You have successfully signed in.',
          'green',
        );
      } else {
        showNotification(
          'Signed out',
          'You have been successfully signed out.',
          'blue',
        );
      }
      previousAuthRef.current = isAuthenticated;
    }
  }, [isAuthenticated]);

  return {
    handleRegister,
    handleSignOut,
    username,
    user,
    isAuthenticated,
    isLoading: authLoading,
    error,
    signInWithOAuth: handleSignInWithOAuth,
  };
}
