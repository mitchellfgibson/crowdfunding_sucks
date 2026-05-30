/**
 * Prefix an absolute site path with the configured base path so links resolve
 * both on the GitHub Pages project site (base '/crowdfunding_sucks') and at
 * root. Always pass a leading-slash path, e.g. withBase('/lessons/').
 */
export function withBase(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}
