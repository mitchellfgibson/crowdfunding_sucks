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
  user_id: string;
  username: string;
  body: string;
  created_at: string;
}

export const MAX_COMMENT = 800;

/** Fetch all comments for a thread, oldest first. */
export async function fetchComments(thread: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('id, thread, user_id, username, body, created_at')
    .eq('thread', thread)
    .order('created_at', { ascending: true });
  if (error) {
    console.warn('fetchComments', error.message);
    return [];
  }
  return data ?? [];
}

/** Post a comment to a thread as the current user. Returns the inserted row. */
export async function postComment(
  thread: string,
  body: string,
  username: string,
): Promise<{ ok: true; comment: Comment } | { ok: false; message: string }> {
  const text = body.trim();
  if (!text) return { ok: false, message: 'Say something first.' };
  if (text.length > MAX_COMMENT) return { ok: false, message: `Keep it under ${MAX_COMMENT} characters.` };

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return { ok: false, message: 'Sign in to comment.' };

  const { data, error } = await supabase
    .from('comments')
    .insert({ thread, body: text, username, user_id: user.id })
    .select('id, thread, user_id, username, body, created_at')
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
