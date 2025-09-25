/**
 * @fileoverview API Route for creating and fetching lead packages.
 * @description This is a protected endpoint for admins only.
 *
 * @method GET - Fetches all lead packages.
 * @method POST - Creates a new lead package.
 */
import { NextResponse } from 'next/server';
import { leadPackages } from '@/lib/mock-data';
import { getSession } from '@/lib/session';
import { z } from 'zod';

// Schema for validating new package creation
const CreatePackageSchema = z.object({
  name: z.string().min(3, "Package name is required."),
  leadCount: z.coerce.number().min(1),
  price: z.coerce.number().min(0),
  validityDays: z.coerce.number().optional(),
  bonusCredits: z.coerce.number().optional(),
  status: z.enum(['Active', 'Archived']),
});

export async function GET(request: Request) {
  // --- Auth Check ---
  const { user } = await getSession();
  if (!user || (user.role !== 'Super Admin' && user.role !== 'Operations Manager')) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  
  // In a real app, this would fetch from a database.
  return NextResponse.json(leadPackages);
}

export async function POST(request: Request) {
  // --- Auth Check ---
  const { user } = await getSession();
  if (!user || (user.role !== 'Super Admin' && user.role !== 'Operations Manager')) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  
  try {
    const body = await request.json();
    const validation = CreatePackageSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid data', errors: validation.error.formErrors.fieldErrors }, { status: 400 });
    }

    const newPackage = {
      id: `pkg_${Date.now()}`,
      ...validation.data,
    };
    
    // In a real app, this would be an INSERT query.
    leadPackages.push(newPackage);
    
    return NextResponse.json(newPackage, { status: 201 });
    
  } catch (error) {
    console.error('Failed to create lead package:', error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
