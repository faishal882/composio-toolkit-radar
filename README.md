# Toolkit Radar

An evidence-backed build-versus-outreach map for 100 app integrations. This repository is the source for a two-minute case study and the reproducible research agent behind it.

## What is here

- `index.html` — the single-page case study and interactive 100-app matrix.
- `data/apps.json` — the reviewed, machine-readable final dataset.
- `data/verification.json` — the 20-app, 160-claim accuracy audit.
- `agent/research.ts` — the Composio-powered discovery agent.
- `artifacts/research.raw.json` — immutable first-pass answers and citations for all 100 apps.
- `scripts/curate.mjs` — the explicit human-review layer that fixes entity collisions and unsupported claims.
- `scripts/validate.mjs` — schema, count, URL, and consistency gates.
- `scripts/check-evidence.mjs` — live reachability checks for every primary evidence URL.

## Run the case study

Requirements: Python 3 for the zero-dependency local server.

```bash
npm run serve
```

Open <http://localhost:4173>.

## Run the research agent

Requirements:

1. Install the current [Composio CLI](https://docs.composio.dev/docs/cli).
2. Authenticate with `composio login`.
3. Confirm the `composio_search` toolkit is connected with `composio whoami` and `composio search "fetch a public webpage"`.

Run the full set:

```bash
npm run research -- --limit 100 --concurrency 4
```

Run a cheap smoke test without overwriting the included raw artifact:

```bash
npm run research -- --limit 3 --output artifacts/live/smoke.json
```

The agent calls `COMPOSIO_SEARCH_WEB` with an evidence-first prompt, four apps at a time. It stores the answer and every returned citation before any human editing. Concurrency is capped at five to reduce throttling.

## Research and verification loop

```text
100 exact entities
      ↓
Composio discovery (provider-owned sources requested)
      ↓
immutable raw answers + citations
      ↓
entity/domain/auth/access/MCP review
      ↓
100-row schema and evidence checks
      ↓
20-app claim-level audit
```

The first pass scored **102/160 supported claims (63.8%)** on the QA sample. After the review loop, it scored **156/160 (97.5%)**. The final four unsupported claim-points remain visible as medium-confidence rather than being guessed.

The most important failure classes were:

- **Name collisions:** Sherlock resolved to an unrelated payment product.
- **Entity drift:** Mermaid CLI became the separate Mermaid Chart SaaS.
- **Vendor confusion:** Paygent Connect became an unrelated AI-billing product; iPayX became IXOPAY.
- **Citation contamination:** Close and Plain received unrelated MCP sources.
- **Official/community confusion:** a community adapter was initially treated as first-party MCP.

## Validate the final artifact

```bash
npm run validate
npm run check:evidence
```

`validate` fails on missing rows/fields, duplicate IDs or names, invalid evidence URLs, empty auth/evidence, or vague blockers. `check:evidence` performs a live GET against all 100 primary sources and writes `artifacts/evidence-check.json`.

Some documentation providers return 403/429 to automated clients or fail Node fetch while loading in a browser. Those cases are retained in the evidence report instead of being silently counted as healthy.

## Dataset fields

Each app records:

- category and one-line product description;
- authentication methods;
- credential path (`Self-serve`, `Plan/admin`, `Review required`, `Contact sales`, or `Open source`);
- API surface and MCP status;
- buildability verdict and the concrete blocker;
- primary evidence URL, confidence, and check date.

## Deliberate limitations

- “None found” means no first-party MCP was located in this research pass, not proof that no community implementation exists.
- Pricing and access rules change quickly; `checkedAt` is present on every row for refresh scheduling.
- No paid vendor accounts were used. A plan or partnership gate is reported as a finding, not bypassed.
- The raw agent is a discovery layer, not an authority. Final claims require provider-owned evidence or remain uncertain.
