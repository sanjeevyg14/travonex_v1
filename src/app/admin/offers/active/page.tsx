/**
 * @fileoverview Admin page to view and manage all active offers.
 * @description This page allows admins to see which offers are currently live on the platform
 * and provides controls to unlist them or manage their sponsored status.
 */
"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { offers as mockOffers } from "@/lib/mock-data";
import type { Offer } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Eye, Trash2, Star } from "lucide-react";
import Link from "next/link";

const getStatusBadgeClass = (status: Offer['status']) => {
    switch (status) {
        case 'Active': return 'bg-green-600';
        case 'Expired': return 'bg-slate-500';
        default: return 'bg-gray-500';
    }
}

export default function AdminOffersActivePage() {
    const [offers, setOffers] = React.useState<Offer[]>(mockOffers.filter(o => o.status === 'Active' || o.status === 'Expired'));
    const { toast } = useToast();

    const handleStatusToggle = (id: string, newStatus: boolean) => {
        // BACKEND: Call to PATCH /api/admin/offers/{id}/status
        const status = newStatus ? 'Active' : 'Expired'; // simplified for toggle
        setOffers(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        toast({ title: `Offer status updated to ${status}.` });
    };

    const handleSponsoredToggle = (id: string, newStatus: boolean) => {
        // BACKEND: Call to PATCH /api/admin/offers/{id}/sponsor
        setOffers(prev => prev.map(o => o.id === id ? { ...o, isSponsored: newStatus } : o));
        toast({ title: `Offer sponsorship status updated.` });
    };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Active Offers
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage all live and expired offers on the platform.
        </p>
      </div>

       <Card>
            <CardHeader>
                <CardTitle>All Active &amp; Expired Offers</CardTitle>
                 <CardDescription>A list of all offers that are or have been live.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Advertiser</TableHead>
                            <TableHead>Offer Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Sponsored</TableHead>
                            <TableHead>Expiry Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {offers.map(offer => (
                            <TableRow key={offer.id}>
                                <TableCell>{offer.advertiserName}</TableCell>
                                <TableCell className="font-medium">{offer.title}</TableCell>
                                <TableCell>
                                    <Badge className={getStatusBadgeClass(offer.status)}>{offer.status}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Switch
                                        checked={offer.isSponsored}
                                        onCheckedChange={(checked) => handleSponsoredToggle(offer.id, checked)}
                                        aria-label="Toggle Sponsored"
                                    />
                                </TableCell>
                                <TableCell>{new Date(offer.validityEndDate).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right space-x-2">
                                     <Link href={`/offers/${offer.slug}`} target="_blank"><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></Link>
                                     <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4"/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </main>
  );
}
