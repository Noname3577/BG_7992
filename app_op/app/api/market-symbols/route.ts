import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.bitkub.com/api/v3/market/symbols', {
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch market symbols data' },
      { status: 500 }
    );
  }
}
