# CrowdfundingSucks (working name)

Investor-education + accountability site for the BTHI ecosystem. Three layers:
evergreen educational long-form, a directory of crowdfunding portals / gurus /
deals with **computed, sourced** track records, and a community discussion layer
(Giscus).

Built with Astro + Content Collections (TypeScript strict), Tailwind v4, and
MDX. Static output, deployed to GitHub Pages.

> **Editorial firewall:** track-record numbers are never hand-authored — they are
> arithmetic over cited facts in frontmatter. A datum with no `sources[]` does not
> render.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run check    # astro check (TS strict + content-collection types)
npm run build    # static build into dist/
npm run preview  # preview the production build
```

## Deploy

Every push to `main` is built and published to GitHub Pages by
`.github/workflows/deploy.yml`. The site is served under a base path
(`/crowdfunding_sucks`); all internal links go through the `withBase()` helper in
`src/lib/url.ts`, so moving to a root host later only needs a config change.

## Analytics

Plausible loads only when `PUBLIC_PLAUSIBLE_DOMAIN` is set. Left unset, no
analytics script is emitted.

## Layout

```
src/content/{lessons,portals,gurus,deals}/  typed content collections
src/content.config.ts                       Zod schemas for the collections
src/components/                             design system + islands
src/layouts/                                base layout w/ standing disclaimer
src/lib/url.ts                              base-path link helper
data/sources/                               raw clippings (input only)
```
