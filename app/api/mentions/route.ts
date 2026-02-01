/**
 * Mentions API
 * GET: Retrieve mentions for entities
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Mention, ApiResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId');
    const hours = parseInt(searchParams.get('hours') || '48');

    let mentions: Mention[];

    if (entityId) {
      mentions = await db.getMentionsByEntity(entityId);
    } else {
      mentions = await db.getRecentMentions(hours);
    }

    return NextResponse.json<ApiResponse<Mention[]>>({
      success: true,
      data: mentions,
    });
  } catch (error) {
    console.error('Error fetching mentions:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to fetch mentions',
      },
      { status: 500 }
    );
  }
}
