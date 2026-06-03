import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase browser client — reuses the existing BTHI / Full_vision project.
 *
 * The publishable (anon) key is SAFE to ship in client code: it only permits
 * what Row-Level Security policies allow. Security comes from RLS on the DB,
 * not from hiding this key (it's already public in the Full_vision site).
 * Env vars override the defaults for a different project/preview.
 */
const SUPABASE_URL =
  import.meta.env.PUBLIC_SUPABASE_URL ?? 'https://avnndunwixpgyygdtkqk.supabase.co';
const SUPABASE_KEY =
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_jSy1DyD67paW5f_iT7OYRw_WMR2QIIk';

export const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // completes the OAuth redirect automatically
  },
});

/**
 * Absolute URL Google should redirect back to after login. Must be added to the
 * Supabase Auth "Redirect URLs" allowlist. Uses the site's base path so it works
 * under /crowdfunding_sucks/ on GitHub Pages.
 */
export function authRedirectUrl(): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${window.location.origin}${base}/auth/callback/`;
}

/** Kick off Google OAuth. */
export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: authRedirectUrl() },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

/** Short display name + initials for a signed-in user. */
export function userInitials(user: { email?: string | null; user_metadata?: Record<string, unknown> } | null): string {
  if (!user) return '?';
  const m = user.user_metadata ?? {};
  const full = (m.full_name as string) || (m.name as string) || '';
  if (full.trim()) {
    const parts = full.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
  }
  return (user.email ?? '?')[0]!.toUpperCase();
}
