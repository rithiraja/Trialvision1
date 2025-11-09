import { getSupabaseClient } from './client';

const supabase = getSupabaseClient();

/**
 * Gets a fresh access token from the current session
 * This ensures we always use a valid, non-expired token
 */
export async function getFreshAccessToken(): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session for fresh token:', error);
      return null;
    }
    
    if (data.session?.access_token) {
      return data.session.access_token;
    }
    
    console.warn('No active session found');
    return null;
  } catch (err) {
    console.error('Exception getting fresh access token:', err);
    return null;
  }
}

/**
 * Refreshes the current session and returns a new access token
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Error refreshing session:', error);
      return null;
    }
    
    if (data.session?.access_token) {
      return data.session.access_token;
    }
    
    return null;
  } catch (err) {
    console.error('Exception refreshing access token:', err);
    return null;
  }
}
