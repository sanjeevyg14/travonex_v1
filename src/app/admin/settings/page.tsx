
"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Loader2, Edit, Trash2 } from "lucide-react";
import * as React from 'react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { LeadPackage } from "@/lib/types";

// DEV_COMMENT: Mock data for notification templates
const mockTemplates = [
    { id: 'booking_confirmation', name: 'Booking Confirmation', channel: 'Email & WhatsApp', status: 'Active' },
    { id: 'refund_processed', name: 'Refund Processed', channel: 'Email', status: 'Active' },
    { id: 'trip_cancelled', name: 'Trip Cancelled by Organizer', channel: 'Email & SMS', status: 'Inactive' },
    { id: 'kyc_approved', name: 'Organizer KYC Approved', channel: 'Email', status: 'Active' },
];

// DEV_COMMENT: Schema for the lead package form, enabling admin control.
const LeadPackageFormSchema = z.object({
  name: z.string().min(3, "Package name is required."),
  leadCount: z.coerce.number().min(1, "Lead count must be at least 1."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  validityDays: z.coerce.number().optional(),
  bonusCredits: z.coerce.number().optional(),
  status: z.enum(['Active', 'Archived']),
});

type LeadPackageFormData = z.infer<typeof LeadPackageFormSchema>;

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = React.useState<string | null>(null);
    const [leadPackages, setLeadPackages] = React.useState<LeadPackage[]>([]);
    const [isPackageDialogOpen, setIsPackageDialogOpen] = React.useState(false);
    const [editingPackage, setEditingPackage] = React.useState<LeadPackage | null>(null);

    const packageForm = useForm<LeadPackageFormData>({
        resolver: zodResolver(LeadPackageFormSchema),
    });
    
    const fetchLeadPackages = React.useCallback(async () => {
        try {
            const response = await fetch('/api/admin/lead-packages');
            if (!response.ok) throw new Error('Failed to fetch packages');
            const data = await response.json();
            setLeadPackages(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch lead packages.' });
        }
    }, [toast]);

    React.useEffect(() => {
        fetchLeadPackages();
    }, [fetchLeadPackages]);

    const handleOpenPackageDialog = (pkg: LeadPackage | null = null) => {
        setEditingPackage(pkg);
        packageForm.reset(pkg ? { ...pkg, price: pkg.price } : {
            name: '',
            leadCount: 10,
            price: 0,
            validityDays: 30,
            bonusCredits: 0,
            status: 'Active',
        });
        setIsPackageDialogOpen(true);
    };

    const handlePackageFormSubmit = async (data: LeadPackageFormData) => {
        const isEditMode = !!editingPackage;
        const endpoint = isEditMode ? `/api/admin/lead-packages/${editingPackage.id}` : '/api/admin/lead-packages';
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} package`);
            
            toast({ title: isEditMode ? "Package Updated" : "Package Created" });
            fetchLeadPackages(); // Re-fetch the list
            setIsPackageDialogOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
        }
    };

    const handleDeletePackage = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/lead-packages/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete package');
            
            toast({ title: "Package Deleted", variant: 'destructive' });
            fetchLeadPackages(); // Re-fetch the list
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
        }
    }

    const handleSave = async (section: string) => {
        setIsSaving(section);
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsSaving(null);
        toast({
            title: "Settings Saved",
            description: `Your changes to the ${section} section have been saved.`,
        });
    }

  return (
    <>
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Platform Settings
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage and configure all aspects of the Travonex platform.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full flex flex-col md:flex-row gap-8">
        <TabsList className="w-full md:w-48 flex-shrink-0 flex-col h-auto justify-start">
          <TabsTrigger value="general" className="w-full justify-start">General</TabsTrigger>
          <TabsTrigger value="leads" className="w-full justify-start">Leads &amp; Packages</TabsTrigger>
          <TabsTrigger value="legal" className="w-full justify-start">Legal</TabsTrigger>
          <TabsTrigger value="referrals" className="w-full justify-start">Referrals & Tax</TabsTrigger>
          <TabsTrigger value="notifications" className="w-full justify-start">Notifications</TabsTrigger>
          <TabsTrigger value="security" className="w-full justify-start">Security</TabsTrigger>
        </TabsList>

        <div className="flex-grow w-full">
            <TabsContent value="general" className="mt-0 space-y-6">
            <Card>
                <CardHeader>
                <CardTitle>Platform Defaults</CardTitle>
                <CardDescription>Manage general platform configurations and contact information.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="support-email">Support Email</Label>
                    <Input id="support-email" type="email" defaultValue="support@travonex.com" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="support-phone">Support Phone</Label>
                    <Input id="support-phone" type="tel" defaultValue="+91 12345 67890" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="platform-fee">Default Commission (%)</Label>
                    <Input id="platform-fee" type="number" defaultValue="10" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="currency-format">Currency</Label>
                    <Select defaultValue="INR">
                    <SelectTrigger id="currency-format"><SelectValue placeholder="Select currency" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                </CardContent>
                <CardFooter>
                <Button onClick={() => handleSave('general')} disabled={!!isSaving}>
                    {isSaving === 'general' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Platform Defaults
                </Button>
                </CardFooter>
            </Card>
            
            <Card>
                <CardHeader>
                <CardTitle>Global Alert Banner</CardTitle>
                <CardDescription>Manage the announcement banner displayed at the top of the user-facing site.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                    <Label htmlFor="enable-banner" className="font-medium">Enable Global Banner</Label>
                    <p className="text-sm text-muted-foreground">Toggle the visibility of the banner sitewide.</p>
                    </div>
                    <Switch id="enable-banner" defaultChecked />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="banner-title">Banner Title</Label>
                    <Input id="banner-title" defaultValue="Special Announcement!" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="banner-desc">Banner Description</Label>
                    <Textarea id="banner-desc" defaultValue="We are running a special monsoon discount on all trips to Goa. Use code MONSOON20 to get 20% off!" />
                </div>
                </CardContent>
                <CardFooter>
                <Button onClick={() => handleSave('banner')} disabled={!!isSaving}>
                    {isSaving === 'banner' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Banner Settings
                </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle>Feature Toggles</CardTitle>
                <CardDescription>Enable or disable major features across the platform.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <Label htmlFor="enable-bookings" className="font-medium">Enable Trip Bookings</Label>
                        <Switch id="enable-bookings" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <Label htmlFor="enable-onboarding" className="font-medium">Enable Organizer Onboarding</Label>
                        <Switch id="enable-onboarding" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <Label htmlFor="enable-referrals" className="font-medium">Enable Referral Program</Label>
                        <Switch id="enable-referrals" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <Label htmlFor="enable-reviews" className="font-medium">Enable Reviews & Ratings</Label>
                        <Switch id="enable-reviews" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <Label htmlFor="enable-wallet" className="font-medium">Enable User Wallet</Label>
                        <Switch id="enable-wallet" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4 bg-amber-50 border-amber-200">
                        <Label htmlFor="maintenance-mode" className="font-medium text-amber-900">Enable Maintenance Mode</Label>
                        <Switch id="maintenance-mode" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => handleSave('features')} disabled={!!isSaving}>
                        {isSaving === 'features' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Feature Toggles
                    </Button>
                </CardFooter>
            </Card>
            </TabsContent>
            
            <TabsContent value="leads" className="mt-0">
                <Card>
                    <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        <div>
                            <CardTitle>Lead Packages</CardTitle>
                            <CardDescription>Create and manage lead packages that organizers can purchase.</CardDescription>
                        </div>
                        <Button onClick={() => handleOpenPackageDialog()} className="mt-4 md:mt-0 w-full md:w-auto"><PlusCircle className="mr-2"/> Add Package</Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Package Name</TableHead>
                                    <TableHead>Lead Count</TableHead>
                                    <TableHead>Price (₹)</TableHead>
                                    <TableHead>Validity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leadPackages.map(pkg => (
                                    <TableRow key={pkg.id}>
                                        <TableCell className="font-medium">{pkg.name}</TableCell>
                                        <TableCell>{pkg.leadCount}</TableCell>
                                        <TableCell className="font-sans">₹{pkg.price.toLocaleString('en-IN')}</TableCell>
                                        <TableCell>{pkg.validityDays ? `${pkg.validityDays} days` : 'Lifetime'}</TableCell>
                                        <TableCell><Badge variant={pkg.status === 'Active' ? 'default' : 'secondary'} className={pkg.status === 'Active' ? 'bg-green-600' : ''}>{pkg.status}</Badge></TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="icon" onClick={() => handleOpenPackageDialog(pkg)}><Edit className="h-4 w-4"/></Button>
                                            <Button variant="destructive" size="icon" onClick={() => handleDeletePackage(pkg.id)}><Trash2 className="h-4 w-4"/></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="legal" className="mt-0">
            <Card>
                <CardHeader>
                <CardTitle>Legal Documents</CardTitle>
                <CardDescription>Update the Terms of Service and Privacy Policy. These will be publicly visible.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="terms">Terms of Service</Label>
                    <Textarea id="terms" rows={8} placeholder="Enter your Terms of Service..." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="privacy">Privacy Policy</Label>
                    <Textarea id="privacy" rows={8} placeholder="Enter your Privacy Policy..." />
                </div>
                </CardContent>
                <CardFooter>
                <Button onClick={() => handleSave('legal')} disabled={!!isSaving}>
                    {isSaving === 'legal' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Legal Documents
                </Button>
                </CardFooter>
            </Card>
            </TabsContent>

            <TabsContent value="referrals" className="mt-0 space-y-6">
            <Card>
                <CardHeader>
                <CardTitle>Referral Program</CardTitle>
                <CardDescription>Configure the referral bonus amounts for both the referrer and the new user (referee).</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="referrer-bonus">Referrer Bonus (₹)</Label>
                    <Input id="referrer-bonus" type="number" defaultValue="1500" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="referee-bonus">Referee Signup Bonus (₹)</Label>
                    <Input id="referee-bonus" type="number" defaultValue="750" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="referee-discount">Referee First Booking Discount (%)</Label>
                    <Input id="referee-discount" type="number" defaultValue="10" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="referee-min-booking">Minimum Booking for Referee Discount (₹)</Label>
                    <Input id="referee-min-booking" type="number" defaultValue="5000" />
                </div>
                </CardContent>
                <CardFooter>
                <Button onClick={() => handleSave('referrals')} disabled={!!isSaving}>
                    {isSaving === 'referrals' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Referral Settings
                </Button>
                </CardFooter>
            </Card>
            <Card>
                <CardHeader>
                <CardTitle>Tax Settings</CardTitle>
                <CardDescription>Configure platform-wide tax rates.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
                    <Input id="tax-rate" type="number" defaultValue="5.5" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="gst-number">Company GST Number</Label>
                    <Input id="gst-number" placeholder="e.g., 29ABCDE1234F1Z5" />
                </div>
                </CardContent>
                <CardFooter>
                <Button onClick={() => handleSave('tax')} disabled={!!isSaving}>
                    {isSaving === 'tax' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Tax Settings
                </Button>
                </CardFooter>
            </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-0">
                <Card>
                    <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        <div>
                            <CardTitle>Notification Templates</CardTitle>
                            <CardDescription>Manage the content of automated emails, SMS, and WhatsApp alerts.</CardDescription>
                        </div>
                        <Button className="mt-4 md:mt-0 w-full md:w-auto"><PlusCircle className="mr-2"/> Create Template</Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Template Name</TableHead>
                                    <TableHead>Channels</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockTemplates.map(template => (
                                    <TableRow key={template.id}>
                                        <TableCell className="font-medium">{template.name}</TableCell>
                                        <TableCell>{template.channel}</TableCell>
                                        <TableCell><Switch checked={template.status === 'Active'} /></TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm">Edit</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-0">
            <Card>
                <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage security policies for users and admins.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input id="session-timeout" type="number" defaultValue="60" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="login-lockout">Failed Login Lockout (attempts)</Label>
                    <Input id="login-lockout" type="number" defaultValue="5" />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4 md:col-span-2">
                        <Label htmlFor="enable-2fa" className="font-medium">Enable Two-Factor Authentication (2FA)</Label>
                        <Switch id="enable-2fa" />
                    </div>
                </CardContent>
                <CardFooter>
                <Button onClick={() => handleSave('security')} disabled={!!isSaving}>
                    {isSaving === 'security' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Security Settings
                </Button>
                </CardFooter>
            </Card>
            </TabsContent>
        </div>
      </Tabs>
    </main>
    <Dialog open={isPackageDialogOpen} onOpenChange={setIsPackageDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingPackage ? 'Edit Lead Package' : 'Create New Lead Package'}</DialogTitle>
                <DialogDescription>Define the details for the lead package that organizers can purchase.</DialogDescription>
            </DialogHeader>
            <Form {...packageForm}>
                <form onSubmit={packageForm.handleSubmit(handlePackageFormSubmit)} className="space-y-4 py-4">
                    <FormField control={packageForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Package Name</FormLabel><FormControl><Input placeholder="e.g., Starter Pack" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={packageForm.control} name="leadCount" render={({ field }) => (<FormItem><FormLabel>Lead Credits</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={packageForm.control} name="bonusCredits" render={({ field }) => (<FormItem><FormLabel>Bonus Credits</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={packageForm.control} name="price" render={({ field }) => (<FormItem><FormLabel>Price (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={packageForm.control} name="validityDays" render={({ field }) => (<FormItem><FormLabel>Validity (Days)</FormLabel><FormControl><Input type="number" placeholder="Optional" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={packageForm.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Archived">Archived</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsPackageDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={packageForm.formState.isSubmitting}>
                           {packageForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                           {editingPackage ? 'Save Changes' : 'Create Package'}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
    </>
  );
}
