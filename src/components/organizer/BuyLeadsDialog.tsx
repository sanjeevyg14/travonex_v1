
/**
 * @fileoverview Dialog component for organizers to purchase lead credit packages.
 * @description This component displays available lead packages and simulates a purchase flow.
 */
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { leadPackages } from "@/lib/mock-data";
import type { LeadPackage } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface BuyLeadsDialogProps {
  onPurchase: (pkg: LeadPackage) => void;
  children: React.ReactNode;
}

export function BuyLeadsDialog({ onPurchase, children }: BuyLeadsDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isPurchasing, setIsPurchasing] = React.useState(false);

  const handlePurchase = async (pkg: LeadPackage) => {
    setIsPurchasing(true);
    // In a real app, this would integrate with a payment gateway like Stripe or Razorpay.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onPurchase(pkg);
    setIsPurchasing(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Purchase Lead Credits</DialogTitle>
          <DialogDescription>
            Select a package to add credits to your wallet.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {leadPackages
            .filter((p) => p.status === "Active")
            .map((pkg) => (
              <Card key={pkg.id} className="flex items-center justify-between p-4">
                <div>
                  <h4 className="font-semibold">
                    {pkg.name} ({pkg.leadCount} Credits)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {pkg.bonusCredits ? `+ ${pkg.bonusCredits} bonus credits. ` : ""}
                    {pkg.validityDays ? ` Valid for ${pkg.validityDays} days.` : ""}
                  </p>
                </div>
                <Button
                  onClick={() => handlePurchase(pkg)}
                  disabled={isPurchasing}
                >
                  {isPurchasing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `Buy for ₹${pkg.price}`
                  )}
                </Button>
              </Card>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
