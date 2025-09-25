

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { SessionUser } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  user: SessionUser | null;
  login: (sessionData: SessionUser, redirectPath: string) => void;
  logout: (preventRedirect?: boolean) => void;
  sessionStatus: SessionStatus;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('loading');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const sessionUser: SessionUser = {
            id: firebaseUser.uid,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            avatar: userData.avatar,
          };
          setUser(sessionUser);
          setSessionStatus("authenticated");
        } else {
           console.warn("[AuthContext] ⚠️ User exists in Auth, but not in Firestore. Logging out.");
           logout(true);
        }
      } else {
        setUser(null);
        setSessionStatus("unauthenticated");
      }
    });

    return () => unsubscribe();
  }, []);

  const login = (sessionData: SessionUser, redirectPath: string) => {
    // The `onAuthStateChanged` listener handles setting the user state.
    // This function's primary job now is to handle the post-login redirect.
    router.push(redirectPath);
  };
  
  const logout = async (preventRedirect = false) => {
    try {
        await signOut(auth);
        if (!preventRedirect) {
          toast({
              title: "Logged Out",
              description: "You have been logged out successfully.",
          });
          router.push('/auth/login');
        }
    } catch (error) {
        console.error("Logout failed:", error);
        toast({
            variant: "destructive",
            title: "Logout Failed",
            description: "Could not log out. Please try again.",
        });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, sessionStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
