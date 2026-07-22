import { mkdir } from "node:fs/promises";

type SeedGroup = { category: string; apps: string[] };
type SearchCitation = { title?: string; url?: string; publishedDate?: string };
type RawRow = {
  id: number;
  app: string;
  category: string;
  query: string;
  researchedAt: string;
  answer: string;
  citations: SearchCitation[];
  status: "researched" | "needs_human_review";
  error?: string;
};

const args = process.argv.slice(2);
const valueAfter = (flag: string) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};
const limit = Number(valueAfter("--limit") ?? "100");
const offset = Number(valueAfter("--offset") ?? "0");
const concurrency = Math.max(1, Math.min(5, Number(valueAfter("--concurrency") ?? "4")));
const output = valueAfter("--output") ?? "artifacts/research.raw.json";

const seed = (await Bun.file("data/apps-seed.json").json()) as SeedGroup[];
const allApps = seed.flatMap((group) =>
  group.apps.map((app) => ({ app, category: group.category })),
);
const selected = allApps.slice(offset, offset + limit);

const researchOne = async (
  item: { app: string; category: string },
  index: number,
): Promise<RawRow> => {
  const query = [
    `${item.app} official developer documentation`,
    "API authentication OAuth API key Basic token",
    "developer signup free trial pricing admin approval partner access",
    "REST GraphQL webhooks official MCP server",
    "Use provider-owned sources. State unknown when evidence is absent.",
  ].join("; ");

  try {
    const result = await execute("COMPOSIO_SEARCH_WEB", { query });
    const payload = result?.data ?? {};
    const citations = Array.isArray(payload.citations) ? payload.citations : [];
    const answer = typeof payload.answer === "string" ? payload.answer : "";
    const officialish = citations.filter((citation: SearchCitation) =>
      /^https?:\/\//.test(citation.url ?? ""),
    );

    return {
      id: offset + index + 1,
      app: item.app,
      category: item.category,
      query,
      researchedAt: new Date().toISOString(),
      answer,
      citations: officialish,
      status:
        answer.length >= 120 && officialish.length > 0
          ? "researched"
          : "needs_human_review",
    };
  } catch (error) {
    return {
      id: offset + index + 1,
      app: item.app,
      category: item.category,
      query,
      researchedAt: new Date().toISOString(),
      answer: "",
      citations: [],
      status: "needs_human_review",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

const rows: RawRow[] = [];
for (let start = 0; start < selected.length; start += concurrency) {
  const batch = selected.slice(start, start + concurrency);
  const batchRows = await Promise.all(
    batch.map((item, batchIndex) => researchOne(item, start + batchIndex)),
  );
  rows.push(...batchRows);
  console.error(
    `[research] ${Math.min(start + batch.length, selected.length)}/${selected.length}`,
  );
}

await mkdir(output.split("/").slice(0, -1).join("/") || ".", {
  recursive: true,
});
await Bun.write(
  output,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      method: "Composio COMPOSIO_SEARCH_WEB with provider-owned-source prompt",
      offset,
      requested: selected.length,
      researched: rows.filter((row) => row.status === "researched").length,
      needsHumanReview: rows.filter((row) => row.status === "needs_human_review").length,
      rows,
    },
    null,
    2,
  )}\n`,
);

console.log(
  JSON.stringify({ output, rows: rows.length, needsHumanReview: rows.filter((row) => row.status === "needs_human_review").length }),
);
