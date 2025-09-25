"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cities as mockCities } from "@/lib/mock-data";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Edit, Loader2 } from "lucide-react";
import type { City } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const CityFormSchema = z.object({
  name: z.string().min(2, "City name must be at least 2 characters."),
  enabled: z.boolean(),
});

type CityFormData = z.infer<typeof CityFormSchema>;

export default function AdminCitiesPage() {
  const [cities, setCities] = React.useState<City[]>(mockCities);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCity, setEditingCity] = React.useState<City | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<CityFormData>({
    resolver: zodResolver(CityFormSchema),
  });

  const handleOpenDialog = (city: City | null = null) => {
    setEditingCity(city);
    form.reset({
      name: city?.name || '',
      enabled: city ? city.enabled : true,
    });
    setIsDialogOpen(true);
  };

  const handleStatusToggle = (id: string, newStatus: boolean) => {
    // BACKEND: Call PUT /api/admin/cities/{id} with { enabled: newStatus }
    setCities(cities.map((city) => city.id === id ? { ...city, enabled: newStatus } : city));
    toast({
      title: `City ${newStatus ? "Enabled" : "Disabled"}`,
      description: `The city has been updated successfully.`,
    });
  };

  const handleFormSubmit = async (data: CityFormData) => {
    setIsSaving(true);
    // BACKEND: Call POST or PUT /api/admin/cities
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (editingCity) {
      setCities(cities.map(c => c.id === editingCity.id ? { ...editingCity, ...data } : c));
      toast({ title: "City Updated", description: `"${data.name}" has been updated.` });
    } else {
      const newCity = { id: data.name.toLowerCase().replace(/\s/g, '-'), ...data };
      setCities([...cities, newCity]);
      toast({ title: "City Added", description: `"${data.name}" has been added.` });
    }

    setIsSaving(false);
    setIsDialogOpen(false);
  };

  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">City Management</h1>
            <p className="text-lg text-muted-foreground">Add, edit, and enable or disable cities for trip listings.</p>
          </div>
          <Button size="lg" onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Add City
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Cities</CardTitle>
            <CardDescription>A list of all available cities on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>City Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cities.map((city) => (
                  <TableRow key={city.id}>
                    <TableCell className="font-medium">{city.name}</TableCell>
                    <TableCell><Badge variant={city.enabled ? "default" : "secondary"} className={city.enabled ? "bg-green-600" : ""}>{city.enabled ? "Enabled" : "Disabled"}</Badge></TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-4">
                      <Switch checked={city.enabled} onCheckedChange={(checked) => handleStatusToggle(city.id, checked)} />
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(city)}><Edit className="mr-2 h-4 w-4"/>Edit</Button>
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
            <DialogTitle>{editingCity ? 'Edit City' : 'Add New City'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>City Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="enabled" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel>Enable City</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingCity ? 'Save Changes' : 'Add City'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
