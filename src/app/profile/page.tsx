
"use client";

import * as React from "react";
import { users } from "@/lib/mock-data";
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
import { Gift, Upload, ArrowRight, ArrowLeft, AlertTriangle, Loader2, Shield } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/datepicker";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { User, WalletTransaction } from "@/lib/types";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const WalletHistorySkeleton = () => (
    <>
        {Array.from({ length: 3 }).map((_, i) => (
            <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
            </TableRow>
        ))}
    </>
);

function ProfilePageSkeleton() {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
    );
}

export default function ProfilePage() {
  const { loading, isAuthorized, user: authUser } = useAuthGuard('USER');
  const [user, setUser] = React.useState<User | null>(null);
  const { toast } = useToast();
  const [dob, setDob] = React.useState<Date | undefined>();
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (isAuthorized && authUser) {
      const fetchedUser = users.find(u => u.id === authUser.id);
      if (fetchedUser) {
        setUser(fetchedUser);
        setDob(fetchedUser.dateOfBirth ? new Date(fetchedUser.dateOfBirth) : undefined);
      }
    }
  }, [isAuthorized, authUser]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
    });
    setIsSaving(false);
  }

  if (loading || !user) {
      return <ProfilePageSkeleton />;
  }
  
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <main className="flex flex-1 flex-col gap-4 py-4 md:gap-8 md:py-8">
        <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
            Your Profile &amp; Wallet
            </h1>
            <p className="text-lg text-muted-foreground">
            Manage your personal information, preferences, and view your wallet activity.
            </p>
        </div>

        <Card>
            <CardHeader className="flex flex-col md:flex-row items-center gap-4 md:gap-6 space-y-0 text-center md:text-left p-4 md:p-6">
                <div className="relative">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person avatar" />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button size="icon" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full">
                        <Upload className="h-4 w-4" />
                        <span className="sr-only">Upload Picture</span>
                    </Button>
                </div>
                <div className="space-y-1">
                    <CardTitle className="text-2xl md:text-3xl">{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
            <Tabs defaultValue="personal" className="w-full">
                <ScrollArea>
                <TabsList className="w-full justify-start h-auto md:h-10">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="address">Address</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                    <TabsTrigger value="wallet">Wallet &amp; Referrals</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                <ScrollBar orientation="horizontal" />
                </ScrollArea>
                
                <TabsContent value="personal" className="pt-6">
                    <div className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="full-name">Full Name</Label>
                                <Input id="full-name" defaultValue={user.name} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" type="tel" defaultValue={user.phone} disabled />
                            </div>
                        </div>
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Profile Information Locked</AlertTitle>
                            <AlertDescription>
                                To update your name, email, or phone number, please contact our support team at <a href="mailto:support@travonex.com" className="font-semibold underline">support@travonex.com</a> with verification proof.
                            </AlertDescription>
                        </Alert>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select defaultValue={user.gender}>
                                    <SelectTrigger id="gender">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Non-binary">Non-binary</SelectItem>
                                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dob">Date of Birth</Label>
                                <DatePicker date={dob} setDate={setDob} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="blood-group">Blood Group (For Emergency Use)</Label>
                                <Select defaultValue={user.bloodGroup}>
                                    <SelectTrigger id="blood-group">
                                        <SelectValue placeholder="Select blood group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A+">A+</SelectItem>
                                        <SelectItem value="A-">A-</SelectItem>
                                        <SelectItem value="B+">B+</SelectItem>
                                        <SelectItem value="B-">B-</SelectItem>
                                        <SelectItem value="AB+">AB+</SelectItem>
                                        <SelectItem value="AB-">AB-</SelectItem>
                                        <SelectItem value="O+">O+</SelectItem>
                                        <SelectItem value="O-">O-</SelectItem>
                                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">This information is used only in case of emergencies during trips. It will never be shared publicly and is stored securely.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emergency-contact">Emergency Contact (General)</Label>
                                <Input id="emergency-contact" type="tel" defaultValue={user.emergencyContact} />
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="address" className="pt-6">
                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="street">Street Address</Label>
                            <Input id="street" defaultValue={user.address?.street} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" defaultValue={user.address?.city} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pincode">Pincode</Label>
                                <Input id="pincode" defaultValue={user.address?.pincode} />
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="preferences" className="pt-6">
                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="interests">Interests</Label>
                            <Textarea id="interests" defaultValue={user.interests?.join(", ")} placeholder="e.g., Hiking, Food, Photography"/>
                            <p className="text-sm text-muted-foreground">Separate interests with a comma.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="travel-style">Travel Style</Label>
                            <Select defaultValue={user.travelPreferences}>
                                <SelectTrigger id="travel-style">
                                    <SelectValue placeholder="Select your travel style" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Budget">Budget</SelectItem>
                                    <SelectItem value="Mid-range">Mid-range</SelectItem>
                                    <SelectItem value="Luxury">Luxury</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="wallet" className="pt-6 space-y-6">
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                            <span className="text-3xl font-bold text-primary">₹</span>
                            <div>
                                <CardTitle>Travel Wallet</CardTitle>
                                <CardDescription>Your available credits.</CardDescription>
                            </div>
                            </CardHeader>
                            <CardContent>
                            <p className="text-3xl font-bold">
                                ₹{user.walletBalance.toLocaleString("en-IN")}
                            </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                            <Gift className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle>Referral Code</CardTitle>
                                <CardDescription>Share and earn credits.</CardDescription>
                            </div>
                            </CardHeader>
                            <CardContent className="flex items-center gap-4">
                            <Input
                                readOnly
                                value={user.referralCode}
                                className="font-mono text-lg"
                            />
                            <Button variant="outline">Copy</Button>
                            </CardContent>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction History</CardTitle>
                            <CardDescription>A log of all your wallet credits and debits.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? <WalletHistorySkeleton /> : (
                                        user.walletTransactions && user.walletTransactions.length > 0 ? (
                                            user.walletTransactions.map(tx => (
                                                <TableRow key={tx.id}>
                                                    <TableCell className="text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</TableCell>
                                                    <TableCell className="font-medium">{tx.description}</TableCell>
                                                    <TableCell><Badge variant="outline">{tx.source}</Badge></TableCell>
                                                    <TableCell className={cn("text-right font-semibold", tx.type === 'Credit' ? 'text-green-600' : 'text-red-600')}>
                                                        <span className="inline-flex items-center gap-1">
                                                            {tx.type === 'Credit' ? <ArrowRight className="h-3 w-3" /> : <ArrowLeft className="h-3 w-3" />}
                                                            ₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                    No transactions yet.
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="pt-6">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Security</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                                    <Shield className="mr-3 h-5 w-5 flex-shrink-0 mt-0.5"/>
                                    <span>Your account is secured with One-Time Password (OTP) login. There are no passwords to manage.</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <h3 className="text-base font-medium">Marketing Emails</h3>
                                        <p className="text-sm text-muted-foreground">Receive updates on new trips and promotions.</p>
                                    </div>
                                    <Switch defaultChecked={user.marketingOptIn} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
            </CardContent>
            <CardFooter className="border-t px-4 md:px-6 py-4">
                <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </CardFooter>
        </Card>
        </main>
    </div>
  );
}
