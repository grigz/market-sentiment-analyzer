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
      mentions = await db.getRecentMentions(168); // 7 days
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

    // Test JSON serialization before sending
    let jsonString;
    try {
      jsonString = JSON.stringify(exportData, null, 2);
    } catch (stringifyError) {
      console.error('JSON stringify error:', stringifyError);
      console.error('Export data sample:', {
        entitiesCount: entities.length,
        mentionsCount: mentions.length,
        insightsCount: insights.flat().length,
        sampleMention: mentions[0],
      });
      throw new Error(`Failed to serialize data: ${stringifyError instanceof Error ? stringifyError.message : 'Unknown'}`);
    }

    return new NextResponse(jsonString, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('JSON export error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Export failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
