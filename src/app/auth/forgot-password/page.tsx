
"use client";

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
import { ArrowLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
    const { toast } = useToast();
    const [email, setEmail] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSubmitted, setIsSubmitted] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // BACKEND: This would trigger an API call to send a password reset link.
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("Password reset requested for:", email);
        toast({
            title: "Password Reset Link Sent",
            description: "If an account exists with that email, a reset link has been sent.",
        });
        setIsSubmitted(true);
        setIsLoading(false);
    };

    if (isSubmitted) {
        return (
             <Card className="w-full max-w-sm shadow-2xl p-2 sm:p-0">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Check Your Email</CardTitle>
                    <CardDescription>
                        A password reset link has been sent to <strong>{email}</strong> if it's associated with an account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <p className="text-sm text-muted-foreground">
                        Please check your inbox (and spam folder) and follow the instructions to reset your password.
                    </p>
                </CardContent>
                <CardFooter>
                    <Link href="/auth/login" className="w-full">
                        <Button className="w-full">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Sign In
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        )
    }

  return (
    <Card className="w-full max-w-sm shadow-2xl p-2 sm:p-0">
        <form onSubmit={handleSubmit}>
            <CardHeader>
                <CardTitle className="text-2xl font-headline">Forgot Password</CardTitle>
                <CardDescription>
                Enter your email address and we'll send you a link to reset your password.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Link
                </Button>
                <Button variant="link" asChild>
                    <Link href="/auth/login">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Sign In
                    </Link>
                </Button>
            </CardFooter>
        </form>
    </Card>
  );
}
