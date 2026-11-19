import { NextResponse } from 'next/server';
import { parseCanvasCourseUrl, type CanvasTopic } from '@/lib/canvas-parser';

export const dynamic = 'force-dynamic';

type CanvasModuleItem = {
  id: number;
  title?: string;
  type?: string;
  page_url?: string;
  content_id?: number;
  html_url?: string;
};

type CanvasModule = {
  id: number;
  name?: string;
  items?: CanvasModuleItem[];
  items_url?: string;
};

const READABLE_TYPES = new Set(['Page', 'Assignment', 'Discussion']);

function getNextLink(linkHeader: string | null): string | null {
  if (!linkHeader) return null;
  const parts = linkHeader.split(',');
  for (const part of parts) {
    const match = part.match(/<([^>]+)>;\s*rel="next"/i);
    if (match?.[1]) return match[1];
  }
  return null;
}

async function fetchAllCanvasPages<T>(startUrl: string, token: string, allowedOrigin: string, maxPages = 10): Promise<T[]> {
  const results: T[] = [];
  let nextUrl: string | null = startUrl;
  let pagesFetched = 0;

  while (nextUrl && pagesFetched < maxPages) {
    // Ensure pagination never leaves the user's Canvas origin
    if (!nextUrl.startsWith(allowedOrigin)) break;

    const res = await fetch(nextUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(15000),
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = new Error(`CANVAS_HTTP_${res.status}`) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }

    const batch = (await res.json()) as T[];
    if (Array.isArray(batch)) results.push(...batch);

    nextUrl = getNextLink(res.headers.get('link'));
    pagesFetched += 1;
  }

  return results;
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get('x-canvas-token')?.trim() || '';
    if (!token) {
      return NextResponse.json(
        { error: 'Please paste your Canvas personal access token to load your course topics.' },
        { status: 400, headers: { 'Cache-Control': 'no-store, private' } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const courseUrl = typeof body?.courseUrl === 'string' ? body.courseUrl : '';
    const { baseUrl, courseId } = parseCanvasCourseUrl(courseUrl);

    const startUrl = `${baseUrl}/api/v1/courses/${encodeURIComponent(courseId)}/modules?include[]=items&per_page=100`;
    let modules: CanvasModule[];
    try {
      modules = await fetchAllCanvasPages<CanvasModule>(startUrl, token, baseUrl);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 401) {
        return NextResponse.json(
          { error: 'Canvas did not accept that access token. Check that you copied the full token from Account -> Settings -> Approved Integrations.' },
          { status: 401, headers: { 'Cache-Control': 'no-store, private' } },
        );
      }
      if (status === 403 || status === 404) {
        return NextResponse.json(
          { error: 'Could not open that Canvas course. Double-check the course link and make sure your account is enrolled in it.' },
          { status, headers: { 'Cache-Control': 'no-store, private' } },
        );
      }
      return NextResponse.json(
        { error: `Canvas responded with status ${status || 502}. Please try again in a moment.` },
        { status: 502, headers: { 'Cache-Control': 'no-store, private' } },
      );
    }

    const topics: CanvasTopic[] = [];

    for (const mod of modules) {
      const moduleName = mod.name?.trim() || 'Course Module';
      let items = Array.isArray(mod.items) ? mod.items : [];

      // Canvas omits embedded items when a module is large; fetch them via items_url
      if (items.length === 0 && mod.items_url && mod.items_url.startsWith(baseUrl)) {
        try {
          const itemsUrl = mod.items_url.includes('per_page=')
            ? mod.items_url
            : `${mod.items_url}${mod.items_url.includes('?') ? '&' : '?'}per_page=100`;
          items = await fetchAllCanvasPages<CanvasModuleItem>(itemsUrl, token, baseUrl, 5);
        } catch {
          items = [];
        }
      }

      for (const item of items) {
        if (!item.type || !READABLE_TYPES.has(item.type)) continue;
        topics.push({
          id: `${mod.id}-${item.id}`,
          title: item.title?.trim() || 'Untitled Reading',
          moduleName,
          type: item.type as CanvasTopic['type'],
          pageUrl: item.page_url,
          contentId: item.content_id,
          htmlUrl: item.html_url,
        });
      }
    }

    return NextResponse.json(
      {
        courseId,
        baseUrl,
        topics,
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, private' },
      },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Could not reach Canvas right now.';
    return NextResponse.json(
      { error: message },
      { status: 400, headers: { 'Cache-Control': 'no-store, private' } },
    );
  }
}
