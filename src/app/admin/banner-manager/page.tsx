"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
import { homeBanners as mockBanners } from "@/lib/mock-data";
import type { HomeBanner } from "@/lib/types";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const BannerFormSchema = z.object({
  title: z.string().min(3, "Title is required."),
  linkUrl: z.string().url("Please enter a valid URL."),
  isActive: z.boolean(),
  // image upload is handled separately
});

type BannerFormData = z.infer<typeof BannerFormSchema>;

export default function AdminBannerManagerPage() {
  const { toast } = useToast();
  const [banners, setBanners] = React.useState<HomeBanner[]>(mockBanners);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingBanner, setEditingBanner] = React.useState<HomeBanner | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<BannerFormData>({
    resolver: zodResolver(BannerFormSchema),
  });

  const handleOpenDialog = (banner: HomeBanner | null = null) => {
    setEditingBanner(banner);
    form.reset({
      title: banner?.title || '',
      linkUrl: banner?.linkUrl || '',
      isActive: banner ? banner.isActive : true,
    });
    setIsDialogOpen(true);
  };

  const handleStatusToggle = (id: string, newStatus: boolean) => {
    // BACKEND: Call `PUT /api/admin/banners/{id}` with `{ isActive: newStatus }`
    setBanners(banners.map(b => b.id === id ? { ...b, isActive: newStatus } : b));
    toast({ title: `Banner ${newStatus ? 'activated' : 'deactivated'}.` });
  };

  const handleFormSubmit = async (data: BannerFormData) => {
    setIsSaving(true);
    // BACKEND: Call POST or PUT /api/admin/banners
    // Image upload would be handled here, for now we reuse placeholder
    await new Promise(resolve => setTimeout(resolve, 500));

    if (editingBanner) {
      setBanners(banners.map(b => b.id === editingBanner.id ? { ...editingBanner, ...data } : b));
      toast({ title: "Banner Updated" });
    } else {
      const newBanner = {
        id: `banner_${Date.now()}`,
        imageUrl: 'https://placehold.co/1200x400.png', // New banners get a placeholder
        ...data
      };
      setBanners([newBanner, ...banners]);
      toast({ title: "Banner Added" });
    }

    setIsSaving(false);
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    // BACKEND: DELETE /api/admin/banners/{id}
    setBanners(banners.filter(b => b.id !== id));
    toast({ title: "Banner Deleted", variant: 'destructive' });
  };
  
  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
              Content & Banner Manager
              </h1>
              <p className="text-lg text-muted-foreground">
              Manage homepage banners, featured content, and global alerts.
              </p>
          </div>
          <Button size="lg" onClick={() => handleOpenDialog()}><PlusCircle className="mr-2"/> Add Banner</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Homepage Banners</CardTitle>
            <CardDescription>Manage the rotating banners on the main homepage.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map(banner => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <Image src={banner.imageUrl} alt={banner.title} width={120} height={60} className="rounded-md object-cover"/>
                    </TableCell>
                    <TableCell className="font-medium">{banner.title}</TableCell>
                    <TableCell><a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{banner.linkUrl}</a></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch 
                          id={`status-${banner.id}`}
                          checked={banner.isActive}
                          onCheckedChange={(checked) => handleStatusToggle(banner.id, checked)}
                        />
                        <Badge variant={banner.isActive ? 'default' : 'secondary'} className={banner.isActive ? 'bg-green-600' : ''}>
                          {banner.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleOpenDialog(banner)}><Edit className="h-4 w-4"/></Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(banner.id)}><Trash2 className="h-4 w-4"/></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
              <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="linkUrl" render={({ field }) => (<FormItem><FormLabel>Link URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormItem><FormLabel>Image</FormLabel><FormControl><Input type="file" /></FormControl><FormDescription>Upload a new image to replace the current one.</FormDescription></FormItem>
              <FormField control={form.control} name="isActive" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel>Active</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingBanner ? 'Save Changes' : 'Add Banner'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
