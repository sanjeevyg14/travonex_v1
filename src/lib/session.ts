
/**
 * @fileoverview Server-side session utility.
 * @description This utility reads the httpOnly session cookie to retrieve the current user's data on the server.
 */
import { cookies } from 'next/headers';
import type { SessionUser } from './types';

// Define the shape of the data returned by this utility.
export interface SessionData {
  user?: SessionUser;
}

/**
 * Gets the current user's session from the 'userSession' cookie.
 * This is the single source of truth for server-side session data.
 * @returns {Promise<SessionData>} A promise that resolves to the session data.
 */
export async function getSession(): Promise<SessionData> {
  const sessionCookie = cookies().get('userSession');
  
  if (!sessionCookie?.value) {
    return { user: undefined };
  }

  try {
    const user: SessionUser = JSON.parse(sessionCookie.value);
    return { user };
  } catch (error) {
    console.error('Session parse error:', error);
    // If the cookie is malformed, treat it as logged out.
    // The next successful login will overwrite it.
    return { user: undefined };
  }
}
