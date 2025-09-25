
"use client";

import * as React from "react";
import Link from "next/link";
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
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { organizers } from "@/lib/mock-data";

export default function AdvertiserLoginPage() {
    const { toast } = useToast();
    const router = useRouter();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // DEV_COMMENT: Simulating a backend call to log in the advertiser.
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const advertiser = organizers.find(o => o.email === email && o.organizerType !== 'Individual');

        if (!advertiser) {
            toast({
                title: "Login Failed",
                description: "No advertiser account found with that email.",
                variant: 'destructive',
            });
            setIsLoading(false);
            return;
        }

        // Check if the advertiser's KYC is verified by an admin.
        if (advertiser.kycStatus !== 'Verified') {
            toast({
                title: "Account Pending Verification",
                description: "Your account is still under review. You will receive a notification once approved.",
                variant: 'default',
                duration: 5000,
            });
            setIsLoading(false);
            return;
        }
        
        // If login and verification are successful, create a session.
        const mockAdvertiserSession = {
            id: advertiser.id, 
            name: advertiser.name, 
            email: advertiser.email, 
            role: 'ORGANIZER', // Advertisers and Organizers share a base role
            avatar: advertiser.logo || `https://placehold.co/40x40.png?text=${advertiser.name.charAt(0)}` 
        };
        // Use the central login function from AuthContext to set the session and redirect.
        login(mockAdvertiserSession, '/advertiser/offers');
        
        setIsLoading(false);
    }

    return (
        <div className="container max-w-lg mx-auto py-8 md:py-12 flex items-center min-h-screen">
            <Card className="w-full">
                <form onSubmit={handleLogin}>
                    <CardHeader>
                        <CardTitle>Advertiser Login</CardTitle>
                        <CardDescription>Access your dashboard to manage offers and view analytics.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="your@business.com" required value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                                <Link href="#" className="ml-auto inline-block text-sm underline">Forgot password?</Link>
                            </div>
                            <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Login
                        </Button>
                         <p className="text-center text-sm text-muted-foreground">
                            Don't have an advertiser account?{' '}
                            <Link href="/advertiser/signup" className="font-semibold text-primary hover:underline">
                            Sign up here
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
