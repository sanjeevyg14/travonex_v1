

/**
 * @fileoverview Trip Organizer Profile & Onboarding Page
 * 
 * @description
 * This page serves as the central hub for Trip Organizers to manage their profile,
 * complete KYC verification, and submit necessary documents, including the vendor agreement.
 * Access to trip listing features is gated by the completion and verification of this information.
 * 
 * @developer_notes
 * - **Component Structure**: The page is divided into logical cards: Profile Info, KYC Documents, and Vendor Agreement.
 * - **State Management**: Uses `react-hook-form` for the main profile form to handle state, validation, and submission, which is a best practice for complex forms. `useState` is used for simpler UI state like dialog visibility.
 * - **Backend API Integration Points**:
 *   - **Profile Save**: `PUT /api/organizers/{organizerId}/profile` to save business and contact information.
 *   - **Document Upload**: `POST /api/organizers/{organizerId}/documents` with `{ docType, fileUrl }` for KYC docs.
 *   - **Agreement Upload**: `POST /api/organizers/{organizerId}/agreement` with the signed PDF URL.
 *   - **Submit for Verification**: `POST /api/organizers/{organizerId}/submit-for-verification`, which should only be possible after all docs and the agreement are uploaded. This changes the organizer's `kycStatus` to 'Pending' on the backend, which locks the profile and notifies admins.
 * - **Gating Logic**: The UI uses `kycStatus` and `vendorAgreementStatus` flags to conditionally render banners, disable buttons, and guide the organizer through the onboarding process. The backend must enforce these gates to prevent unverified organizers from listing trips.
 * - **Email Integration**: The backend should trigger an email with the pre-filled agreement PDF to the organizer's registered email once their profile is complete.
 */
"use client";

// React hooks for state and form management
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// UI components from ShadCN
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, CheckCircle, AlertCircle, FileText, Download, ShieldCheck, ShieldAlert, ShieldX, Eye, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Custom hooks and mock data
import { useToast } from "@/hooks/use-toast";
import { organizers } from "@/lib/mock-data";
import type { Organizer, OrganizerDocument } from "@/lib/types";


// DEV_COMMENT: Represents the data schema for the organizer's editable profile information.
// This Zod schema provides robust client-side validation and should be kept in sync with backend validation rules
// for the `organizers` collection/table to ensure data integrity.
const ProfileFormSchema = z.object({
  name: z.string().min(3, "Business name is required"),
  organizerType: z.enum(['Individual', 'Sole Proprietorship', 'Private Limited', 'LLP', 'Other'], { required_error: "Please select an organizer type" }),
  phone: z.string().min(10, "A valid phone number is required"),
  address: z.string().min(10, "A valid address is required"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  experience: z.coerce.number().min(0, "Experience must be a positive number"),
  specializations: z.array(z.string()).min(1, "Select at least one specialization"),
  // DEV_COMMENT: START - Fields required for Vendor Agreement generation.
  // These fields are crucial for pre-filling legal documents.
  authorizedSignatoryName: z.string().min(3, "Signatory name is required"),
  authorizedSignatoryId: z.string().min(5, "A valid ID (e.g., PAN) is required"),
  emergencyContact: z.string().min(10, "A valid emergency contact number is required"),
  // DEV_COMMENT: END - Fields required for Vendor Agreement
});

type ProfileFormData = z.infer<typeof ProfileFormSchema>;

// DEV_COMMENT: A simple dialog to preview a document. In a real app, this would use a more robust
// PDF or image viewer library instead of a basic iframe.
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

// DEV_COMMENT: A helper component to render the status of each required KYC document.
// It handles different states (Pending, Uploaded, Verified, Rejected) to guide the user.
const FileUploadItem = ({ doc, onUpload, onView, disabled }: { doc: OrganizerDocument; onUpload: (docType: string) => void; onView: (doc: OrganizerDocument) => void; disabled: boolean; }) => (
    <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
            <p className="font-medium">{doc.docTitle}</p>
            {/* Display rejection reason if the document was rejected by an admin. */}
            {doc.status === 'Rejected' && doc.rejectionReason && (
                 <p className="text-xs text-destructive mt-1">Reason: {doc.rejectionReason}</p>
            )}
        </div>
        
        <div className="flex items-center gap-2">
            {/* Allow viewing the document if it has been uploaded or verified. */}
            {(doc.status === 'Uploaded' || doc.status === 'Verified') && (
                 <Button variant="ghost" size="sm" onClick={() => onView(doc)}>
                    <Eye className="mr-2 h-4 w-4" /> View
                </Button>
            )}
            {/* Display a "Verified" badge for approved documents. */}
            {doc.status === 'Verified' && (
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <CheckCircle className="h-5 w-5" />
                    <span>Verified</span>
                </div>
            )}
            {/* Display an "Uploaded" status for documents pending admin review. */}
             {doc.status === 'Uploaded' && (
                <div className="flex items-center gap-2 text-blue-600">
                    <FileText className="h-5 w-5" />
                    <span>Uploaded</span>
                </div>
            )}
            {/* Show the "Upload" button if the document is pending or has been rejected. */}
            {(doc.status === 'Pending' || doc.status === 'Rejected') && (
                 <Button variant="outline" size="sm" onClick={() => onUpload(doc.docType)} disabled={disabled}>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload
                </Button>
            )}
        </div>
    </div>
);

// DEV_COMMENT: A helper component for displaying status banners to guide the organizer through the onboarding process.
// This is a key piece of UX to communicate the current state of their application.
const StatusBanner = ({ status }: { status: Organizer['kycStatus'] }) => {
    const banners = {
        Pending: { icon: ShieldAlert, text: 'Your profile and documents are under review. Our team will get back to you shortly.', color: 'bg-amber-100 border-amber-500 text-amber-800' },
        Rejected: { icon: ShieldX, text: 'Your verification was unsuccessful. Please review the feedback on your documents and resubmit.', color: 'bg-red-100 border-red-500 text-red-800' },
        Verified: { icon: ShieldCheck, text: 'Congratulations! Your profile is verified. You can now create and manage trip listings.', color: 'bg-green-100 border-green-500 text-green-800' },
        Incomplete: { icon: ShieldAlert, text: 'Your profile is incomplete. Please fill out all required information and upload documents to submit for verification.', color: 'bg-blue-100 border-blue-500 text-blue-800'}
    };
    const banner = banners[status];
    if (!banner) return null;

    return (
         <div className={`mb-8 flex items-start gap-4 rounded-lg border p-4 ${banner.color}`}>
            <banner.icon className="h-6 w-6 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{banner.text}</p>
        </div>
    )
}

export default function OrganizerProfilePage() {
  const { toast } = useToast();
  // State for the organizer's data. In a real app, this would be fetched from `GET /api/organizers/me`.
  const [organizer, setOrganizer] = React.useState<Organizer>(organizers[0]);
  // State for the document preview dialog
  const [isDocPreviewOpen, setIsDocPreviewOpen] = React.useState(false);
  const [selectedDoc, setSelectedDoc] = React.useState<OrganizerDocument | null>(null);
  // Loading state for the final submission action.
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Initialize react-hook-form with the Zod schema and default values from the organizer data.
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      name: organizer.name || '',
      organizerType: organizer.organizerType || undefined,
      phone: organizer.phone || '',
      address: organizer.address || '',
      website: organizer.website || '',
      experience: organizer.experience || 0,
      specializations: organizer.specializations || [],
      authorizedSignatoryName: organizer.authorizedSignatoryName || '',
      authorizedSignatoryId: organizer.authorizedSignatoryId || '',
      emergencyContact: organizer.emergencyContact || '',
    },
  });

  // Handler for saving the main profile form.
  const handleProfileSave = async (data: ProfileFormData) => {
    // BACKEND_INTEGRATION: This should make a `PUT` request to `/api/organizers/{organizerId}/profile`.
    form.formState.isSubmitting = true;
    console.log("Profile Save Payload:", data);
    await new Promise(resolve => setTimeout(resolve, 300));
    // Update local state to reflect the saved data.
    setOrganizer(prev => ({ ...prev, ...data, isProfileComplete: true }));
    toast({
      title: "Profile Saved!",
      description: "Your business information has been updated. The Vendor Agreement will be sent to your registered email.",
    });
    form.formState.isSubmitting = false;
  };
  
  // Simulates a document upload. In a real app, this would involve a file upload service (e.g., to S3).
  const handleDocumentUpload = (docType: string) => {
    console.log("Uploading document of type:", docType);
    // BACKEND_INTEGRATION: `POST /api/organizers/{id}/documents` with the file and docType.
    setOrganizer(prev => ({
        ...prev,
        documents: prev.documents.map(doc => doc.docType === docType ? { ...doc, status: 'Uploaded', fileUrl: '/invoices/invoice.pdf' } : doc) // Using a mock PDF for preview
    }));
    toast({ title: "Document Uploaded", description: "Your document is now ready for verification." });
  };
  
  // Opens the document preview dialog.
  const handlePreviewDoc = (doc: OrganizerDocument) => {
    setSelectedDoc(doc);
    setIsDocPreviewOpen(true);
  };
  
  // Simulates uploading the signed vendor agreement.
  const handleUploadAgreement = () => {
    // BACKEND_INTEGRATION: `POST /api/organizers/{id}/agreement` with the signed PDF.
    console.log("Uploading signed agreement...");
    setOrganizer(prev => ({ ...prev, vendorAgreementStatus: 'Submitted' }));
    toast({ title: "Agreement Uploaded", description: "Your signed agreement is now ready for verification." });
  };

  // Handles the final submission for verification. Calls the dedicated API endpoint.
  const handleSubmitForVerification = async () => {
    setIsSubmitting(true);
    try {
        // BACKEND_INTEGRATION: This is the API call that triggers the admin verification workflow.
        const response = await fetch(`/api/organizers/${organizer.id}/submit-for-verification`, {
            method: 'POST',
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to submit for verification.');
        }
        // On success, update the local state to 'Pending' and show a toast.
        setOrganizer(prev => ({ ...prev, kycStatus: 'Pending' }));
        toast({ title: "Submitted for Verification", description: "Our team will now review your profile and documents." });
    } catch (error: any) {
        toast({ title: "Submission Failed", description: error.message, variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  };

  // UI Gating Logic: The form is read-only if the profile is pending or already verified.
  const isReadOnly = organizer.kycStatus === 'Pending' || organizer.kycStatus === 'Verified';
  // The submit button is enabled only when all required documents are in a valid state.
  const allDocsUploaded = organizer.documents.every(doc => doc.status === 'Uploaded' || doc.status === 'Verified');
  const isAgreementUploaded = organizer.vendorAgreementStatus === 'Submitted' || organizer.vendorAgreementStatus === 'Verified';

  return (
    <>
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
            Profile &amp; Verification
            </h1>
            <p className="text-lg text-muted-foreground">
            Manage your organizer profile and complete your KYC verification to start listing trips.
            </p>
        </div>

        {/* Display the appropriate status banner based on the organizer's kycStatus. */}
        <StatusBanner status={organizer.kycStatus} />

        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleProfileSave)} className="space-y-8">
                {/* Organizer Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Organizer Information</CardTitle>
                        <CardDescription>
                        Keep your public-facing information and contact details up to date.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Business Name and Logo */}
                        <div className="flex items-center gap-6">
                             <div className="relative">
                                <Image src={organizer.logo || 'https://placehold.co/128x128.png'} alt="Organizer Logo" width={128} height={128} className="rounded-full border" data-ai-hint="company logo"/>
                                <Button size="icon" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full" type="button" disabled={isReadOnly}>
                                    <UploadCloud className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex-grow grid gap-6">
                                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Business / Brand Name</FormLabel><FormControl><Input placeholder="e.g., Himalayan Adventures" {...field} disabled={isReadOnly} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="organizerType" render={({ field }) => (<FormItem><FormLabel>Organizer Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}><FormControl><SelectTrigger><SelectValue placeholder="Select your business type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Individual">Individual</SelectItem><SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem><SelectItem value="Private Limited">Private Limited</SelectItem><SelectItem value="LLP">LLP</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            </div>
                        </div>
                        {/* Contact Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input placeholder="+91..." {...field} disabled={isReadOnly} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name="website" render={({ field }) => (<FormItem><FormLabel>Website URL (Optional)</FormLabel><FormControl><Input placeholder="https://..." {...field} disabled={isReadOnly} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Registered Business Address</FormLabel><FormControl><Textarea placeholder="Enter your full address" {...field} disabled={isReadOnly} /></FormControl><FormMessage /></FormItem>)} />
                        
                        {/* Legal & Emergency Details */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium mb-4">Legal &amp; Emergency Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="authorizedSignatoryName" render={({ field }) => (<FormItem><FormLabel>Authorized Signatory Name</FormLabel><FormControl><Input placeholder="As per PAN card" {...field} disabled={isReadOnly} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="authorizedSignatoryId" render={({ field }) => (<FormItem><FormLabel>Signatory ID (PAN/Aadhaar)</FormLabel><FormControl><Input placeholder="e.g., ABCDE1234F" {...field} disabled={isReadOnly} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="emergencyContact" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Company Emergency Contact</FormLabel><FormControl><Input placeholder="Operations contact number" {...field} disabled={isReadOnly} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                        </div>

                        {/* Experience and Specializations */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="experience" render={({ field }) => (<FormItem><FormLabel>Years of Experience</FormLabel><FormControl><Input type="number" {...field} disabled={isReadOnly} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name="specializations" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Specializations</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Trekking, Wildlife, Adventure"
                                            onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()))}
                                            value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                                            disabled={isReadOnly}
                                            ref={field.ref}
                                        />
                                    </FormControl>
                                    <FormDescription>Separate specializations with a comma.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                             )} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isReadOnly || form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Profile
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
        
        <div className="grid gap-8 md:grid-cols-2">
            {/* KYC Verification Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>KYC Verification</CardTitle>
                        <CardDescription>
                        Upload the required documents for verification.
                        </CardDescription>
                    </div>
                    {/* Dynamically displays the overall KYC status. */}
                    <Badge variant={organizer.kycStatus === "Verified" ? "default" : "secondary"} className={organizer.kycStatus === 'Verified' ? 'bg-green-600' : organizer.kycStatus === 'Rejected' ? 'bg-red-600' : ''}>
                        Status: {organizer.kycStatus}
                    </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                {/* Map over the documents array to render a FileUploadItem for each required document. */}
                {organizer.documents.map(doc => (
                    <FileUploadItem key={doc.docType} doc={doc} onUpload={handleDocumentUpload} onView={handlePreviewDoc} disabled={isReadOnly} />
                ))}
              </CardContent>
            </Card>

            {/* Vendor Agreement Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Vendor Agreement</CardTitle>
                        <CardDescription>
                        Download, sign, and upload the agreement.
                        </CardDescription>
                    </div>
                     <Badge variant={organizer.vendorAgreementStatus === "Verified" ? "default" : "secondary"} className={
                        organizer.vendorAgreementStatus === 'Verified' ? 'bg-green-600' :
                        organizer.vendorAgreementStatus === 'Rejected' ? 'bg-red-600' :
                        organizer.vendorAgreementStatus === 'Submitted' ? 'bg-blue-600' : ''
                     }>
                        Status: {organizer.vendorAgreementStatus}
                    </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="text-sm text-muted-foreground space-y-2">
                     <p>Please follow these steps to complete your vendor onboarding:</p>
                     <ol className="list-decimal list-inside">
                        <li>Download the Vendor Agreement PDF.</li>
                        <li>Print, review, and sign it physically.</li>
                        <li>Scan and upload the signed copy here.</li>
                        <li>Also reply to the agreement email with the scanned copy attached.</li>
                     </ol>
                 </div>
                 <Button variant="outline" className="w-full" type="button"><Download className="mr-2 h-4 w-4"/>Download Agreement PDF</Button>
                 
                 <div className="space-y-2">
                    <Label htmlFor="agreement-upload" className={isReadOnly ? 'text-muted-foreground' : ''}>Upload Signed Agreement (PDF)</Label>
                    <Input id="agreement-upload" type="file" accept=".pdf" disabled={isReadOnly || organizer.vendorAgreementStatus === 'Submitted'} onChange={handleUploadAgreement}/>
                     {organizer.vendorAgreementStatus === 'Submitted' && <p className="text-sm font-medium text-blue-600">Your agreement has been submitted for review.</p>}
                     {organizer.vendorAgreementStatus === 'Rejected' && <p className="text-sm font-medium text-destructive">Your agreement was rejected. Please re-upload.</p>}
                 </div>
                 
                 <div className="border-t pt-4">
                     <p className="text-sm font-semibold">Need Help? Contact Us:</p>
                     <p className="text-sm text-muted-foreground">Email: vendors@travonex.com</p>
                     <p className="text-sm text-muted-foreground">Address: Travonex Labs Pvt. Ltd., #201, Startup Tower, HSR Layout, Sector 2, Bangalore – 560102, Karnataka, India</p>
                 </div>
              </CardContent>
            </Card>
        </div>

        {/* Final Submission Card */}
        <Card>
            <CardFooter className="pt-6 flex justify-end">
                {/* The "Submit for Verification" button is only enabled when all docs are uploaded and the profile is not already pending/verified. */}
                <Button onClick={handleSubmitForVerification} disabled={!allDocsUploaded || !isAgreementUploaded || isReadOnly || isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isReadOnly ? 'Verification in Progress' : 'Submit for Verification'}
                </Button>
            </CardFooter>
        </Card>
    </main>
    {/* The document preview dialog, which is controlled by component state. */}
    <DocumentPreviewDialog doc={selectedDoc} isOpen={isDocPreviewOpen} onOpenChange={setIsDocPreviewOpen} />
    </>
  );
}
