import { NextResponse } from 'next/server';
import { parseCanvasCourseUrl, splitIntoPrismCards } from '@/lib/canvas-parser';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('x-canvas-token')?.trim() || '';
    if (!token) {
      return NextResponse.json(
        { error: 'Please connect your Canvas access token first.' },
        { status: 400, headers: { 'Cache-Control': 'no-store, private' } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const courseUrl = typeof body?.courseUrl === 'string' ? body.courseUrl : '';
    const itemType = typeof body?.itemType === 'string' ? body.itemType : 'Page';
    const pageUrl = typeof body?.pageUrl === 'string' ? body.pageUrl : '';
    const contentId = body?.contentId !== undefined ? String(body.contentId) : '';
    const fallbackTitle = typeof body?.title === 'string' ? body.title : 'Canvas Reading';

    const { baseUrl, courseId } = parseCanvasCourseUrl(courseUrl);

    let endpoint = '';
    if (itemType === 'Page' && pageUrl) {
      endpoint = `${baseUrl}/api/v1/courses/${encodeURIComponent(courseId)}/pages/${encodeURIComponent(pageUrl)}`;
    } else if (itemType === 'Assignment' && contentId) {
      endpoint = `${baseUrl}/api/v1/courses/${encodeURIComponent(courseId)}/assignments/${encodeURIComponent(contentId)}`;
    } else if (itemType === 'Discussion' && contentId) {
      endpoint = `${baseUrl}/api/v1/courses/${encodeURIComponent(courseId)}/discussion_topics/${encodeURIComponent(contentId)}`;
    } else {
      return NextResponse.json(
        { error: 'This Canvas item cannot be opened as a reading page directly. Try pasting its text instead.' },
        { status: 400, headers: { 'Cache-Control': 'no-store, private' } },
      );
    }

    const res = await fetch(endpoint, {
      method: 'GET',
      signal: AbortSignal.timeout(15000),
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (res.status === 401) {
      return NextResponse.json(
        { error: 'Your Canvas access token was rejected. Please reconnect your token.' },
        { status: 401, headers: { 'Cache-Control': 'no-store, private' } },
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `Could not load this Canvas reading (status ${res.status}).` },
        { status: 502, headers: { 'Cache-Control': 'no-store, private' } },
      );
    }

    const data = await res.json();
    const title = data?.title || data?.name || fallbackTitle;
    const rawHtml = data?.body || data?.description || data?.message || '';
    const cards = splitIntoPrismCards(title, rawHtml, true);

    if (cards.length === 0) {
      return NextResponse.json(
        {
          title,
          cards: [
            {
              id: 'card-1',
              heading: title,
              text: 'This Canvas item has no written notes (it may be a video or external link). You can open it in Canvas or jump straight to the next topic!',
              wordCount: 25,
            },
          ],
        },
        { status: 200, headers: { 'Cache-Control': 'no-store, private' } },
      );
    }

    return NextResponse.json(
      { title, cards },
      { status: 200, headers: { 'Cache-Control': 'no-store, private' } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Could not load this Canvas page.';
    return NextResponse.json(
      { error: message },
      { status: 400, headers: { 'Cache-Control': 'no-store, private' } },
    );
  }
}
