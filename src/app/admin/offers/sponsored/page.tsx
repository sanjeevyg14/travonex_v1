/**
 * @fileoverview Admin page to manage sponsored offers.
 * @description Allows admins to view all offers that are currently marked as sponsored,
 * giving them a focused view to manage premium placements.
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
import { Eye, Trash2 } from "lucide-react";
import Link from "next/link";

export default function AdminOffersSponsoredPage() {
    const [sponsoredOffers, setSponsoredOffers] = React.useState<Offer[]>(mockOffers.filter(o => o.isSponsored));
    const { toast } = useToast();

    const handleSponsoredToggle = (id: string, newStatus: boolean) => {
        // BACKEND: Call to PATCH /api/admin/offers/{id}/sponsor
        setSponsoredOffers(prev => prev.map(o => o.id === id ? { ...o, isSponsored: newStatus } : o).filter(o => o.isSponsored));
        toast({ title: `Sponsorship status updated.` });
    };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Sponsored Offers
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage sponsored and featured offer placements.
        </p>
      </div>

       <Card>
            <CardHeader>
                <CardTitle>All Sponsored Offers</CardTitle>
                 <CardDescription>A list of all offers currently marked as sponsored.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Advertiser</TableHead>
                            <TableHead>Offer Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Sponsored</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sponsoredOffers.map(offer => (
                            <TableRow key={offer.id}>
                                <TableCell>{offer.advertiserName}</TableCell>
                                <TableCell className="font-medium">{offer.title}</TableCell>
                                <TableCell>
                                    <Badge className="bg-green-600">{offer.status}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Switch
                                        checked={offer.isSponsored}
                                        onCheckedChange={(checked) => handleSponsoredToggle(offer.id, checked)}
                                        aria-label="Toggle Sponsored"
                                    />
                                </TableCell>
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
