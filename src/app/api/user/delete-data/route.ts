import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

type DeletionTarget = 'history' | 'neural_vault_items' | 'ask_dj_questions';

const TARGET_TABLES: DeletionTarget[] = [
  'history',
  'neural_vault_items',
  'ask_dj_questions',
];

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return NextResponse.json({ error: 'Sign in to clear your saved cloud data.' }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Your session has expired. Please sign in again.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const requestedTables = Array.isArray(body?.tables)
      ? body.tables.filter((t: unknown): t is DeletionTarget => typeof t === 'string' && TARGET_TABLES.includes(t as DeletionTarget))
      : TARGET_TABLES;

    const tablesToClear = requestedTables.length > 0 ? requestedTables : TARGET_TABLES;
    const deleted: Record<string, number> = {};
    const skipped: string[] = [];

    for (const table of tablesToClear) {
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq('user_id', user.id)
        .select('id');

      if (error) {
        console.warn(`Data deletion skipped for ${table}:`, error.message);
        skipped.push(table);
      } else {
        deleted[table] = Array.isArray(data) ? data.length : 0;
      }
    }

    return NextResponse.json({
      success: true,
      deleted,
      skipped,
      clearedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('User data deletion error:', error);
    return NextResponse.json({ error: 'Could not clear saved cloud data right now.' }, { status: 500 });
  }
}
