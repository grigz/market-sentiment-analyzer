/**
 * Scan API - Trigger data collection
 * POST: Run scan for all enabled entities
 */

import { NextRequest, NextResponse } from 'next/server';
import { runScan } from '@/lib/collectors';
import { verifyScanAuth } from '@/lib/auth';
import type { ApiResponse, ScanResult } from '@/lib/types';

export async function POST(request: NextRequest) {
  // Verify authorization if SCAN_PASSWORD is set
  const authHeader = request.headers.get('authorization');
  if (!verifyScanAuth(authHeader)) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Unauthorized',
      },
      { status: 401 }
    );
  }

  try {
    console.log('Starting scan...');
    const result = await runScan();
    console.log('Scan completed:', result);

    return NextResponse.json<ApiResponse<ScanResult>>({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Scan failed',
      },
      { status: 500 }
    );
  }
}
