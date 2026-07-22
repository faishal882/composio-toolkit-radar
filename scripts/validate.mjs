import { readFile } from "node:fs/promises";

const required = [
  "id",
  "name",
  "category",
  "description",
  "auth",
  "access",
  "api",
  "mcp",
  "verdict",
  "blocker",
  "evidence",
  "confidence",
];

const rows = JSON.parse(await readFile("data/apps.json", "utf8"));
const errors = [];
if (rows.length !== 100) errors.push(`expected 100 rows, found ${rows.length}`);
if (new Set(rows.map((row) => row.id)).size !== rows.length) errors.push("duplicate ids");
if (new Set(rows.map((row) => row.name)).size !== rows.length) errors.push("duplicate app names");

for (const row of rows) {
  for (const key of required) {
    if (!(key in row)) errors.push(`${row.id ?? "?"}: missing ${key}`);
  }
  if (!Array.isArray(row.auth) || row.auth.length === 0) errors.push(`${row.id}: auth must be non-empty`);
  if (!Array.isArray(row.evidence) || row.evidence.length === 0) errors.push(`${row.id}: evidence must be non-empty`);
  for (const item of row.evidence ?? []) {
    if (!/^https:\/\//.test(item.url ?? "")) errors.push(`${row.id}: invalid evidence URL ${item.url}`);
  }
  if (/none|n\/a/i.test(row.blocker ?? "")) errors.push(`${row.id}: blocker must be explicit, not ${row.blocker}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const counts = (field) =>
  Object.fromEntries(
    [...new Set(rows.map((row) => row[field]))]
      .sort()
      .map((value) => [value, rows.filter((row) => row[field] === value).length]),
  );
console.log(JSON.stringify({ rows: rows.length, verdicts: counts("verdict"), access: counts("access"), confidence: counts("confidence") }, null, 2));
