
/**
 * @fileoverview Admin Advertiser Management Page
 * 
 * @description
 * This page allows Superadmins to view all registered advertisers, review their profiles
 * and submitted KYC documents, and approve or reject them. This is separate from Trip Organizers.
 */
"use client";

import * as React from "react";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { organizers as mockOrganizers } from "@/lib/mock-data";
import type { Organizer } from "@/lib/types";
import { Eye } from "lucide-react";

export default function AdminAdvertiserManagementPage() {
  // In a real app, you would filter for organizers who signed up via the advertiser flow.
  // For this mock, we'll assume any organizer with a 'Hotel', 'Food', etc. type is an advertiser.
  const [advertisers, setAdvertisers] = React.useState<Organizer[]>(
      mockOrganizers.filter(o => ['Hotel', 'Restaurant', 'Activity', 'Rental'].includes(o.organizerType || ''))
  );

  const getStatusBadgeClass = (status: Organizer['kycStatus']) => {
    switch(status) {
        case 'Verified': return 'bg-green-600';
        case 'Pending': return 'bg-amber-500';
        case 'Rejected': return 'bg-red-600';
        default: return 'bg-gray-500';
    }
}

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Advertiser Management
        </h1>
        <p className="text-lg text-muted-foreground">
          Approve, manage, and monitor all advertisers on the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Advertisers</CardTitle>
          <CardDescription>A list of all registered advertisers awaiting verification.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Advertiser</TableHead>
                <TableHead>Business Type</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advertisers.map((advertiser) => (
                <TableRow key={advertiser.id}>
                  <TableCell>
                    <div className="font-medium">{advertiser.name}</div>
                    <div className="text-sm text-muted-foreground">{advertiser.email}</div>
                  </TableCell>
                  <TableCell>
                      <Badge variant="outline">{advertiser.organizerType}</Badge>
                  </TableCell>
                   <TableCell>
                    <Badge className={getStatusBadgeClass(advertiser.kycStatus)}>
                        {advertiser.kycStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{advertiser.joinDate}</TableCell>
                  <TableCell className="text-right">
                     <Link href={`/admin/advertiser-management/${advertiser.id}`}>
                        <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                        </Button>
                    </Link>
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
