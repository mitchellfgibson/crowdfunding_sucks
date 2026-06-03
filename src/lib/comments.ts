import { supabase } from './supabase';

/**
 * Live community comments, stored in Supabase (table `comments`). Each comment
 * belongs to a `thread` key (e.g. "outlet/sample-deep-value-dao/deal/qcmp7" or
 * "publisher/stansberry-research") so the same keys the fake sample threads use
 * map to real discussions.
 *
 * Security is enforced by RLS on the table (see SUPABASE_COMMENTS_SETUP.md):
 * anyone may read; only authenticated users may insert their own row; users may
 * delete only their own rows. The anon key shipped to the browser can't bypass
 * that.
 */

export interface Comment {
  id: string;
  thread: string;
  parent_id: string | null; // null = top-level; otherwise replies to that comment
  user_id: string;
  username: string;
  body: string;
  created_at: string;
}

export const MAX_COMMENT = 800;

/** Reaction emojis offered on each comment. */
export const REACTION_EMOJIS = ['👍', '😂', '🤔', '🔥', '😬'] as const;

/**
 * Profanity guard. Client-side only — it stops casual swearing, not a
 * determined adversary (real moderation belongs server-side). Matches whole
 * words and common leetspeak/spacing tricks, and skips inoffensive substrings
 * (so "Scunthorpe"/"assess"/"class" are fine).
 */
const BANNED = [
  'fuck', 'shit', 'bitch', 'cunt', 'asshole', 'bastard', 'dick', 'piss',
  'slut', 'whore', 'fag', 'faggot', 'nigger', 'nigga', 'retard', 'cock',
  'pussy', 'douche', 'jackass', 'motherfucker', 'bullshit', 'dumbass',
];
// leet map so f*ck / sh1t / a$$ are caught
const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's', '!': 'i' };

/** Map leetspeak to letters, lowercase; keep other chars as-is. */
function leetLower(s: string): string {
  return s.toLowerCase().replace(/[0134579@$!]/g, (c) => LEET[c] ?? c);
}

/**
 * True if the text contains a banned word. Two complementary passes:
 *  1. Whole-word match (banned word bounded by non-letters). This catches clean
 *     swearing AND censor tricks where the gaps are non-letters — e.g. "f*ck",
 *     "f u c k", "s-h-i-t" — because the gap chars are removed but the word is
 *     still flanked by non-letters. It does NOT match inside real words like
 *     "class" or "assess", since those have letters touching the fragment.
 *  2. (none needed) — the boundary check in pass 1 handles both cases.
 */
export function hasProfanity(text: string): boolean {
  const mapped = leetLower(text);

  // For each banned word, allow each letter to be that letter OR a single
  // censor char (*, -, ., etc.), with up to 2 non-letter separators between
  // letters. Bounded by non-letters so innocent words ("class", "assess") and
  // substrings don't trip. Catches: fuck, f*ck, f u c k, s.h.i.t, sh1t, etc.
  return BANNED.some((w) => {
    const letters = w.split('').map((ch) => `(?:${ch}|[^a-z0-9\\s])`);
    const fuzzy = letters.join('[^a-z]{0,2}');
    const re = new RegExp(`(^|[^a-z])${fuzzy}([^a-z]|$)`, 'i');
    return re.test(mapped);
  });
}

const COMMENT_COLS = 'id, thread, parent_id, user_id, username, body, created_at';

/** Fetch all comments for a thread, oldest first (flat; nest client-side). */
export async function fetchComments(thread: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(COMMENT_COLS)
    .eq('thread', thread)
    .order('created_at', { ascending: true });
  if (error) {
    console.warn('fetchComments', error.message);
    return [];
  }
  return (data ?? []) as Comment[];
}

/**
 * Post a comment (or a reply, when `parentId` is set) as the current user.
 */
export async function postComment(
  thread: string,
  body: string,
  username: string,
  parentId: string | null = null,
): Promise<{ ok: true; comment: Comment } | { ok: false; message: string }> {
  const text = body.trim();
  if (!text) return { ok: false, message: 'Say something first.' };
  if (text.length > MAX_COMMENT) return { ok: false, message: `Keep it under ${MAX_COMMENT} characters.` };
  if (hasProfanity(text)) return { ok: false, message: 'Please keep it clean — no swearing.' };

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return { ok: false, message: 'Sign in to comment.' };

  const { data, error } = await supabase
    .from('comments')
    .insert({ thread, body: text, username, user_id: user.id, parent_id: parentId })
    .select(COMMENT_COLS)
    .single();

  if (error) return { ok: false, message: error.message };
  return { ok: true, comment: data as Comment };
}

/**
 * Generate a stable, fictional-feeling username from an email — so users get an
 * investor-handle-style name without exposing their real email. Deterministic:
 * the same email always yields the same handle. Users can override it (stored
 * in their Supabase metadata under `username`).
 */
export function usernameFromEmail(email: string): string {
  const local = (email.split('@')[0] || 'investor').toLowerCase().replace(/[^a-z0-9]+/g, '');
  // deterministic 2-digit suffix from the full email
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) >>> 0;
  const suffix = h % 100;
  const base = local.slice(0, 14) || 'investor';
  return `${base}${suffix.toString().padStart(2, '0')}`;
}

/** Read the user's chosen username (metadata) or derive one from their email. */
export function resolveUsername(
  user: { email?: string | null; user_metadata?: Record<string, unknown> } | null,
): string {
  if (!user) return '';
  const chosen = (user.user_metadata?.username as string | undefined)?.trim();
  if (chosen) return chosen;
  return usernameFromEmail(user.email ?? 'investor@example.com');
}

/** Persist a chosen username onto the user's Supabase metadata. */
export async function setUsername(name: string) {
  const clean = name.trim().slice(0, 24).replace(/\s+/g, '_');
  return supabase.auth.updateUser({ data: { username: clean } });
}

// --- Reactions -----------------------------------------------------------

export interface ReactionRow {
  comment_id: string;
  user_id: string;
  emoji: string;
}

/** Counts per emoji for a comment, plus which ones the current user has set. */
export interface ReactionSummary {
  counts: Record<string, number>;
  mine: Set<string>;
}

/** Fetch reactions for a set of comment ids, summarized per comment. */
export async function fetchReactions(commentIds: string[]): Promise<Map<string, ReactionSummary>> {
  const out = new Map<string, ReactionSummary>();
  if (commentIds.length === 0) return out;
  const { data: auth } = await supabase.auth.getUser();
  const myId = auth.user?.id ?? null;

  const { data, error } = await supabase
    .from('comment_reactions')
    .select('comment_id, user_id, emoji')
    .in('comment_id', commentIds);
  if (error) {
    console.warn('fetchReactions', error.message);
    return out;
  }
  for (const r of (data ?? []) as ReactionRow[]) {
    let s = out.get(r.comment_id);
    if (!s) {
      s = { counts: {}, mine: new Set() };
      out.set(r.comment_id, s);
    }
    s.counts[r.emoji] = (s.counts[r.emoji] ?? 0) + 1;
    if (myId && r.user_id === myId) s.mine.add(r.emoji);
  }
  return out;
}

/**
 * Toggle the current user's reaction with `emoji` on a comment. Returns the new
 * state (whether the user now has it set). One row per (comment, user, emoji).
 */
export async function toggleReaction(
  commentId: string,
  emoji: string,
): Promise<{ ok: true; active: boolean } | { ok: false; message: string }> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return { ok: false, message: 'Sign in to react.' };

  // is it already set?
  const { data: existing } = await supabase
    .from('comment_reactions')
    .select('comment_id')
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .eq('emoji', emoji)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('comment_reactions')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .eq('emoji', emoji);
    if (error) return { ok: false, message: error.message };
    return { ok: true, active: false };
  }

  const { error } = await supabase
    .from('comment_reactions')
    .insert({ comment_id: commentId, user_id: user.id, emoji });
  if (error) return { ok: false, message: error.message };
  return { ok: true, active: true };
}

/** Relative "time ago" label. */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const s = Math.max(1, Math.round((Date.now() - then) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  return `${d}d`;
}
