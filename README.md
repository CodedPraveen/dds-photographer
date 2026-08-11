# DDS Photographer

DDS Photographer is a premium photography business website with future private
client-gallery capabilities. The repository currently contains the completed
Phase 1 technical foundation; website features begin in Phase 2.

## Foundation

- Next.js 16 and React 19 App Router under `src/app/`
- JavaScript and Tailwind CSS v4
- Manrope with weights 400, 500, 600, and 700
- Centralized tokens in `src/styles/tokens.css`
- Generic UI primitives under `src/components/ui/`
- Shared foundation utilities under `src/lib/`
- Site configuration under `src/config/`

## Local Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `NEXT_PUBLIC_SITE_URL` to the absolute URL used locally.
4. Start the development server with `npm run dev`.

The default local URL is [http://localhost:3000](http://localhost:3000).

## Validation

```bash
npm run lint
npm run format:check
npm run build
```

Repository-wide formatting still reports legacy documentation that predates
the Phase 1 formatter. Changed foundation files must pass focused Prettier
validation without mass-formatting unrelated documents.

## Project References

- `AGENTS.md` — implementation rules
- `docs/design-system/design/TOKENS.md` — approved design tokens
- `docs/design-system/production/IMPLEMENTATION_STATUS.md` — current phase
- `docs/design-system/production/IMPLEMENTED_FEATURES.md` — truthful feature
  matrix
