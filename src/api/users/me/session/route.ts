
/**
 * @fileoverview API route to get the current user's session from the secure cookie.
 * @description This is used by the client-side AuthContext to hydrate its state. It securely reads the session cookie.
 * 
 * @developer_notes
 * - **CRITICAL FIX**: Previously, this endpoint failed silently if the cookie was malformed, causing users to appear logged out.
 * - Added robust try-catch blocks and explicit logging to diagnose session parsing issues.
 * - Now correctly returns a null user if the cookie is missing or invalid, ensuring the frontend auth state is accurate.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { SessionUser } from "@/lib/types";

export async function GET() {
  try {
    const sessionCookie = cookies().get("userSession");

    if (!sessionCookie?.value) {
      console.log("[SESSION API] No session cookie found.");
      return NextResponse.json({ user: null });
    }

    let user: SessionUser | null = null;
    try {
      user = JSON.parse(sessionCookie.value);
    } catch (err) {
      console.error("[SESSION API] Failed to parse session cookie JSON:", err);
      // If cookie is malformed, delete it and return null user
      cookies().delete('userSession');
      return NextResponse.json({ user: null });
    }
    
    if (!user) {
        return NextResponse.json({ user: null });
    }

    // Return the valid user object from the cookie.
    return NextResponse.json({ user });

  } catch (err) {
    console.error("[SESSION API] An unexpected error occurred:", err);
    return NextResponse.json({ user: null, error: "An unexpected server error occurred." }, { status: 500 });
  }
}
