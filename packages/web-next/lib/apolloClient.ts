import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import supabase from './supabaseClient';
import refreshAccessToken from './refreshAccessToken';

// Use Next.js environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const RESIGN_IN = 'RESIGN_IN';

const httpLink = createHttpLink({
  uri:
    process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://localhost:4000/graphql',
});

const authLink = setContext(async (_, { headers }) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        );
      });
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`);

      // Check if it's a server error with status code
      if ('statusCode' in networkError && networkError.statusCode === 401) {
        refreshAccessToken()
          .then(() => {
            return forward(operation);
          })
          .catch((refreshError) => {
            console.error('Failed to refresh token:', refreshError);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent(RESIGN_IN));
            }
          });
      }
    }
  },
);

const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      // Add cache policies here if needed
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default apolloClient;
