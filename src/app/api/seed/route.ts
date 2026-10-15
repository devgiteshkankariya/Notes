import { NextResponse } from 'next/server';
import { resetSeedData } from '@/lib/storage';

export async function POST() {
  try {
    const data = resetSeedData();
    return NextResponse.json({ success: true, message: 'Demo notes restored', ...data });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to reset seed data' }, { status: 500 });
  }
}
