import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("uses the standard Next.js runtime without Sites or Cloudflare coupling", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  const nextConfig = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");

  assert.equal(packageJson.name, "litwise-literature-review-guide");
  assert.equal(packageJson.scripts.dev, "next dev");
  assert.equal(packageJson.scripts.build, "next build && node scripts/prepare-standalone.mjs");
  assert.equal(packageJson.scripts["build:pages"], "GITHUB_PAGES=true next build && node scripts/prepare-pages.mjs");
  assert.equal(packageJson.scripts.start, "node .next/standalone/server.js");
  assert.equal(packageJson.scripts.test, "npm run build && node --test tests/*.test.mjs");
  assert.match(nextConfig, /output: isGitHubPages \? ["']export["'] : ["']standalone["']/);
  await access(new URL("../scripts/prepare-standalone.mjs", import.meta.url));

  const installedPackages = { ...packageJson.dependencies, ...packageJson.devDependencies };
  for (const packageName of ["vinext", "vite", "wrangler", "@cloudflare/vite-plugin", "@vitejs/plugin-react", "@vitejs/plugin-rsc", "drizzle-kit", "drizzle-orm"]) {
    assert.equal(installedPackages[packageName], undefined, `${packageName} should not be required`);
  }

  for (const relativePath of [
    ".openai/hosting.json",
    "vite.config.ts",
    "worker/index.ts",
    "build/sites-vite-plugin.ts",
    "app/chatgpt-auth.ts",
    "db/index.ts",
    "drizzle.config.ts",
  ]) {
    await assert.rejects(access(new URL(`../${relativePath}`, import.meta.url)), `${relativePath} should be removed`);
  }
});

test("documents direct Node and Docker deployment", async () => {
  const [readme, dockerfile, dockerIgnore] = await Promise.all([
    readFile(new URL("../README.md", import.meta.url), "utf8"),
    readFile(new URL("../Dockerfile", import.meta.url), "utf8"),
    readFile(new URL("../.dockerignore", import.meta.url), "utf8"),
  ]);

  assert.match(readme, /http:\/\/localhost:3000/);
  assert.match(readme, /npm ci[\s\S]*npm run build[\s\S]*npm start/);
  assert.match(readme, /docker build[\s\S]*docker run/);
  assert.match(readme, /reverse proxy/i);
  assert.match(dockerfile, /FROM node:22-alpine AS builder/);
  assert.match(dockerfile, /npm run build/);
  assert.match(dockerfile, /\.next\/standalone/);
  assert.match(dockerfile, /CMD \["node", "server\.js"\]/);
  assert.match(dockerIgnore, /node_modules/);
  assert.match(dockerIgnore, /\.next/);
});

test("keeps provider-specific runtimes out while allowing a static Pages workflow", async () => {
  const gitignore = await readFile(new URL("../.gitignore", import.meta.url), "utf8");
  assert.doesNotMatch(gitignore, /\.vinext/);
  assert.doesNotMatch(gitignore, /\.wrangler/);
  assert.doesNotMatch(gitignore, /\.openai\/hosting\.json/);
  await access(new URL("../.github/workflows/deploy-pages.yml", import.meta.url));
  await access(projectRoot);
});
