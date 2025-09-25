
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "../ui/datepicker";
import { CitySelector } from "./CitySelector";
import { X, Search as SearchIcon, Calendar, MapPin, Building } from "lucide-react";
import { useCity } from "@/context/CityContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SearchModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SearchModal({ isOpen, onOpenChange }: SearchModalProps) {
    const router = useRouter();
    const { selectedCity } = useCity();
    const [destination, setDestination] = React.useState("");
    const [date, setDate] = React.useState<Date | undefined>();

    const handleSearch = () => {
        const queryParams = new URLSearchParams();
        if (selectedCity && selectedCity !== 'all') {
            queryParams.set('city', selectedCity);
        }
        if (destination) {
            queryParams.set('q', destination);
        }
        if (date) {
            queryParams.set('date', date.toISOString().split('T')[0]);
        }
        onOpenChange(false);
        router.push(`/search?${queryParams.toString()}`);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 m-0 w-screen h-screen max-h-screen block border-0 rounded-none overflow-y-auto">
                <div className="p-4 space-y-6">
                    <DialogHeader className="flex-row items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">Search</DialogTitle>
                        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}><X className="h-5 w-5" /></Button>
                    </DialogHeader>
                    
                    <Tabs defaultValue="trips" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="trips">Trips</TabsTrigger>
                            <TabsTrigger value="offers">Offers</TabsTrigger>
                        </TabsList>
                        <TabsContent value="trips" className="pt-4 space-y-4">
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <div className="pl-10">
                                    <CitySelector />
                                </div>
                            </div>
                            
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    className="pl-10 h-12" 
                                    placeholder="Destination, e.g., 'Goa' or 'Himalayas'"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                />
                            </div>
                            
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <div className="pl-10">
                                    <DatePicker date={date} setDate={setDate} placeholder="Any date" className="h-12 w-full"/>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="offers" className="pt-4">
                            <div className="text-center text-muted-foreground p-8">Offer search is coming soon!</div>
                        </TabsContent>
                    </Tabs>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
                     <Button className="w-full h-12 text-base" onClick={handleSearch}>
                        <SearchIcon className="mr-2 h-5 w-5"/>
                        Search Trips
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
