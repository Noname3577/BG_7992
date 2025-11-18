import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const resolution = searchParams.get('resolution') || '60'; // default 1 hour
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    // ถ้าไม่มี from/to ให้ใช้เวลาปัจจุบันย้อนหลัง 24 ชั่วโมง
    const now = Math.floor(Date.now() / 1000);
    const fromTimestamp = from ? parseInt(from) : now - 24 * 60 * 60;
    const toTimestamp = to ? parseInt(to) : now;

    console.log('📊 Fetching chart data:', {
      symbol,
      resolution,
      from: new Date(fromTimestamp * 1000).toISOString(),
      to: new Date(toTimestamp * 1000).toISOString(),
      fromTimestamp,
      toTimestamp,
    });

    const url = `https://api.bitkub.com/tradingview/history?symbol=${symbol}&resolution=${resolution}&from=${fromTimestamp}&to=${toTimestamp}`;
    console.log('🔗 API URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Bitkub API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Bitkub API responded with status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    console.log('✅ Chart data received:', {
      dataPoints: data.t?.length || 0,
      status: data.s,
      hasData: !!data.t && data.t.length > 0,
    });

    // ตรวจสอบว่า API ส่งข้อมูลกลับมาหรือไม่
    if (data.s !== 'ok') {
      console.error('❌ API returned non-ok status:', data);
      return NextResponse.json(
        { error: 'Bitkub API returned error', details: data },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching chart data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch chart data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
