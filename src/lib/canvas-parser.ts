export interface PrismCard {
  id: string;
  heading: string;
  text: string;
  wordCount: number;
}

export interface PrismCardRefraction {
  tinyIdea: string;
  metaphor: string;
  dopamineBoost: string;
  oneSmallMove: string;
  keyTerms: string[];
  source: 'ai' | 'local';
}

export interface CanvasTopic {
  id: string;
  title: string;
  moduleName: string;
  type: 'Page' | 'Assignment' | 'Discussion' | 'Demo' | 'Custom';
  pageUrl?: string;
  contentId?: number | string;
  htmlUrl?: string;
  cards?: PrismCard[];
}

export interface ParsedCanvasCourse {
  baseUrl: string;
  courseId: string;
}

const PRIVATE_HOST_RE = /^(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|169\.254\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|0\.0\.0\.0|\[::1\]|::1)$/i;

export function parseCanvasCourseUrl(rawUrl: string): ParsedCanvasCourse {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    throw new Error('Please paste your Canvas course link (for example, https://moringa.instructure.com/courses/1713/modules).');
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
  } catch {
    throw new Error('That link does not look like a valid Canvas course URL.');
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('For your safety, Canvas connections must use HTTPS.');
  }

  const host = parsed.hostname.toLowerCase();
  if (PRIVATE_HOST_RE.test(host) || !host.includes('.') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new Error('Please enter a public Canvas LMS address such as moringa.instructure.com.');
  }

  const courseMatch = parsed.pathname.match(/\/courses\/(\d+)/i);
  if (!courseMatch) {
    throw new Error('Could not find a course number in that link. Open your course Modules page and copy the URL (it includes /courses/1713).');
  }

  return {
    baseUrl: `https://${parsed.host}`,
    courseId: courseMatch[1],
  };
}

function decodeEntities(input: string): string {
  const named: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '...',
    '&rsquo;': "'",
    '&lsquo;': "'",
    '&rdquo;': '"',
    '&ldquo;': '"',
  };
  return input
    .replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
      if (named[entity]) return named[entity];
      if (entity.startsWith('&#x') || entity.startsWith('&#X')) {
        const code = Number.parseInt(entity.slice(3, -1), 16);
        return Number.isFinite(code) ? String.fromCodePoint(code) : ' ';
      }
      if (entity.startsWith('&#')) {
        const code = Number.parseInt(entity.slice(2, -1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : ' ';
      }
      return ' ';
    });
}

export function stripHtmlToText(html: string): string {
  if (!html) return '';
  let cleaned = html
    .replace(/<(script|style|noscript|svg|iframe|nav|header|footer)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(h[1-4])[^>]*>([\s\S]*?)<\/\1>/gi, '\n\n## $2\n\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n• $1\n')
    .replace(/<(p|div|section|article|br|tr|blockquote)[^>]*>/gi, '\n')
    .replace(/<\/(p|div|section|article|tr|blockquote|ul|ol)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');

  cleaned = decodeEntities(cleaned)
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleaned;
}

export function splitIntoPrismCards(topicTitle: string, rawContent: string, isHtml = false): PrismCard[] {
  const plain = isHtml ? stripHtmlToText(rawContent) : rawContent.replace(/\r\n/g, '\n').trim();
  if (!plain) return [];

  const blocks = plain
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  const cards: PrismCard[] = [];
  const TARGET_WORDS = 125;
  const MAX_WORDS = 175;

  let currentHeading = topicTitle || "Today's Quest";
  let buffer: string[] = [];
  let bufferWords = 0;

  const flush = () => {
    const text = buffer.join('\n\n').trim();
    if (!text) return;
    const words = text.split(/\s+/).filter(Boolean).length;
    cards.push({
      id: `card-${cards.length + 1}`,
      heading: currentHeading,
      text,
      wordCount: words,
    });
    buffer = [];
    bufferWords = 0;
  };

  for (const block of blocks) {
    if (block.startsWith('## ')) {
      if (bufferWords >= 25) flush();
      currentHeading = block.replace(/^##\s+/, '').trim() || currentHeading;
      continue;
    }

    const blockWords = block.split(/\s+/).filter(Boolean).length;

    // If a single paragraph is very long, split cleanly by sentences.
    if (blockWords > MAX_WORDS) {
      if (bufferWords > 0) flush();
      const sentences = block.split(/(?<=[.!?])\s+/).filter(Boolean);
      let part: string[] = [];
      let partWords = 0;
      for (const sentence of sentences) {
        const sw = sentence.split(/\s+/).filter(Boolean).length;
        if (partWords > 0 && partWords + sw > TARGET_WORDS) {
          buffer.push(part.join(' '));
          bufferWords = partWords;
          flush();
          part = [sentence];
          partWords = sw;
        } else {
          part.push(sentence);
          partWords += sw;
        }
      }
      if (part.length > 0) {
        buffer.push(part.join(' '));
        bufferWords += partWords;
        if (bufferWords >= TARGET_WORDS) flush();
      }
      continue;
    }

    if (bufferWords > 0 && bufferWords + blockWords > MAX_WORDS) {
      flush();
    }

    buffer.push(block);
    bufferWords += blockWords;

    if (bufferWords >= TARGET_WORDS) {
      flush();
    }
  }

  flush();

  if (cards.length === 0) {
    const words = plain.split(/\s+/).filter(Boolean).length;
    cards.push({
      id: 'card-1',
      heading: topicTitle || "Today's Quest",
      text: plain,
      wordCount: words,
    });
  }

  return cards;
}

const STOP_WORDS = new Set([
  'about', 'after', 'again', 'being', 'below', 'between', 'could', 'every', 'first',
  'found', 'great', 'house', 'large', 'learn', 'might', 'never', 'other', 'place',
  'point', 'right', 'small', 'sound', 'still', 'study', 'their', 'there', 'these',
  'thing', 'think', 'those', 'three', 'under', 'using', 'water', 'where', 'which',
  'while', 'without', 'world', 'would', 'write', 'should', 'because', 'through',
  'before', 'example', 'really', 'simple', 'allows', 'makes', 'means', 'often',
]);

const METAPHOR_PATTERNS: Array<{ re: RegExp; metaphor: string; hook: string }> = [
  {
    re: /\b(api|http|request|response|endpoint|rest|fetch|server|client)\b/i,
    metaphor: 'Picture a friendly café waiter: your app places a clear order (request), the kitchen (server) prepares it, and the waiter brings back your plate (response).',
    hook: 'You just decoded how almost every app on the internet talks behind the scenes!',
  },
  {
    re: /\b(database|sql|table|query|schema|record|postgres|mongo|model)\b/i,
    metaphor: 'Think of a neatly labeled filing cabinet where every drawer has clear tabs, so you can grab the exact folder in a split second instead of digging through a messy pile.',
    hook: 'One card down — your brain is organizing data like a pro architect.',
  },
  {
    re: /\b(component|react|state|props|render|dom|jsx|hook|ui|frontend)\b/i,
    metaphor: 'Like snapping together LEGO bricks: each small piece handles one job, and when its state changes, only that brick updates without rebuilding the whole castle.',
    hook: 'Nice! Once you see apps as reusable LEGO blocks, big codebases stop feeling scary.',
  },
  {
    re: /\b(git|branch|commit|merge|pull|repo|repository|version)\b/i,
    metaphor: 'Like save-points in a video game: a branch lets you test a wild new strategy safely, and you only merge it into your main save once it works.',
    hook: 'Checkpoint unlocked! You can experiment freely when you know you can always rewind.',
  },
  {
    re: /\b(function|loop|array|object|variable|algorithm|python|javascript|code|class)\b/i,
    metaphor: 'Like a favorite recipe card: you write the steps once, give it a clear name, and reuse it whenever you want the same result without starting from scratch.',
    hook: 'Boom — you just turned abstract code logic into a repeatable superpower.',
  },
  {
    re: /\b(css|flexbox|grid|layout|style|responsive|design|margin|padding)\b/i,
    metaphor: 'Like arranging furniture in a cozy room: padding gives each item breathing space inside, while margin keeps comfortable walkways between pieces.',
    hook: 'Visual clarity unlocked! Your eye for clean layouts is leveling up.',
  },
  {
    re: /\b(auth|token|password|security|encrypt|jwt|session|cookie|permission)\b/i,
    metaphor: 'Like a concert wristband: you show your ticket once at the gate, get a secure band, and then breeze past every checkpoint without pulling out your ID again.',
    hook: 'Security made simple — no jargon panic needed.',
  },
];

export function createInstantLocalPrism(cardText: string, cardHeading = ''): PrismCardRefraction {
  const clean = cardText.replace(/\s+/g, ' ').trim();
  const sentences = clean.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 10);

  // Pick the clearest anchor sentence for "The Tiny Idea"
  const bestSentence =
    sentences.find((s) => s.length >= 35 && s.length <= 185) ||
    sentences[0] ||
    clean.slice(0, 170);

  const tinyIdea = bestSentence.length > 185
    ? `${bestSentence.slice(0, 178).trim()}...`
    : bestSentence;

  // Extract meaningful key terms
  const words = clean.match(/[A-Za-z][A-Za-z0-9'-]{3,}/g) || [];
  const freq = new Map<string, number>();
  for (const w of words) {
    const low = w.toLowerCase();
    if (STOP_WORDS.has(low)) continue;
    freq.set(low, (freq.get(low) || 0) + 1);
  }
  const keyTerms = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([term]) => term);

  const combined = `${cardHeading} ${clean}`;
  const matched = METAPHOR_PATTERNS.find((p) => p.re.test(combined));

  const anchorWord = keyTerms[0] ? `"${keyTerms[0]}"` : 'this core idea';

  return {
    tinyIdea,
    metaphor: matched
      ? matched.metaphor
      : `Picture ${anchorWord} like a single trail marker on a hike — you don't need to see the whole mountain, just this one clear signpost right in front of you.`,
    dopamineBoost: matched
      ? matched.hook
      : `Small win unlocked! You just absorbed ${anchorWord} without needing to fight through a wall of text.`,
    oneSmallMove: keyTerms.length >= 2
      ? `In your own words (one short sentence), connect "${keyTerms[0]}" and "${keyTerms[1]}" — then hit Claim Win!`
      : `Say ${anchorWord} out loud in one casual sentence, then claim your win and move to the next card.`,
    keyTerms,
    source: 'local',
  };
}

export const DEMO_QUESTS: CanvasTopic[] = [
  {
    id: 'demo-rest-apis',
    title: 'How REST APIs Talk (Warm-Up Quest)',
    moduleName: 'Demo Quest — No Canvas Token Needed',
    type: 'Demo',
    cards: [
      {
        id: 'demo-1-1',
        heading: 'What an API Actually Does',
        wordCount: 47,
        text: 'A REST API lets two applications talk over HTTP using simple verbs like GET to read data and POST to create new items. Neither app needs to know how the other is built inside — they just agree on a clear, predictable message format like JSON.',
      },
      {
        id: 'demo-1-2',
        heading: 'Status Codes Are Traffic Lights',
        wordCount: 46,
        text: 'Every server response sends back a 3-digit status code so your code knows what happened immediately. 200 means success, 201 means a new resource was created, 404 means the item was not found, and 500 means the server ran into an unexpected error.',
      },
      {
        id: 'demo-1-3',
        heading: 'Headers and Authentication',
        wordCount: 42,
        text: 'Headers carry extra context alongside your request, such as Content-Type: application/json or an Authorization token that proves who you are. Keeping tokens in headers instead of URLs protects your private access from leaking into browser history.',
      },
    ],
  },
  {
    id: 'demo-react-state',
    title: 'React State Without the Panic',
    moduleName: 'Demo Quest — Next Stage Preview',
    type: 'Demo',
    cards: [
      {
        id: 'demo-2-1',
        heading: 'State Is Component Memory',
        wordCount: 44,
        text: 'In React, state is simply a component’s short-term memory. Whenever a user clicks a button, types in a box, or toggles a theme, updating state tells React to gently re-render only the parts of the screen that actually changed.',
      },
      {
        id: 'demo-2-2',
        heading: 'Props Flow Downward',
        wordCount: 41,
        text: 'Props are how a parent component passes data down to a child component, like handing a teammate their playbook before a match. Child components read props to display information cleanly without mutating the parent’s original data.',
      },
    ],
  },
];
