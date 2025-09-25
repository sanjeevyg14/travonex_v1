/**
 * @fileoverview API Route for updating and deleting a specific lead package.
 * @description This is a protected endpoint for admins only.
 *
 * @method PUT - Updates a lead package.
 * @method DELETE - Deletes a lead package.
 */
import { NextResponse } from 'next/server';
import { leadPackages } from '@/lib/mock-data';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const UpdatePackageSchema = z.object({
  name: z.string().min(3, "Package name is required."),
  leadCount: z.coerce.number().min(1),
  price: z.coerce.number().min(0),
  validityDays: z.coerce.number().optional(),
  bonusCredits: z.coerce.number().optional(),
  status: z.enum(['Active', 'Archived']),
});

export async function PUT(
  request: Request,
  { params }: { params: { packageId: string } }
) {
  // --- Auth Check ---
  const { user } = await getSession();
  if (!user || (user.role !== 'Super Admin' && user.role !== 'Operations Manager')) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  
  const { packageId } = params;
  
  try {
    const body = await request.json();
    const validation = UpdatePackageSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json({ message: 'Invalid data', errors: validation.error.formErrors.fieldErrors }, { status: 400 });
    }

    const packageIndex = leadPackages.findIndex(p => p.id === packageId);
    if (packageIndex === -1) {
        return NextResponse.json({ message: 'Package not found' }, { status: 404 });
    }

    // In a real app, this would be an UPDATE query.
    leadPackages[packageIndex] = { ...leadPackages[packageIndex], ...validation.data };
    
    return NextResponse.json(leadPackages[packageIndex]);

  } catch (error) {
    console.error(`Failed to update package ${packageId}:`, error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { packageId: string } }
) {
    // --- Auth Check ---
  const { user } = await getSession();
  if (!user || (user.role !== 'Super Admin' && user.role !== 'Operations Manager')) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  
  const { packageId } = params;
  const packageIndex = leadPackages.findIndex(p => p.id === packageId);

  if (packageIndex === -1) {
    return NextResponse.json({ message: 'Package not found' }, { status: 404 });
  }

  // In a real app, this would be a DELETE query.
  leadPackages.splice(packageIndex, 1);

  return NextResponse.json({ message: 'Package deleted successfully' });
}
