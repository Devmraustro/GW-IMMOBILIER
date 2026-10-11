import { NextResponse, type NextRequest } from 'next/server';
import { DatabaseNotConfiguredError, listPublicCatalogRecords } from '@/lib/server/record-repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type');
  if (type !== 'properties' && type !== 'vehicles') {
    return NextResponse.json(
      { error: 'INVALID_CATALOG_TYPE' },
      { status: 400, headers: NO_STORE },
    );
  }

  const rawLimit = Number(request.nextUrl.searchParams.get('limit') ?? '120');
  const limit = Number.isFinite(rawLimit) ? Math.min(250, Math.max(1, Math.trunc(rawLimit))) : 120;

  try {
    const records = await listPublicCatalogRecords(type, limit);
    return NextResponse.json({ type, records, limit }, { headers: NO_STORE });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return NextResponse.json(
        { error: 'CATALOG_NOT_CONFIGURED' },
        { status: 503, headers: NO_STORE },
      );
    }
    console.error('[public-catalog] read failed', {
      errorCode: error && typeof error === 'object' && 'code' in error
        ? String((error as { code?: unknown }).code)
        : 'UNKNOWN',
    });
    return NextResponse.json(
      { error: 'CATALOG_UNAVAILABLE' },
      { status: 503, headers: NO_STORE },
    );
  }
}
