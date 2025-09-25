
/**
 * @fileoverview API Route for user, organizer, and admin login.
 * @description This endpoint handles authentication for all roles and sets a secure, httpOnly session cookie.
 *
 * @method POST
 * @endpoint /api/auth/login
 *
 * @body
 * {
 *   "identifier": "string (email or phone number)",
 *   "credential": "string (password or OTP)",
 *   "role": "'USER' | 'ORGANIZER' | 'ADMIN'"
 * }
 *
 * @returns
 * - 200 OK: { user: SessionUser, redirectPath: string }
 * - 401 Unauthorized: { message: "Invalid credentials" }
 * - 500 Internal Server Error
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminUsers, users as mockUsers, organizers as mockOrganizers } from '@/lib/mock-data';
import type { SessionUser } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { identifier, credential, role } = await request.json();

    if (!identifier || !credential || !role) {
      return NextResponse.json({ message: 'Identifier, credential, and role are required' }, { status: 400 });
    }

    let sessionData: SessionUser | null = null;
    let redirectPath = '/';

    // --- Database Logic Simulation ---
    switch (role) {
      case 'ADMIN':
        const admin = adminUsers.find(admin => admin.email === identifier);
        if (admin && credential === 'password') { // Mock password check
            sessionData = { 
                id: admin.id, 
                name: admin.name, 
                email: admin.email, 
                role: 'ADMIN', // Standardize the role to 'ADMIN' for simplicity in guards
                avatar: `https://placehold.co/40x40.png?text=${admin.name.charAt(0)}` 
            };
            redirectPath = '/admin/dashboard';
        }
        break;
      
      case 'ORGANIZER':
        const organizer = mockOrganizers.find(o => o.phone === identifier);
        if (organizer && credential === '123456') { // Mock OTP check
            sessionData = { id: organizer.id, name: organizer.name, email: organizer.email, role: 'ORGANIZER', avatar: `https://placehold.co/40x40.png?text=${organizer.name.charAt(0)}` };
            redirectPath = '/trip-organiser/dashboard';
        }
        break;
        
      case 'USER':
        const regularUser = mockUsers.find(u => u.phone === identifier);
         if (regularUser && credential === '123456') { // Mock OTP check
            sessionData = { id: regularUser.id, name: regularUser.name, email: regularUser.email, role: 'USER', avatar: regularUser.avatar };
            redirectPath = '/';
        }
        break;

      default:
        return NextResponse.json({ message: 'Invalid role specified' }, { status: 400 });
    }
    // --- End of Database Logic ---

    if (sessionData) {
      // Overwrite any old session
      cookies().delete('userSession');
      cookies().set('userSession', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      return NextResponse.json({ user: sessionData, redirectPath });
    } else {
      return NextResponse.json({ message: 'Invalid credentials. Please check your details and try again.' }, { status: 401 });
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
