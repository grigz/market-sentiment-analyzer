/**
 * Entity management API
 * GET: Retrieve all entities
 * POST: Create new entity
 * DELETE: Remove entity
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import type { Entity, ApiResponse } from '@/lib/types';
import { sanitizeEntityName } from '@/lib/utils';

export async function GET() {
  try {
    const entities = await db.getAllEntities();

    return NextResponse.json<ApiResponse<Entity[]>>({
      success: true,
      data: entities,
    });
  } catch (error) {
    console.error('Error fetching entities:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to fetch entities',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type } = body;

    if (!name || !type) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Name and type are required',
        },
        { status: 400 }
      );
    }

    if (type !== 'keyword' && type !== 'company') {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Type must be either "keyword" or "company"',
        },
        { status: 400 }
      );
    }

    const sanitizedName = sanitizeEntityName(name);

    // Check if entity already exists
    const existingEntities = await db.getAllEntities();
    const duplicate = existingEntities.find(
      e => e.name.toLowerCase() === sanitizedName.toLowerCase() && e.type === type
    );

    if (duplicate) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Entity already exists',
        },
        { status: 409 }
      );
    }

    const entity: Entity = {
      id: uuidv4(),
      name: sanitizedName,
      type,
      createdAt: Date.now(),
      enabled: true,
    };

    await db.createEntity(entity);

    return NextResponse.json<ApiResponse<Entity>>({
      success: true,
      data: entity,
    });
  } catch (error) {
    console.error('Error creating entity:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to create entity',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Entity ID is required',
        },
        { status: 400 }
      );
    }

    await db.deleteEntity(id);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting entity:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to delete entity',
      },
      { status: 500 }
    );
  }
}
