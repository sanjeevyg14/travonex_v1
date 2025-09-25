
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Eye, Pointer } from "lucide-react";

const stats = [
    { title: "Total Offers", value: "152", icon: AreaChart },
    { title: "Total Views", value: "25,6k", icon: Eye },
    { title: "Total Claims", value: "1,890", icon: Pointer },
]

export default function AdminOffersAnalyticsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Offer Analytics & Revenue
        </h1>
        <p className="text-lg text-muted-foreground">
          Track revenue and performance from the offers module.
        </p>
      </div>

       <Card>
            <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                 <CardDescription>A high-level summary of offer engagement.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {stats.map(stat => {
                   const Icon = stat.icon;
                   return (
                    <div key={stat.title} className="p-6 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                            <Icon className="h-5 w-5 text-muted-foreground"/>
                        </div>
                        <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                   )
               })}
            </CardContent>
        </Card>
    </main>
  );
}
