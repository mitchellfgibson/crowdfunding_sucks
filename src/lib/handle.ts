/**
 * Presentation helpers for outlet "accounts" in the forum UI. Pure formatting —
 * no data is invented here.
 */

/** Strip a leading @ for display contexts that add their own. */
export function bareHandle(name: string): string {
  return name.replace(/^@/, '');
}

/** Monogram for an avatar: first 1–2 alpha chars of the handle, uppercased. */
export function monogram(name: string): string {
  const bare = bareHandle(name).replace(/[^A-Za-z0-9]/g, '');
  return (bare.slice(0, 2) || '?').toUpperCase();
}

// A small, sober palette for deterministic avatar backgrounds (not the reserved
// flag/gain/loss colors — those carry meaning elsewhere).
const AVATAR_COLORS = [
  '#1f5fae',
  '#3a6b35',
  '#6b4a8a',
  '#205a6e',
  '#8a5a12',
  '#475569',
  '#7a3b5d',
  '#2f6b6b',
];

/** Deterministic color from the handle so avatars are stable across builds. */
export function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

/** "May 2024" style month-year, or empty string. */
export function monthYear(d: Date | null): string {
  if (!d) return '';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
