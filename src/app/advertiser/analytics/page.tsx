
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";

export default function AdvertiserAnalyticsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Offer Analytics
        </h1>
        <p className="text-lg text-muted-foreground">
          Track views, claims, and performance of your offers.
        </p>
      </div>

       <Card>
            <CardHeader>
                <CardTitle>Feature Coming Soon!</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground p-12">
                <BarChart2 className="h-16 w-16 mb-4 text-primary" />
                <p className="font-semibold">The Advertiser Analytics page is currently under construction.</p>
            </CardContent>
        </Card>
    </main>
  );
}
