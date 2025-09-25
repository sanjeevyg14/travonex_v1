

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageCircle, Phone, MapPin } from "lucide-react";

export default function ContactUsPage() {
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <main className="flex flex-1 flex-col items-center gap-8 py-4 md:py-8 font-headline">
        <div className="space-y-2 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Get in Touch
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a question, feedback, or a partnership inquiry? We'd love to hear from you.
            </p>
        </div>

        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                    <CardTitle>Send us a Message</CardTitle>
                    <CardDescription>
                        Fill out the form below and our team will get back to you as soon as possible.
                    </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="john.doe@example.com" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" placeholder="e.g., Question about a trip" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" placeholder="Your message here..." rows={6} />
                    </div>
                    </CardContent>
                    <CardFooter>
                    <Button>Send Message</Button>
                    </CardFooter>
                </Card>
            </div>
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                        <CardDescription>Reach out to us directly.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <a href="tel:+919008114928" className="flex items-center gap-3 hover:text-primary transition-colors">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                            <span>+91 9008114928</span>
                        </a>
                        <a href="mailto:contact@travonex.com" className="flex items-center gap-3 hover:text-primary transition-colors">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <span>contact@travonex.com</span>
                        </a>
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">Wanderlynx Labs LLP</p>
                                <p className="text-muted-foreground">UNIT 101, OXFORD TOWERS, 139, HAL OLD AIRPORT RD, Hulsur Bazaar, Halasuru Traffic Police Station, Bangalore North, Bangalore – 560008, Karnataka, India</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Join our Community</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <a href="https://wa.me/919008114928" target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="mr-2" /> Connect on WhatsApp
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
        </main>
    </div>
  );
}
