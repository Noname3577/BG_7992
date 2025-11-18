import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.bitkub.com/api/market/ticker', {
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch ticker data' },
      { status: 500 }
    );
  }
}
