import { mkdir, readFile, writeFile } from "node:fs/promises";

const rows = JSON.parse(await readFile("data/apps.json", "utf8"));
const concurrency = 8;
const results = [];

async function check(row) {
  const url = row.evidence[0].url;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "ToolkitRadarEvidenceCheck/1.0 (+case-study)" },
    });
    return {
      id: row.id,
      name: row.name,
      url,
      status: response.status,
      finalUrl: response.url,
      reachable: response.status < 500,
      note: response.status === 403 || response.status === 429 ? "Browser-accessible but automated request restricted" : "",
    };
  } catch (error) {
    return { id: row.id, name: row.name, url, status: 0, reachable: false, note: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timer);
  }
}

for (let start = 0; start < rows.length; start += concurrency) {
  results.push(...(await Promise.all(rows.slice(start, start + concurrency).map(check))));
  process.stderr.write(`\r[evidence] ${Math.min(start + concurrency, rows.length)}/${rows.length}`);
}
process.stderr.write("\n");

const summary = {
  checkedAt: new Date().toISOString(),
  total: results.length,
  reachable: results.filter((item) => item.reachable).length,
  success2xx: results.filter((item) => item.status >= 200 && item.status < 300).length,
  redirectsOrRestricted: results.filter((item) => item.status >= 300 && item.status < 500).length,
  failed: results.filter((item) => !item.reachable).length,
};
await mkdir("artifacts", { recursive: true });
await writeFile("artifacts/evidence-check.json", `${JSON.stringify({ summary, results }, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
