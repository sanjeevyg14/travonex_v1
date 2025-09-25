
/**
 * @fileoverview Admin Lead Reports Page
 * @description Provides a dashboard for admins to monitor the performance and revenue of the lead-based model.
 */
"use client";

import * as React from "react";
import { organizers, leadPackages } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, ShoppingBag, Contact, ArrowRightLeft } from "lucide-react";
import type { LeadPurchase, LeadUnlock, Organizer } from "@/lib/types";

// Helper function to aggregate all purchases and unlocks from all organizers
const aggregateAllTransactions = (organizers: Organizer[]) => {
    const allPurchases = organizers.flatMap(o => 
        o.leadPurchaseHistory.map(p => ({ ...p, organizerName: o.name }))
    );
    const allUnlocks = organizers.flatMap(o => 
        o.leadUnlockHistory.map(u => ({ ...u, organizerName: o.name }))
    );
    return { allPurchases, allUnlocks };
};

const ReportsSkeleton = () => (
    <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}><CardHeader><Skeleton className="h-5 w-1/2" /></CardHeader><CardContent><Skeleton className="h-8 w-3/4" /></CardContent></Card>
            ))}
        </div>
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
    </div>
);


export default function AdminLeadsReportsPage() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [allPurchases, setAllPurchases] = React.useState<(LeadPurchase & { organizerName: string })[]>([]);
    const [allUnlocks, setAllUnlocks] = React.useState<(LeadUnlock & { organizerName: string })[]>([]);

    React.useEffect(() => {
        setIsLoading(true);
        // Simulate fetching and processing data
        setTimeout(() => {
            const { allPurchases, allUnlocks } = aggregateAllTransactions(organizers);
            setAllPurchases(allPurchases.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setAllUnlocks(allUnlocks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setIsLoading(false);
        }, 500);
    }, []);

    const totalRevenue = allPurchases.reduce((acc, p) => acc + p.price, 0);
    const totalCreditsPurchased = allPurchases.reduce((acc, p) => acc + p.creditsPurchased, 0);
    const totalCreditsUsed = allUnlocks.reduce((acc, u) => acc + u.cost, 0);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
                    Lead Model Reports
                </h1>
                <p className="text-lg text-muted-foreground">
                    Monitor revenue, package sales, and credit consumption for the lead-based model.
                </p>
            </div>

            {isLoading ? <ReportsSkeleton /> : (
                <div className="space-y-8">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</p>
                                <p className="text-xs text-muted-foreground">From {allPurchases.length} packages sold</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Credits Purchased</CardTitle>
                                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{totalCreditsPurchased}</p>
                                <p className="text-xs text-muted-foreground">Across all organizers</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
                                <Contact className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{totalCreditsUsed}</p>
                                <p className="text-xs text-muted-foreground">To unlock {allUnlocks.length} leads</p>
                            </CardContent>
                        </Card>
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Consumption Rate</CardTitle>
                                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">
                                    {totalCreditsPurchased > 0 ? ((totalCreditsUsed / totalCreditsPurchased) * 100).toFixed(1) : 0}%
                                </p>
                                <p className="text-xs text-muted-foreground">Of all purchased credits</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Lead Package Purchases</CardTitle>
                            <CardDescription>A log of all package purchases across the platform.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Organizer</TableHead>
                                        <TableHead>Package</TableHead>
                                        <TableHead>Credits</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allPurchases.map(p => (
                                        <TableRow key={p.id}>
                                            <TableCell>{new Date(p.createdAt).toLocaleString()}</TableCell>
                                            <TableCell className="font-medium">{p.organizerName}</TableCell>
                                            <TableCell>{p.packageName}</TableCell>
                                            <TableCell>+{p.creditsPurchased}</TableCell>
                                            <TableCell className="text-right font-mono">₹{p.price.toLocaleString('en-IN')}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle>Recent Lead Unlocks</CardTitle>
                            <CardDescription>A log of all credits spent to unlock leads.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Organizer</TableHead>
                                        <TableHead>Lead Unlocked</TableHead>
                                        <TableHead>Trip</TableHead>
                                        <TableHead className="text-right">Cost</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                     {allUnlocks.map(u => (
                                        <TableRow key={u.id}>
                                            <TableCell>{new Date(u.createdAt).toLocaleString()}</TableCell>
                                            <TableCell className="font-medium">{u.organizerName}</TableCell>
                                            <TableCell>{u.leadName}</TableCell>
                                            <TableCell className="text-muted-foreground">{u.tripTitle}</TableCell>
                                            <TableCell className="text-right font-mono">-{u.cost} credit</TableCell>
                                        </TableRow>
                                     ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </main>
    );
}

