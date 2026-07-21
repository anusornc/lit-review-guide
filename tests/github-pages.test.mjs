import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("defines a repository-aware GitHub Pages export", async () => {
  const [packageJsonText, nextConfig, workflow, preparePages] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8"),
    readFile(new URL("../scripts/prepare-pages.mjs", import.meta.url), "utf8"),
  ]);
  const packageJson = JSON.parse(packageJsonText);

  assert.match(packageJson.scripts["build:pages"], /GITHUB_PAGES=true next build/);
  assert.match(packageJson.scripts["build:pages"], /prepare-pages\.mjs/);
  assert.match(nextConfig, /process\.env\.GITHUB_PAGES === "true"/);
  assert.match(nextConfig, /output: isGitHubPages \? "export" : "standalone"/);
  assert.match(nextConfig, /NEXT_PUBLIC_BASE_PATH/);
  assert.match(nextConfig, /basePath/);
  assert.match(preparePages, /\.nojekyll/);

  assert.match(workflow, /pages:\s*write/);
  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /npm run build:pages/);
  assert.match(workflow, /GITHUB_REPOSITORY#\*\//);
  assert.match(workflow, /GITHUB_REPOSITORY_OWNER.*github\.io/);
  assert.match(workflow, /steps\.pages-path\.outputs\.base_path/);
  assert.match(workflow, /path:\s*\.\/out/);
});

test("keeps request-only Next.js features out of the static page path", async () => {
  const [page, layout, guideClient] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/guide-client.tsx", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page, /next\/headers|cookies\(|headers\(/);
  assert.doesNotMatch(layout, /next\/headers|cookies\(|headers\(/);
  await assert.rejects(access(new URL("../proxy.ts", import.meta.url)));
  assert.match(layout, /URLSearchParams/);
  assert.match(layout, /litwise-language/);
  assert.match(layout, /navigator\.language/);
  assert.match(guideClient, /resolveLocalePreference/);
  assert.match(guideClient, /resolveThemePreference/);
  assert.match(guideClient, /localStorage\.getItem\("litwise-language"\)/);
});
