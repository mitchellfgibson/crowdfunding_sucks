/**
 * ILLUSTRATIVE sample chat generator.
 *
 * Produces deterministic, fictional discussion threads so the community
 * interface can be previewed without GitHub accounts or a real backend. These
 * are NOT real users and NOT real comments — they are placeholders, clearly
 * labeled in the UI, exactly like the sample outlet data.
 *
 * Firewall note: sample messages are opinion/banter only. They never assert new
 * valuations, returns, or outcomes as fact — the only figures they reference are
 * the ones already computed from sourced frontmatter and passed in here.
 */

export interface ChatMessage {
  author: string;
  body: string;
  /** minutes-ago-ish offset used only to render a relative timestamp */
  ago: string;
  reactions?: { emoji: string; n: number }[];
}

// Fictional commenter personas (handles only — no real people).
const PERSONAS = [
  'small_cap_sam',
  'dilution_dana',
  'formC_fanatic',
  'exit_liquidity_lou',
  'patient_pam',
  'due_diligence_dre',
  'ramen_profitable',
  'cap_stack_carl',
  'retail_raul',
  'term_sheet_tina',
  'burn_rate_bex',
  'secondary_sid',
];

const AGOS = [
  '3w', '2w', '12d', '9d', '6d', '5d', '4d', '3d', '2d', '28h', '20h', '14h', '6h', '2h',
];

// Deterministic PRNG (mulberry32) seeded from the thread key, so the same deal
// always renders the same conversation across rebuilds.
function seeded(seedStr: string) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface DealContext {
  ticker: string;
  outcome: string;
  ratio: number | null; // computed return, may be null
  thesisHint?: string;
}

// Message banks keyed loosely by the deal's situation. Tokens: {T}=ticker.
const OPENERS = [
  'anyone else in on {T}? been watching this one for a while',
  'finally pulled the trigger on {T} last round',
  'what’s the read on {T} here',
  'adding {T} to my watchlist, curious what people think',
  '{T} popped up in my feed again, thoughts?',
];

const NEUTRAL = [
  'cap table looked clean when I checked the Form C',
  'valuation felt a touch rich but the traction is real',
  'small position for me, treating it as a lotto ticket honestly',
  'mgmt actually answers questions in the Q&A, rare',
  'revenue multiple is the whole debate here imo',
  'liquidity is the part nobody talks about with these',
  'set a reminder to revisit at the next raise',
  'dilution math is what worries me long term',
  'their updates have been consistent at least',
  'not advice but I sized this carefully',
];

const POS = [
  'aged well 👀 nice call',
  'this one actually worked out, respect',
  'glad I didn’t fade this',
  'the early thesis looks right in hindsight',
  'one of the few that delivered, ngl',
];

const NEG = [
  'oof. glad I kept it small',
  'this is why position sizing matters lol',
  'the dilution warning aged like milk for holders',
  'lesson learned on this one',
  'should’ve read the risk factors closer',
];

const OUTCOME_LINE: Record<string, string> = {
  acquired: 'acquisition closed — congrats to anyone who held {T}',
  delisted: 'so {T} got delisted… anyone get out in time?',
  dissolved: 'dissolution notice on {T}. brutal.',
  litigation_public_record: 'saw the litigation filing on {T} hit the public record, yikes',
  active: '{T} still going — watching the next update closely',
  unknown: 'no real update on {T} yet, holding for now',
};

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Build a deterministic 5–10 message sample thread for one deal. */
export function sampleChat(seed: string, ctx: DealContext): ChatMessage[] {
  const rng = seeded(seed);
  const T = ctx.ticker;
  const fill = (s: string) => s.replace(/\{T\}/g, T);

  const n = 5 + Math.floor(rng() * 6); // 5..10
  const usedAuthors = new Set<string>();
  const author = () => {
    let a = pick(rng, PERSONAS);
    let guard = 0;
    while (usedAuthors.has(a) && guard++ < 5) a = pick(rng, PERSONAS);
    usedAuthors.add(a);
    return a;
  };

  const tone =
    ctx.ratio === null ? NEUTRAL : ctx.ratio > 0.15 ? POS : ctx.ratio < -0.15 ? NEG : NEUTRAL;

  const msgs: ChatMessage[] = [];
  const agos = [...AGOS];

  // 1) opener
  msgs.push({ author: author(), body: fill(pick(rng, OPENERS)), ago: agos.shift()! });

  // 2..n-1) mix of neutral discussion + tone-appropriate reactions
  for (let i = 1; i < n - 1; i++) {
    const bank = rng() < 0.5 ? NEUTRAL : tone;
    msgs.push({ author: author(), body: fill(pick(rng, bank)), ago: agos.shift() ?? '1h' });
  }

  // last) outcome-aware closer
  msgs.push({
    author: author(),
    body: fill(OUTCOME_LINE[ctx.outcome] ?? OUTCOME_LINE.unknown),
    ago: agos.shift() ?? 'just now',
  });

  // sprinkle a couple reactions deterministically
  msgs.forEach((m, i) => {
    if (rng() < 0.4) {
      m.reactions = [{ emoji: ctx.ratio !== null && ctx.ratio < 0 ? '😬' : '👍', n: 1 + Math.floor(rng() * 6) }];
    }
    void i;
  });

  return msgs;
}
