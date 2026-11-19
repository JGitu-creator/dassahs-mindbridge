import { after, NextResponse } from 'next/server';
import { mergeUsage, type AiUsage } from '@/lib/ai-usage';
import { recordUsage, refundCredits, reserveCredits, type QuotaReservation } from '@/lib/ai-quota';
import { logShadowTelemetry, runShadowProbe } from '@/lib/server/shadow-mode';
import { createInstantLocalPrism } from '@/lib/canvas-parser';
import {
  callPrismCompletion,
  createLocalChatReply,
  type ImageInput,
} from '@/lib/server/prism-ai-cascade';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let reservation: QuotaReservation | null = null;
  let guestUses: number | null = null;
  try {
    const {
      text = '', mode, question, context, isScenic, cognitiveMode, missionGoal,
      isStory, simplicityLevel, preferredProvider = 'auto', imageData, imageMimeType,
    } = await req.json();
    const absoluteMaxChars = 150000;
    const chunkSize = 25000;

    if (text.length > absoluteMaxChars) {
      return NextResponse.json({ error: 'Neural Link Overload: Document exceeds maximum document limit (150k chars). Please split your noise into smaller volumes.' }, { status: 413 });
    }
    const image = typeof imageData === 'string' && imageData.length <= 14_000_000 && typeof imageMimeType === 'string' && /^image\/(png|jpeg|jpg|webp|gif)$/i.test(imageMimeType)
      ? { data: imageData.replace(/^data:image\/[^;]+;base64,/, ''), mimeType: imageMimeType } satisfies ImageInput
      : undefined;
    if (!text && !image && mode !== 'chat') return NextResponse.json({ error: 'Valid text or image input is required.' }, { status: 400 });
    const quota = await reserveCredits(req);
    if (!quota.ok) return NextResponse.json({ error: quota.error, code: quota.code }, { status: quota.status });
    reservation = quota.reservation;
    guestUses = quota.reservation.guestUses ?? null;
    const respond = (body: unknown, init?: ResponseInit) => {
      const response = NextResponse.json(body, init);
      if (guestUses !== null) {
        response.cookies.set('prism-guest-uses', String(guestUses), {
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 30,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });
      }
      return response;
    };

    if (mode === 'chat') {
      const chatPrompt = `You are "Ask DJ," a Focus Guide. Answer the following question based on the context provided.\n\nContext: ${context}\n\nQuestion: ${question}`;
      const result = await callPrismCompletion(chatPrompt, preferredProvider, image);
      if (!result.text) {
        await refundCredits(reservation);
        return respond({
          answer: createLocalChatReply(String(question || ''), context),
          usage: { provider: 'local', model: 'local-ask-dj', promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          mode: 'local',
        });
      }
      await recordUsage(reservation, result.usage);
      return respond({ answer: result.text, usage: result.usage });
    }

    const chunksOfText: string[] = [];
    if (image) chunksOfText.push('Image input');
    else for (let i = 0; i < text.length; i += chunkSize) chunksOfText.push(text.substring(i, i + chunkSize));
    let nextChunkIndex = 0;
    const processChunk = async () => {
      const results: PromiseSettledResult<{ data: any; usage: AiUsage }>[] = [];
      while (true) {
        const chunkIndex = nextChunkIndex++;
        if (chunkIndex >= chunksOfText.length) return results;
        const chunkText = chunksOfText[chunkIndex];
        try {
          const generationPrompt = `
        You are "Ask DJ," a Focus Guide. Your mission is to perform a Deep Neural Refraction on the provided Noise.
        GOAL: ${missionGoal || 'Discovery'}
        TARGET COGNITIVE MODE: ${cognitiveMode}
        SIMPLICITY LEVEL: ${simplicityLevel || 'Standard'}
        ${isScenic ? 'Use a vivid, memorable metaphor where helpful.' : ''}
        ${isStory ? 'Preserve the narrative arc while keeping the facts clear.' : ''}

        Perform a silent analysis to identify Signal vs Noise, Logic Roots, Dopamine Hooks, and Structural Anchors.
        Output ONLY a valid JSON object with this structure:
        {
          "tldr": ["string"], "whyCare": "string", "readingTime": "string",
          "chunks": [{"heading":"string","content":"string","summary":"string","keyTerms":["string"],"metaphor":"string","dopamineHook":"string","logicRoot":"string","citations":"string"}],
          "actions": [{"task":"string","priority":"high"|"medium"|"low","estimatedMinutes":"number"}], "chartData": null
        }
        INPUT NOISE:\n${chunkText}
      `;
          const result = await callPrismCompletion(generationPrompt, preferredProvider, image);
          if (!result.text) throw new Error('No response from providers');
          results.push({ status: 'fulfilled', value: { data: extractJSON(result.text), usage: result.usage } });
        } catch (reason) {
          results.push({ status: 'rejected', reason });
        }
      }
    };
    const workerCount = Math.min(3, chunksOfText.length);
    const workerResults = await Promise.all(Array.from({ length: workerCount }, () => processChunk()));
    const settledResults = workerResults.flat();

    const refractionResults = settledResults.filter((res): res is PromiseFulfilledResult<{ data: any; usage: AiUsage }> => res.status === 'fulfilled').map(res => res.value);
    const usage = mergeUsage(refractionResults.map(result => result.usage));
    if (refractionResults.length === 0) {
      const local = createLocalRefraction(text, simplicityLevel, cognitiveMode);
      await refundCredits(reservation);
      return respond({ ...local, usage: { provider: 'local', model: 'structural-refraction', promptTokens: 0, completionTokens: 0, totalTokens: 0 } }, { status: 200 });
    }

    const mergedData = { tldr: [] as string[], whyCare: refractionResults[0]?.data?.whyCare || 'Focus was interrupted.', readingTime: `${Math.round(text.split(/\s+/).length / 200)}m`, chunks: [] as any[], actions: [] as any[], chartData: null as any };
    refractionResults.forEach(({ data: result }) => {
      if (result.tldr) mergedData.tldr.push(...result.tldr);
      if (result.chunks) mergedData.chunks.push(...result.chunks);
      if (result.actions) mergedData.actions.push(...result.actions);
      if (result.chartData) mergedData.chartData = result.chartData;
    });
    mergedData.tldr = [...new Set(mergedData.tldr)].slice(0, 6);
    mergedData.actions = Array.from(new Map(mergedData.actions.map(action => [action.task, action])).values());
    await recordUsage(reservation, usage);
    try {
      after(async () => {
        const shadowTelemetry = await runShadowProbe({
          userId: reservation?.userId,
          text,
          goal: missionGoal,
          cognitiveMode,
          simplicityLevel,
          baselineUsage: usage,
          syntheticToken: req.headers.get('x-prism-shadow-fixture'),
        });
        logShadowTelemetry(shadowTelemetry);
      });
    } catch {
      // Shadow scheduling is strictly best-effort and must never affect the baseline response.
    }
    return respond({
      tldr: mergedData.tldr.length ? mergedData.tldr : ['No summary generated'], whyCare: mergedData.whyCare, readingTime: mergedData.readingTime,
      chunks: mergedData.chunks.map(chunk => ({ heading: chunk.heading || 'Neural Fragment', content: chunk.content || '', summary: chunk.summary || 'Segment analyzed.', keyTerms: chunk.keyTerms || [], metaphor: chunk.metaphor || '', dopamineHook: chunk.dopamineHook || '', logicRoot: chunk.logicRoot || 'Foundational principle established.', citations: chunk.citations || 'Contextual anchor secured.' })),
      actions: mergedData.actions, chartData: mergedData.chartData, usage,
    });
  } catch (error: any) {
    await refundCredits(reservation);
    return NextResponse.json({ error: error.message || 'The Neural Engine is unavailable.' }, { status: 500 });
  }
}

const extractJSON = (text: string) => {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('The Neural Engine produced a malformed refraction. Please try again.');
  return JSON.parse(text.slice(start, end + 1));
};

const createLocalRefraction = (text: string, level = 'standard', cognitiveMode = 'adhd') => {
  const words = text.match(/[A-Za-z][A-Za-z'-]*/g) || [];
  const localPrism = createInstantLocalPrism(text);
  const detail = level === 'concise'
    ? localPrism.tinyIdea
    : level === 'detailed'
      ? `${localPrism.tinyIdea} ${localPrism.oneSmallMove}`
      : localPrism.tinyIdea;
  return {
    mode: 'local' as const,
    tldr: [localPrism.tinyIdea],
    whyCare: `This ${cognitiveMode === 'ceo' ? 'decision or document' : 'topic'} clicks faster when you take one calm card at a time.`,
    readingTime: `${Math.max(1, Math.round(words.length / 200))}m`,
    chunks: [{
      heading: 'Instant Local Prism',
      content: text.slice(0, 1200),
      summary: detail,
      keyTerms: localPrism.keyTerms,
      metaphor: localPrism.metaphor,
      dopamineHook: localPrism.dopamineBoost,
      logicRoot: localPrism.tinyIdea,
      citations: 'Instant local refraction (zero token limit).',
    }],
    actions: [{ task: localPrism.oneSmallMove, priority: 'high', estimatedMinutes: '2' }],
    chartData: null,
  };
};
