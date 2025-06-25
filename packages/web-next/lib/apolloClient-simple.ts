import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// Use Next.js environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const httpLink = createHttpLink({
  uri: `${API_URL}/graphql`,
});

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default apolloClient;
