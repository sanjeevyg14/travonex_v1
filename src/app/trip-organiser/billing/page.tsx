
/**
 * @fileoverview Organizer Billing & History Page
 * @description Allows organizers to view their lead package purchase history and credit usage history.
 * This page is now protected and dynamically loads data for the logged-in organizer.
 */
"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { organizers, leadPackages } from "@/lib/mock-data";
import type { Organizer, LeadPurchase, LeadUnlock, LeadPackage } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, ShoppingBag } from "lucide-react";
import { BuyLeadsDialog } from "@/components/organizer/BuyLeadsDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuthGuard } from "@/hooks/useAuthGuard";


const HistoryTableSkeleton = () => (
    <>
        {Array.from({ length: 4 }).map((_, i) => (
            <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
            </TableRow>
        ))}
    </>
);

export default function OrganizerBillingPage() {
    const { user: authUser } = useAuthGuard('ORGANIZER');
    const [organizer, setOrganizer] = React.useState<Organizer | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const { toast } = useToast();

    React.useEffect(() => {
        if (authUser) {
            setIsLoading(true);
            // In a real app, this would be an API call: GET /api/organizers/me/billing-details
            setTimeout(() => {
                const fetchedOrganizer = organizers.find(o => o.id === authUser.id);
                setOrganizer(fetchedOrganizer || null);
                setIsLoading(false);
            }, 500);
        }
    }, [authUser]);

    const handlePurchasePackage = (pkg: LeadPackage) => {
        if (!organizer) return;
        
        const newPurchase: LeadPurchase = {
            id: `lph_${Date.now()}`,
            packageId: pkg.id,
            packageName: pkg.name,
            creditsPurchased: pkg.leadCount + (pkg.bonusCredits || 0),
            price: pkg.price,
            createdAt: new Date().toISOString(),
            paymentRef: `pay_${Date.now()}`
        };

        const updatedOrganizer: Organizer = {
            ...organizer,
            leadCredits: { 
                ...organizer.leadCredits, 
                available: organizer.leadCredits.available + newPurchase.creditsPurchased 
            },
            leadPurchaseHistory: [...organizer.leadPurchaseHistory, newPurchase]
        };

        // In a real app, you would send the update to the backend and then refetch the organizer data.
        setOrganizer(updatedOrganizer);
        toast({ title: "Purchase Successful!", description: `${newPurchase.creditsPurchased} credits have been added to your account.` });
    };

    const totalCreditsPurchased = organizer?.leadPurchaseHistory.reduce((acc, p) => acc + p.creditsPurchased, 0) || 0;
    const totalCreditsUsed = organizer?.leadUnlockHistory.reduce((acc, u) => acc + u.cost, 0) || 0;

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
                        Billing & History
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Track your lead package purchases and credit usage.
                    </p>
                </div>
                 <BuyLeadsDialog onPurchase={handlePurchasePackage}>
                    <Button className="mt-4 md:mt-0 w-full md:w-auto"><ShoppingBag className="mr-2"/>Buy More Credits</Button>
                </BuyLeadsDialog>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Lead Credits</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-1/2" /> : (
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold">{organizer?.leadCredits.available ?? 0}</p>
                                <p className="text-sm text-muted-foreground">credits</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Credits Purchased</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                         {isLoading ? <Skeleton className="h-8 w-1/2" /> : (
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold">{totalCreditsPurchased}</p>
                                <p className="text-sm text-muted-foreground">credits</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Credits Used</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                         {isLoading ? <Skeleton className="h-8 w-1/2" /> : (
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold">{totalCreditsUsed}</p>
                                <p className="text-sm text-muted-foreground">credits</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="purchases">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="purchases">Purchase History</TabsTrigger>
                    <TabsTrigger value="usage">Usage History</TabsTrigger>
                </TabsList>
                <TabsContent value="purchases">
                    <Card>
                        <CardHeader>
                            <CardTitle>Purchase History</CardTitle>
                            <CardDescription>A log of all your lead package purchases.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Package</TableHead>
                                        <TableHead>Credits</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Invoice</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? <HistoryTableSkeleton /> : (organizer?.leadPurchaseHistory || []).map(p => (
                                        <TableRow key={p.id}>
                                            <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-medium">{p.packageName}</TableCell>
                                            <TableCell>+{p.creditsPurchased}</TableCell>
                                            <TableCell className="text-right">₹{p.price.toLocaleString('en-IN')}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="icon"><Download className="h-4 w-4"/></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="usage">
                    <Card>
                        <CardHeader>
                            <CardTitle>Credit Usage History</CardTitle>
                            <CardDescription>A log of every credit spent to unlock a lead.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                 <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Unlocked Lead</TableHead>
                                        <TableHead>Trip</TableHead>
                                        <TableHead className="text-right">Cost</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                     {isLoading ? <HistoryTableSkeleton /> : (organizer?.leadUnlockHistory || []).map(u => (
                                        <TableRow key={u.id}>
                                            <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-medium">{u.leadName}</TableCell>
                                            <TableCell className="text-muted-foreground">{u.tripTitle}</TableCell>
                                            <TableCell className="text-right">-{u.cost} credit</TableCell>
                                        </TableRow>
                                     ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

        </main>
    )
}
