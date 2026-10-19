import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_INPUT_CHARS = 120_000;
const MAX_OUTPUT_CHARS = 30_000;

const actionSchema = z.object({
  task: z.string(),
  priority: z.enum(['high', 'medium', 'low']).or(z.string()),
  estimatedMinutes: z.union([z.string(), z.number()]),
});

const chunkSchema = z.object({
  heading: z.string(),
  content: z.string(),
  summary: z.string(),
  keyTerms: z.array(z.string()),
  metaphor: z.string(),
  dopamineHook: z.string(),
  logicRoot: z.string(),
  citations: z.string(),
});

const refractionOutputSchema = z.object({
  tldr: z.array(z.string()),
  whyCare: z.string(),
  readingTime: z.string(),
  chunks: z.array(chunkSchema),
  actions: z.array(actionSchema),
});

type RefractionInput = {
  text: string;
  goal?: string;
  simplicity?: 'concise' | 'standard' | 'detailed';
  cognitiveMode?: string;
  includeMetaphors?: boolean;
  preferredProvider?: 'auto' | 'openrouter' | 'gpt' | 'claude' | 'deepseek';
};

function createServer(origin: string) {
  const server = new McpServer(
    {
      name: 'mindbridge-prism',
      version: '0.2.0',
    },
    {
      instructions:
        'MindBridge refracts user-supplied information into clearer understanding and practical next steps. Use refract_document when the user wants dense content simplified or turned into an action plan. Do not infer medical diagnoses, provide medical treatment, or claim that generated content is authoritative. Preserve the user’s original source for verification.',
    },
  );

  server.registerTool(
    'refract_document',
    {
      title: 'Refract document into an action plan',
      description:
        'Use when the user provides document or webpage content and wants it simplified, prioritised, or converted into manageable next steps. The tool only processes content supplied in the request; it does not access the user’s private files or MindBridge vault.',
      inputSchema: {
        text: z.string().min(1).max(MAX_INPUT_CHARS).describe('The user-supplied document or webpage text.'),
        goal: z.string().max(500).optional().describe('What the user wants to understand, decide, study, or complete.'),
        simplicity: z.enum(['concise', 'standard', 'detailed']).optional().describe('How much detail to preserve.'),
        cognitiveMode: z.string().max(80).optional().describe('The user’s preferred working style, such as ADHD, student, professional, or executive.'),
        includeMetaphors: z.boolean().optional().describe('Whether to include memorable metaphors and engagement cues.'),
        preferredProvider: z.enum(['auto', 'openrouter', 'gpt', 'claude', 'deepseek']).optional().describe('Optional model-provider preference.'),
      },
      outputSchema: {
        tldr: z.array(z.string()),
        whyCare: z.string(),
        readingTime: z.string(),
        chunks: z.array(chunkSchema),
        actions: z.array(actionSchema),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
    },
    async (input: RefractionInput) => {
      const response = await fetch(`${origin}/api/simplify`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-mindbridge-mcp': '1',
        },
        body: JSON.stringify({
          text: input.text,
          missionGoal: input.goal || 'Understand the main points and decide what to do next.',
          simplicityLevel: input.simplicity || 'standard',
          cognitiveMode: input.cognitiveMode || 'adhd',
          isScenic: input.includeMetaphors ?? true,
          preferredProvider: input.preferredProvider || 'auto',
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const message = typeof payload?.error === 'string' ? payload.error : 'MindBridge could not refract this content.';
        return {
          isError: true,
          content: [{ type: 'text', text: message }],
        };
      }

      const result = refractionOutputSchema.safeParse(payload);
      if (!result.success) {
        return {
          isError: true,
          content: [{ type: 'text', text: 'MindBridge returned an invalid refraction. Please try again with a smaller document.' }],
        };
      }

      const structuredContent = result.data;
      const text = JSON.stringify(structuredContent);
      return {
        content: [{
          type: 'text',
          text: text.length > MAX_OUTPUT_CHARS ? text.slice(0, MAX_OUTPUT_CHARS) : text,
        }],
        structuredContent,
      };
    },
  );

  return server;
}

async function handle(request: Request) {
  const origin = new URL(request.url).origin;
  const server = createServer(origin);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);
  return transport.handleRequest(request);
}

export async function POST(request: Request) {
  try {
    return await handle(request);
  } catch (error) {
    console.error('MindBridge MCP request failed:', error);
    return new Response(JSON.stringify({
      jsonrpc: '2.0',
      error: { code: -32603, message: 'MindBridge MCP server is temporarily unavailable.' },
      id: null,
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

export async function GET() {
  return new Response('MindBridge MCP endpoint. Use the MCP Streamable HTTP POST transport.', {
    status: 405,
    headers: { allow: 'POST', 'content-type': 'text/plain' },
  });
}

export async function DELETE() {
  return new Response(null, { status: 405, headers: { allow: 'POST' } });
}
