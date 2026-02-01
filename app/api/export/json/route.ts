/**
 * JSON Export API
 * GET: Export all data as JSON
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId');

    const entities = await db.getAllEntities();

    let mentions;
    if (entityId) {
      mentions = await db.getMentionsByEntity(entityId);
    } else {
      mentions = await db.getRecentMentions(48);
    }

    // Get insights for all companies
    const insights = await Promise.all(
      entities
        .filter(e => e.type === 'company')
        .map(e => db.getInsightsByCompany(e.id))
    );

    const exportData = {
      exportedAt: new Date().toISOString(),
      entities,
      mentions,
      insights: insights.flat(),
    };

    const filename = `sentiment-export-${new Date().toISOString().split('T')[0]}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('JSON export error:', error);
    return NextResponse.json(
      { success: false, error: 'Export failed' },
      { status: 500 }
    );
  }
}
