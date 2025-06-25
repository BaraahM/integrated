import supabase from './supabaseClient';

export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      console.error('Error refreshing token:', error);
      return null;
    }

    return data.session?.access_token || null;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    return null;
  }
};

export default refreshAccessToken;
