"use client";

import * as React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Megaphone, X } from "lucide-react";

export function GlobalAlertBanner() {
    // In a real app, these values would be fetched from a global settings API
    // that the admin configures in /admin/settings.
    const alertSettings = {
        showAlert: true,
        title: "Special Announcement!",
        description: "We are running a special monsoon discount on all trips to Goa. Use code MONSOON20 to get 20% off!",
    };

    const [isOpen, setIsOpen] = React.useState(alertSettings.showAlert);
    
    if (!isOpen) {
        return null;
    }

    return (
        <div className="w-full bg-secondary/50 pt-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex flex-col sm:flex-row items-center justify-between rounded-2xl bg-secondary border border-primary/20 text-secondary-foreground shadow-md p-4">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="sm:static absolute top-2 right-2 h-7 w-7 rounded-full text-current/70 transition-colors hover:text-current hover:bg-black/10"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close banner</span>
                    </Button>
                    <div className="flex items-center gap-3 text-center sm:text-left w-full sm:w-auto px-4 sm:px-0">
                         <Megaphone className="h-5 w-5 text-primary flex-shrink-0 hidden sm:block" />
                        <p className="text-sm">
                            <span className="font-bold">{alertSettings.title}</span> {alertSettings.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
