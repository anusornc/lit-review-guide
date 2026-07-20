# LitWise — Literature Review Expert Guide

LitWise helps master’s students, PhD candidates, and researchers move from a
broad research interest to a defensible literature-review design. The product
combines a guided decision pathway with method, discipline, workflow, and
execution guidance in English and Thai.

## Product Shape

- five-step pathway that recommends a starting method plus alternatives and trade-offs
- 14 literature-review methods with search, appraisal, reporting, and tool guidance
- 9 discipline families with databases, review venues, standards, tools, and cautions
- six traceable phases: Scope → Search → Screen → Appraise → Extract → Write
- Boolean search canvas, appraisal chooser, four copy-ready templates, and six failure modes
- Thai and English content with URL, browser, and local-preference locale resolution
- responsive, accessible React UI deployed through OpenAI Sites / vinext

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev
npm run build
npm test
```

Open the local URL printed by `npm run dev`. Add `?lang=th` or `?lang=en` to
select a language explicitly.

## Main Files

- `app/page.tsx` contains the interactive product flow and guide surfaces
- `app/i18n.ts` contains shared interface translations and core Thai content
- `app/guide-data.ts` contains the merged decision model, deep method and discipline content, workflow, and toolkit
- `app/globals.css` contains the responsive visual system
- `tests/rendered-html.test.mjs` verifies production rendering, bilingual metadata, and merged guide coverage
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development

## Workspace Auth Headers

OpenAI workspace sites can read the current user's email from
`oai-authenticated-user-email`.

SIWC-authenticated workspace sites may also receive
`oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty
`name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by
`oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs
optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send
  anonymous visitors through Sign in with ChatGPT.
- Use `chatGPTSignInPath(returnTo)` and `chatGPTSignOutPath(returnTo)` for
  browser links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in
  or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because
  they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the
OAuth cookies, and identity header injection. Do not implement app routes for
those reserved paths. Routes that do not import and call the helper remain
anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the
Sites hosting platform's access policy controls for workspace-wide restrictions,
or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write
actions tied to the current ChatGPT user. Leave public content anonymous.

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the vinext production build
- `npm test`: build and verify the rendered LitWise guide
- `npm run lint`: run ESLint across the project
- `npm run db:generate`: generate Drizzle migrations after schema changes

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
