

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { SessionUser } from "@/lib/types";

export function useAuthGuard(requiredRole?: 'USER' | 'ORGANIZER' | 'ADMIN') {
  const { user, sessionStatus } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (sessionStatus === 'loading') {
      return;
    }

    if (sessionStatus === 'unauthenticated') {
      const loginPath = requiredRole === 'ADMIN' ? '/auth/login?admin=true' : '/auth/login';
      router.replace(loginPath);
      return;
    }

    if (requiredRole && user) {
      const isAuthorized = requiredRole === 'ADMIN'
        ? !['USER', 'ORGANIZER'].includes(user.role) 
        : user.role === requiredRole;
      
      if (!isAuthorized) {
        router.replace('/');
      }
    }
  }, [sessionStatus, user, requiredRole, router]);

  const loading = sessionStatus === 'loading';
  
  const isAuthorized = !loading && sessionStatus === 'authenticated' && (
      !requiredRole || 
      (requiredRole === 'ADMIN'
          ? user?.role && !['USER', 'ORGANIZER'].includes(user.role)
          : user?.role === requiredRole)
  );

  return {
    loading,
    isAuthorized,
    user: isAuthorized ? (user as SessionUser) : null,
  };
}
