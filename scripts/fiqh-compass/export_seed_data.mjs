import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { axes, questions, contentVersion, answerOptions } from "../../src/data/fiqh-compass.ts";
import { issueGroups, candidateProfiles, plannedTraditions } from "../../src/data/fiqh-compass-research.ts";

const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const outDir = resolve(root, process.argv[2] ?? "scratch/fiqh-compass");
const [axesFile, researchFile] = await Promise.all([
  readFile(resolve(root, "src/data/fiqh-compass.ts")),
  readFile(resolve(root, "src/data/fiqh-compass-research.ts")),
]);
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const issueCount = issueGroups.reduce((count, group) => count + group.issues.length, 0);
const seed = {
  schema_version: "1.0.0",
  source_content_version: contentVersion,
  source_sha256: {
    "src/data/fiqh-compass.ts": sha256(axesFile),
    "src/data/fiqh-compass-research.ts": sha256(researchFile),
  },
  axes: axes.map(({ id, title, low, high, note }) => ({ axis_id: id, title, low_endpoint: low, high_endpoint: high, scope_note: note })),
  questions: questions.map(({ id, axis, direction, prompt }) => ({ question_id: id, axis_id: axis, direction, prompt })),
  answer_options: answerOptions,
  issue_groups: issueGroups,
  issue_count: issueCount,
  candidate_profiles: candidateProfiles,
  planned_traditions: plannedTraditions,
};
if (seed.axes.length !== 12 || seed.questions.length !== 24 || issueCount !== 20) {
  throw new Error(`Unexpected Fiqh Compass seed counts: axes=${seed.axes.length}, questions=${seed.questions.length}, issues=${issueCount}`);
}
await mkdir(outDir, { recursive: true });
await writeFile(resolve(outDir, "seed-data.json"), `${JSON.stringify(seed, null, 2)}\n`, "utf8");
process.stdout.write(JSON.stringify({ out: resolve(outDir, "seed-data.json"), axes: seed.axes.length, questions: seed.questions.length, issues: issueCount, profiles: seed.candidate_profiles.length }));
