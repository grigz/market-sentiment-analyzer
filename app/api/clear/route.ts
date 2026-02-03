/**
 * API endpoint to clear all mentions (but keep entities)
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    await db.clearAllMentions();

    return NextResponse.json({
      success: true,
      message: 'All mentions cleared successfully. Entities retained.'
    });
  } catch (error) {
    console.error('Error clearing mentions:', error);
    return NextResponse.json(
      { error: 'Failed to clear mentions' },
      { status: 500 }
    );
  }
}
