'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import supabase from '../lib/supabaseClient';
import SupabaseAuthService, {
  SignInCredentials,
  SignUpCredentials,
} from '../services/SupabaseAuthService';
import { QUERY_GET_ME } from '../api/queries';
import { notifications } from '@mantine/notifications';

interface User {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  avatar?: string;
  role?: string;
  account?: string;
  permissions?: string[];
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (credentials: SignInCredentials) => Promise<any>;
  signUp: (credentials: SignUpCredentials) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'azure') => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const { refetch: refetchUser } = useQuery(QUERY_GET_ME, {
    skip: true,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    onError: (error) => {
      if (
        error.graphQLErrors?.some(
          (e: any) => e.extensions?.code === 'USER_NOT_FOUND',
        )
      ) {
        setIsAuthenticated(false);
        setUser(null);
      }
    },
  });

  const formatUserDetails = (userDetails: any): User | null => {
    if (!userDetails) return null;
    try {
      const { avatar, email, id, firstname, lastname, role, account } =
        userDetails;
      return {
        avatar,
        email,
        id,
        firstname,
        lastname,
        account: account?.id,
        role: role?.name,
        permissions:
          role?.permissions?.map((permission: any) => permission.name) || [],
      };
    } catch (error) {
      return null;
    }
  };

  const signIn = useCallback(
    async (credentials: SignInCredentials) => {
      try {
        setLoading(true);
        setError(null);
        const { session } =
          await SupabaseAuthService.signInWithPassword(credentials);
        if (!session) throw new Error('No session returned from Supabase');

        const result = await refetchUser();
        const userInfo = result.data?.me;
        setIsAuthenticated(!!userInfo);
        setUser(formatUserDetails(userInfo));
        router.push('/home');
        return session;
      } catch (err: any) {
        setError(err.message || 'Failed to sign in');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refetchUser, router],
  );

  const signUp = useCallback(
    async (credentials: SignUpCredentials) => {
      try {
        setLoading(true);
        setError(null);
        setUser(null);
        setIsAuthenticated(false);

        const { session } = await SupabaseAuthService.signUp(credentials);
        if (!session) return null;

        const supabaseUser = await SupabaseAuthService.getCurrentUser();
        if (supabaseUser) {
          setUser({
            id: supabaseUser.id,
            email: credentials.email,
            firstname: credentials.firstname,
            lastname: credentials.lastname,
            avatar: '',
            permissions: [],
            role: undefined,
            account: undefined,
          });
          setIsAuthenticated(true);
          router.push('/home');
        }
        return session;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setUser(null);
      setIsAuthenticated(false);
      await SupabaseAuthService.signOut();
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
      throw err;
    } finally {
      setLoading(false);
      notifications.hide('auth-loading');
      notifications.hide('signing-out');
    }
  }, []);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'azure') => {
    try {
      setLoading(true);
      setError(null);
      await SupabaseAuthService.signInWithOAuth(provider);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (!session) {
          setIsAuthenticated(false);
          setUser(null);
          return;
        }

        setIsAuthenticated(true);
        const result = await refetchUser();
        const userInfo = result.data?.me;

        if (!userInfo) {
          setIsAuthenticated(false);
          setUser(null);
          return;
        }

        setUser(formatUserDetails(userInfo));
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setUser(null);
          return;
        }

        if (event !== 'SIGNED_IN' || !session) return;

        const result = await refetchUser();
        const userInfo = result.data?.me;

        if (!userInfo) {
          setIsAuthenticated(false);
          setUser(null);
          return;
        }

        setUser(formatUserDetails(userInfo));
        setIsAuthenticated(true);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [refetchUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading: loading,
        error,
        signIn,
        signUp,
        signOut,
        signInWithOAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      'useAuthContext must be used within an AuthContextProvider',
    );
  }
  return context;
};
