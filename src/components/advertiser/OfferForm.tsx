/**
 * @fileoverview OfferForm Component for advertisers.
 * @description A comprehensive form for advertisers to create or edit offers.
 * It mirrors the structure of the TripForm for consistency.
 */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Offer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UploadCloud, PlusCircle, Trash2, Loader2, DollarSign, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DatePicker } from "@/components/ui/datepicker";
import { Label } from "@/components/ui/label";
import { cities as mockCities } from "@/lib/mock-data";


interface OfferFormProps {
  offer?: Offer;
}

const OfferFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  category: z.enum(['Hotel', 'Food', 'Rental', 'Activity'], { required_error: "Please select a category."}),
  city: z.string({ required_error: "Please select a city." }),
  discountType: z.enum(['Percentage', 'Fixed']),
  discountValue: z.coerce.number().min(1, "Discount value must be greater than 0."),
  validityStartDate: z.date(),
  validityEndDate: z.date(),
  termsAndConditions: z.string().min(10, "Terms are required."),
  redemptionInstructions: z.string().min(10, "Redemption instructions are required."),
});

type OfferFormData = z.infer<typeof OfferFormSchema>;

export function OfferForm({ offer }: OfferFormProps) {
  const isEditMode = !!offer;
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [coverImageName, setCoverImageName] = useState<string | null>(null);

  const form = useForm<OfferFormData>({
    resolver: zodResolver(OfferFormSchema),
    defaultValues: {
      title: offer?.title || "",
      description: offer?.description || "",
      category: offer?.category || undefined,
      city: offer?.city || undefined,
      discountType: offer?.discountType || 'Percentage',
      discountValue: offer?.discountValue || 0,
      validityStartDate: offer ? new Date(offer.validityStartDate) : new Date(),
      validityEndDate: offer ? new Date(offer.validityEndDate) : new Date(),
      termsAndConditions: offer?.termsAndConditions || "",
      redemptionInstructions: offer?.redemptionInstructions || "",
    },
  });

  const onSubmit = async (data: OfferFormData) => {
    setIsSaving(true);
    // BACKEND: POST /api/advertiser/offers or PUT /api/advertiser/offers/{id}
    console.log("Offer Submission Payload:", data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: isEditMode ? "Offer Updated" : "Offer Submitted!",
      description: "Your offer has been submitted for admin approval.",
    });

    setIsSaving(false);
    router.push('/advertiser/offers');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Offer Details</CardTitle>
            <CardDescription>Fill in the details for your new promotional offer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Offer Title</FormLabel><FormControl><Input placeholder="e.g., 20% Off All Rooms" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Hotel">Hotel / Resort</SelectItem><SelectItem value="Food">Restaurant / Cafe</SelectItem><SelectItem value="Rental">Vehicle Rental</SelectItem><SelectItem value="Activity">Activity Provider</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe your offer in detail..." {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <FormField control={form.control} name="discountType" render={({ field }) => (<FormItem><FormLabel>Discount Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Percentage">% OFF</SelectItem><SelectItem value="Fixed">₹ OFF</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="discountValue" render={({ field }) => (<FormItem><FormLabel>Discount Value</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a city" /></SelectTrigger></FormControl><SelectContent>{mockCities.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="validityStartDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Valid From</FormLabel><DatePicker date={field.value} setDate={field.onChange} /><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="validityEndDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Valid Until</FormLabel><DatePicker date={field.value} setDate={field.onChange} /><FormMessage /></FormItem>)} />
            </div>
             <FormField control={form.control} name="redemptionInstructions" render={({ field }) => (<FormItem><FormLabel>How to Redeem</FormLabel><FormControl><Textarea placeholder="Explain how a user can claim this offer..." {...field} /></FormControl><FormMessage /></FormItem>)} />
             <FormField control={form.control} name="termsAndConditions" render={({ field }) => (<FormItem><FormLabel>Terms & Conditions</FormLabel><FormControl><Textarea placeholder="List all terms and conditions for this offer..." {...field} /></FormControl><FormMessage /></FormItem>)} />
            
             <FormItem>
                <FormLabel>Cover Image</FormLabel>
                <FormControl>
                    <Label htmlFor="cover-image" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                            {coverImageName ? <p className="text-sm text-foreground font-semibold">{coverImageName}</p> : <p className="text-sm text-muted-foreground">Click to upload image</p>}
                        </div>
                        <Input id="cover-image" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => setCoverImageName(e.target.files?.[0].name || null)} />
                    </Label>
                </FormControl>
            </FormItem>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Save Changes' : 'Submit for Approval'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
