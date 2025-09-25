
import { NextResponse } from 'next/server';
import { promoCodes } from '@/lib/mock-data';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ message: 'Coupon code is required' }, { status: 400 });
    }

    // --- Database Query Simulation ---
    const promoCode = promoCodes.find(p => p.code.toUpperCase() === code.toUpperCase());

    if (!promoCode) {
      return NextResponse.json({ message: 'Invalid coupon code.' }, { status: 404 });
    }
    if (promoCode.status !== 'Active') {
      return NextResponse.json({ message: 'This coupon is not currently active.' }, { status: 400 });
    }
    if (new Date(promoCode.expiryDate) < new Date()) {
      return NextResponse.json({ message: 'This coupon has expired.' }, { status: 400 });
    }
    if (promoCode.usage >= promoCode.limit) {
      return NextResponse.json({ message: 'This coupon has reached its usage limit.' }, { status: 400 });
    }
    // --- End Simulation ---

    const response = {
        code: promoCode.code,
        type: promoCode.type,
        value: promoCode.value,
        message: 'Coupon applied successfully!'
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to validate coupon:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
