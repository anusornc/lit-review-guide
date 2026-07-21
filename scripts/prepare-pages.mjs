import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

await writeFile(resolve(process.cwd(), "out", ".nojekyll"), "");
