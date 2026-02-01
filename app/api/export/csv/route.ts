/**
 * CSV Export API
 * GET: Export mentions as CSV
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import Papa from 'papaparse';
import { formatDate } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId');

    let mentions;
    if (entityId) {
      mentions = await db.getMentionsByEntity(entityId);
    } else {
      mentions = await db.getRecentMentions(48);
    }

    // Transform mentions to CSV format
    const csvData = mentions.map(m => ({
      Entity: m.entityName,
      Type: m.entityType,
      Source: m.source,
      Platform: m.platform,
      Author: m.author,
      Sentiment: m.sentiment,
      Score: m.sentimentScore,
      Content: m.content,
      URL: m.url,
      Published: formatDate(m.publishedAt),
      Tags: m.tags.join(', '),
    }));

    const csv = Papa.unparse(csvData);

    const filename = `sentiment-export-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json(
      { success: false, error: 'Export failed' },
      { status: 500 }
    );
  }
}
