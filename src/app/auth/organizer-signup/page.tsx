
"use client";

import Link from "next/link";
import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";

export default function TripOrganizerSignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // BACKEND: In a real app, you would have a dedicated /api/auth/signup endpoint
    // that creates the user and then returns a session. For this prototype, we'll
    // simulate this by calling the login endpoint after a successful "signup".
    const formData = new FormData(e.currentTarget);
    const signupData = {
        name: formData.get('full-name'),
        phone: formData.get('phone'),
        role: 'ORGANIZER',
    };

    console.log("Simulating ORGANIZER signup, then logging in:", signupData);
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        // Here we call the login API to get a session for the newly "created" user.
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: signupData.phone, credential: '123456', role: signupData.role }),
        });
        
        const data = await res.json();

        if (res.ok) {
            toast({ title: "Account Created!", description: "Please complete your profile to start listing trips." });
            login(data.user, '/trip-organiser/profile'); // Redirect to profile completion
        } else {
            throw new Error(data.message || "Signup failed");
        }

    } catch(error: any) {
        toast({
            variant: 'destructive',
            title: "Signup Failed",
            description: error.message || "Could not create your account.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm shadow-2xl p-2 sm:p-0">
        <form onSubmit={handleSignup}>
        <CardHeader>
            <CardTitle className="text-2xl font-bold">Become a Trip Organizer</CardTitle>
            <CardDescription>
            Join our network of trusted organizers and start listing your trips.
            </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
            <div className="grid gap-2">
            <Label htmlFor="full-name">Your Full Name / Business Name</Label>
            <Input id="full-name" name="full-name" placeholder="e.g., Himalayan Adventures" required />
            </div>
            <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                    <Select defaultValue="+91">
                        <SelectTrigger className="w-[80px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="+91">+91</SelectItem>
                            <SelectItem value="+1">+1</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input id="phone" name="phone" type="tel" placeholder="Your primary contact number" required className="flex-1"/>
                </div>
            </div>
            <div className="flex items-center space-x-2">
            <Checkbox id="terms" required />
            <Label htmlFor="terms" className="text-sm font-normal">
                I agree to the <Link href="/terms" className="underline hover:text-primary">Organizer Terms &amp; Conditions</Link>
            </Label>
            </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <Button size="lg" className="w-full" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Organizer Account
            </Button>
            <p className="text-center text-sm text-muted-foreground">
            Already an organizer?{' '}
            <Link href="/auth/login" className="font-semibold text-primary hover:underline">
                Sign in
            </Link>
            </p>
        </CardFooter>
        </form>
    </Card>
  );
}
