import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.bitkub.com/api/servertime', {
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch server time' },
      { status: 500 }
    );
  }
}
