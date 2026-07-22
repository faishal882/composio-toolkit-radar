# Manual completion checklist

The engineering, research artifacts, and browser checks are reproducible. The assignment still asks for a human check, so the submitter should personally complete this short signoff before sending the links.

## 1. Review the 20-app audit ledger

Open `data/verification.json`. For each entry in `samples`, open its first `sourceUrls` link and compare the final row in `data/apps.json` against these eight fields:

- identity
- category
- one-line description
- authentication
- access gate
- API surface
- MCP status
- buildability verdict

The ten stratified apps are Attio, Intercom, Slack, Google Ads, BigCommerce, Ahrefs, GitHub, Notion, Stripe, and Otter AI.

The ten adversarial apps are Close, Plain, systeme.io, Fanbasis, Sherlock, Paygent Connect, iPayX, NotebookLM, Mermaid CLI, and YouTube Transcript.

Do not turn an unknown into a positive claim. Four claim-points intentionally remain unsupported: Fanbasis access breadth, Paygent API breadth, and iPayX authentication/API availability.

## 2. Confirm the honest score

Run:

```bash
npm run build:data
npm test
npm run validate
npm run verify:browser
```

Expected verification-set result:

- first pass: 101/160, or 63.1%
- final pass: 156/160, or 97.5%
- stratified cohort: 79/80 to 80/80
- adversarial cohort: 22/80 to 76/80

If your manual reading changes any judgment, edit the support matrix in `scripts/build_verification.py`, regenerate the data, and keep the lower honest score.

## 3. Check the deployed case study

Open the live page on desktop and mobile. In roughly two minutes, confirm you can answer:

1. What should Composio build now?
2. What is the largest blocker class?
3. Which categories are easiest and most gated?
4. What did the agent automate?
5. Where did a human intervene?
6. How was the 97.5% verification-set score calculated?

Test one table search, one category filter, one evidence link, the raw agent artifact, the 160-claim audit link, and the browser-verification link.

## 4. Submit

Send only:

- Live case study: https://faishal882.github.io/composio-toolkit-radar/
- Source repository: https://github.com/faishal882/composio-toolkit-radar

Suggested one-line note:

> I built a Composio-powered, resumable research pipeline for 100 requested integrations, then added provider-domain gates, a 160-claim verification ledger, browser checks, and explicit human review for collision-prone or gated cases.
