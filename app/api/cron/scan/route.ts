/**
 * Cron job endpoint for automated scanning
 * Called by Vercel Cron every 12 hours
 */

import { NextRequest, NextResponse } from 'next/server';
import { runScan } from '@/lib/collectors';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Cron scan triggered');
    const result = await runScan();
    console.log('Cron scan completed:', result);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Cron scan error:', error);
    return NextResponse.json(
      { success: false, error: 'Scan failed' },
      { status: 500 }
    );
  }
}
