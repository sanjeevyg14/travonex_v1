
"use client";

import * as React from "react";
import Link from 'next/link';
import { useParams, notFound } from "next/navigation";
import { organizers as mockOrganizers } from "@/lib/mock-data";
import type { Organizer, OrganizerDocument } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, ShieldCheck, ShieldAlert, ShieldX, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const getKycStatusBadgeColor = (status: Organizer['kycStatus']) => {
    switch(status) {
        case 'Verified': return 'bg-green-600';
        case 'Pending': return 'bg-amber-500';
        case 'Rejected': return 'bg-red-600';
        case 'Suspended': return 'bg-slate-700';
        default: return 'bg-gray-500';
    }
}

// A simple dialog to preview a document. In a real app, this would load a PDF or image.
function DocumentPreviewDialog({ doc, isOpen, onOpenChange }: { doc: OrganizerDocument | null; isOpen: boolean; onOpenChange: (open: boolean) => void }) {
    if (!doc) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{doc.docTitle}</DialogTitle>
                    <DialogDescription>
                        Previewing document. In a real app, this would be an embedded PDF/image viewer.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <iframe src={doc.fileUrl} className="w-full h-96 border rounded-md" title={doc.docTitle}></iframe>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function AdvertiserProfilePage() {
    const params = useParams<{ advertiserId: string }>();
    const { advertiserId } = params;
    const initialAdvertiser = mockOrganizers.find(o => o.id === advertiserId);
    
    if (!initialAdvertiser) {
        notFound();
    }

    const { toast } = useToast();
    const [advertiser, setAdvertiser] = React.useState<Organizer>(initialAdvertiser);
    const [isDocPreviewOpen, setIsDocPreviewOpen] = React.useState(false);
    const [selectedDoc, setSelectedDoc] = React.useState<OrganizerDocument | null>(null);

    const handleMainStatusChange = (status: Organizer['kycStatus']) => {
        // BACKEND: Call `PATCH /api/admin/organizers/{advertiserId}/status` with { kycStatus: status }
        setAdvertiser(prev => ({...prev, kycStatus: status}));
        toast({ title: `Advertiser ${status}`, description: `${advertiser.name}'s profile has been updated.` });
    };

    const handlePreviewDoc = (doc: OrganizerDocument) => {
        setSelectedDoc(doc);
        setIsDocPreviewOpen(true);
    };

    return (
        <>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Link href="/admin/advertiser-management" className="flex items-center gap-2 text-sm text-muted-foreground hover:underline">
                <ArrowLeft className="h-4 w-4" />
                Back to All Advertisers
            </Link>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl">{advertiser.name}</CardTitle>
                                    <CardDescription>ID: {advertiser.id} &bull; Joined: {advertiser.joinDate}</CardDescription>
                                </div>
                                <Badge className={getKycStatusBadgeColor(advertiser.kycStatus)}>{advertiser.kycStatus}</Badge>
                            </div>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Business Information</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-3">
                            <p><strong>Business Type:</strong> {advertiser.organizerType || 'N/A'}</p>
                            <p><strong>Email:</strong> {advertiser.email}</p>
                            <p><strong>Phone:</strong> {advertiser.phone || 'N/A'}</p>
                            <p><strong>Address:</strong> {advertiser.address || 'N/A'}</p>
                            <p><strong>GSTIN:</strong> {advertiser.gstin || 'N/A'}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Verification Documents</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {advertiser.documents.map(doc => (
                                     <div key={doc.docType} className="flex items-center justify-between p-3 border rounded-lg">
                                        <p className="font-medium">{doc.docTitle}</p>
                                        <Button variant="outline" size="sm" onClick={() => handlePreviewDoc(doc)} disabled={!doc.fileUrl}>
                                            <Eye className="mr-2 h-4 w-4"/>View Document
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-8 sticky top-24">
                     <Card>
                        <CardHeader><CardTitle>Admin Actions</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                             <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleMainStatusChange('Verified')}><ShieldCheck className="mr-2"/>Approve & Verify</Button>
                             <Button variant="destructive" className="w-full" onClick={() => handleMainStatusChange('Rejected')}><ShieldX className="mr-2"/>Reject Application</Button>
                        </CardContent>
                        <CardFooter>
                            <p className="text-xs text-muted-foreground">Approving this advertiser will allow them to log in and start creating offers.</p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </main>
        <DocumentPreviewDialog doc={selectedDoc} isOpen={isDocPreviewOpen} onOpenChange={setIsDocPreviewOpen} />
        </>
    )
}
