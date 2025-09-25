

"use client";

import * as React from "react";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Loader2, KeyRound, User, Briefcase } from "lucide-react";
import { Suspense } from "react";


function LoginPageComponent() {
  const { login, user, logout, sessionStatus } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [loginRole, setLoginRole] = React.useState<'USER' | 'ORGANIZER' | 'ADMIN' | null>(null);

  const [isLoading, setIsLoading] = React.useState(false);
  
  const showAdminLogin = searchParams.get('admin') === 'true';

  React.useEffect(() => {
    // If the user is already authenticated, redirect them away from the login page.
    if (sessionStatus === 'authenticated' && user) {
        if(user.role === 'ORGANIZER') router.push('/trip-organiser/dashboard');
        else if (user.role !== 'USER') router.push('/admin/dashboard');
        else router.push('/');
    }
  }, [sessionStatus, user, router]);

  React.useEffect(() => {
    if (showAdminLogin) {
      if (user && user.role !== 'ADMIN' && user.role !== 'Super Admin') { 
        logout(true);
      }
      setLoginRole('ADMIN');
    }
  }, [showAdminLogin, user, logout]);
  
  const handleRoleSelect = (role: 'USER' | 'ORGANIZER' | 'ADMIN') => {
    setLoginRole(role);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginRole) return;

    setIsLoading(true);
    
    try {
        const identifier = loginRole === 'ADMIN' ? email : phone;
        const credential = loginRole === 'ADMIN' ? password : otp;

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, credential, role: loginRole }),
        });

        const data = await res.json();

        if (res.ok) {
            toast({ title: "Login Successful" });
            login(data.user, data.redirectPath);
        } else {
            throw new Error(data.message || "Login failed");
        }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: "Login Failed",
            description: error.message || "Invalid credentials. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  if (!loginRole) {
    return (
        <Card className="w-full max-w-sm shadow-2xl p-2 sm:p-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Please select your role to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <Button size="lg" className="w-full justify-start h-14" onClick={() => handleRoleSelect('USER')}><User className="mr-4"/> Sign in as a Traveler</Button>
                <Button size="lg" className="w-full justify-start h-14" variant="outline" onClick={() => handleRoleSelect('ORGANIZER')}><Briefcase className="mr-4"/> Partner Login (Organizer/Advertiser)</Button>
                {showAdminLogin && (
                  <Button size="lg" className="w-full justify-start h-14" variant="secondary" onClick={() => handleRoleSelect('ADMIN')}><KeyRound className="mr-4"/> Sign in as an Admin</Button>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
                    Sign up
                    </Link>
                </p>
            </CardFooter>
        </Card>
      );
  }

  const isPartnerLogin = loginRole === 'ORGANIZER';
  
  return (
    <Card className="w-full max-w-sm shadow-2xl p-2 sm:p-0">
      <form onSubmit={handleLogin}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            { isPartnerLogin ? 'Partner Sign In' : `Sign In as ${loginRole.charAt(0) + loginRole.slice(1).toLowerCase()}` }
          </CardTitle>
          <CardDescription>
            {loginRole === 'ADMIN' ? 'Enter your email and password.' : 'Enter your phone number to receive an OTP.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
            {loginRole === 'ADMIN' ? (
                <>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                         <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <Link href="/auth/forgot-password" className="ml-auto inline-block text-sm underline">
                                Forgot your password?
                            </Link>
                        </div>
                        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                </>
            ) : (
                 <>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="Your phone number" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                         <div className="flex items-center">
                            <Label htmlFor="otp">One-Time Password (OTP)</Label>
                        </div>
                        <Input id="otp" type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" />
                    </div>
                    <Button variant="link" size="sm" type="button" className="p-0 h-auto self-start">Resend OTP</Button>
                </>
            )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button size="lg" className="w-full" type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
          <Button variant="link" onClick={() => {
            const newPath = showAdminLogin ? '/auth/login?admin=true' : '/auth/login';
            router.replace(newPath, {scroll: false}); 
            setLoginRole(null);
          }}>
            Sign in with a different role
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageComponent />
    </Suspense>
  )
}
