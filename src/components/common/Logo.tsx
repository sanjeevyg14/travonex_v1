
import { Plane } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-2xl font-bold text-foreground", className)}>
      <Plane className="h-7 w-7 text-primary" />
      <span className="font-headline">Travonex</span>
    </div>
  );
}
