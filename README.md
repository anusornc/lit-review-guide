# LitWise — Literature Review Expert Guide

LitWise helps master’s students, PhD candidates, and researchers move from a
broad research interest to a defensible literature-review design. It combines
a guided decision pathway with method, discipline, workflow, and execution
guidance in English and Thai.

This repository is a standard, self-hosted Next.js application. It does not
depend on ChatGPT Sites, Vinext, Cloudflare Workers, or provider-specific
authentication. You can run it on localhost or deploy it to any machine that
supports Node.js 22 or Docker.

## Product Shape

- five-step pathway recommending a starting method, alternatives, and trade-offs
- 14 literature-review methods with search, appraisal, reporting, and tool guidance
- 9 discipline families with databases, review venues, standards, tools, and cautions
- six traceable phases: Scope → Search → Screen → Appraise → Extract → Write
- Boolean search canvas, appraisal chooser, copy-ready templates, and common pitfalls
- Thai and English content with URL, cookie, and browser-language resolution
- responsive UI, light and dark themes, accessible dialogs, and keyboard navigation

## Requirements

- Node.js `>=22.13.0`
- npm (included with Node.js)

## Run on localhost

Install dependencies once and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use `?lang=th` or
`?lang=en` to select a language explicitly.

## Run as a production Node.js service

On the destination machine:

```bash
npm ci
npm run build
npm start
```

The production server listens on port `3000` by default. Select another port
with an environment variable:

```bash
PORT=8080 npm start
```

For an internet-facing server, place a reverse proxy such as Nginx, Caddy, or
Traefik in front of the Node.js process to provide HTTPS and your domain name.
Run the process under a service manager such as systemd, PM2, or Docker so it
restarts automatically.

## Run with Docker

Build and start the included standalone image:

```bash
docker build -t litwise .
docker run --name litwise -p 3000:3000 litwise
```

Then open [http://localhost:3000](http://localhost:3000). To run it in the
background and restart it after a machine reboot:

```bash
docker run -d --restart unless-stopped --name litwise -p 3000:3000 litwise
```

The same image can be deployed to a VPS, on-premise server, NAS with container
support, or a container hosting provider. No ChatGPT subscription is required
to serve the deployed application.

## Verification

```bash
npm run lint
npm test
npm run build
```

After building, verify the production server locally:

```bash
npm start
```

## Main Files

- `app/page.tsx` resolves request-aware language, theme, and metadata
- `app/guide-client.tsx` contains the interactive guide and research pathway
- `app/i18n.ts` contains shared interface translations and Thai content
- `app/guide-data.ts` contains the decision model, method and discipline guides, workflow, and toolkit
- `app/globals.css` contains the responsive visual system
- `proxy.ts` applies an explicit `?lang=` selection before server rendering
- `Dockerfile` packages the Next.js standalone server
- `tests/` verifies the decision model, production HTML, and hosting portability

## Useful Commands

- `npm run dev`: start the local development server
- `npm run build`: create the portable production build
- `npm start`: run the production server after building
- `npm test`: run the automated tests
- `npm run lint`: run ESLint across the project
