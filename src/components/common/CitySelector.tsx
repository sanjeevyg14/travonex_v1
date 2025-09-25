
'use client';

import { useCity } from '@/context/CityContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';


export function CitySelector({ className }: { className?: string}) {
  const { cities, selectedCity, setSelectedCity } = useCity();

  return (
      <Select value={selectedCity} onValueChange={setSelectedCity}>
        <SelectTrigger className={cn("w-full border shadow-none focus:ring-0", className)}>
          <SelectValue placeholder="Select City" />
        </SelectTrigger>
        <SelectContent>
          {cities.map((city) => (
            <SelectItem key={city.id} value={city.name === 'All Cities' ? 'all' : city.name}>
              {city.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
  );
}
