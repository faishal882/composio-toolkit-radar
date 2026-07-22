import { readFile, writeFile } from "node:fs/promises";

const raw = JSON.parse(await readFile("artifacts/research.raw.json", "utf8"));

// Human-reviewed classifications. The raw Composio search output remains immutable in
// artifacts/research.raw.json; this layer fixes collisions, unsupported inferences, and gates.
const source = `
Salesforce|Enterprise CRM for sales, service, and customer data|OAuth 2.0|Self-serve|REST + GraphQL|Official|Build now|Production access still follows org edition, scopes, and admin policy|
HubSpot|CRM and marketing automation platform|OAuth 2.0; private token|Self-serve|REST|Official|Build now|Public distribution requires OAuth and app review|
Pipedrive|Pipeline-focused sales CRM|OAuth 2.0; API token|Self-serve|REST|None found|Build now|Marketplace apps must use OAuth|
Attio|Flexible, data-model-driven CRM|OAuth 2.0; API key|Self-serve|REST|Official|Build now|Multi-workspace apps need OAuth|
Twenty|Open-source CRM with customizable objects|OAuth 2.0; API key|Open source|REST + GraphQL|Official|Build now|Self-hosted deployments add version variance|
Podio|Configurable work and relationship management|OAuth 2.0|Self-serve|REST|Official|Build now|Workspace permissions bound each token|https://developers.podio.com/authentication
Zoho CRM|Full-suite CRM for sales operations|OAuth 2.0|Self-serve|REST|None found|Build now|Multi-region domains and granular scopes add setup cost|
Close|Sales CRM with calling, email, and automation|API key; OAuth 2.0|Plan/admin|REST|None found|Build with constraints|API access requires a Close account; OAuth is for partner apps|https://developer.close.com/topics/authentication/
Copper|Google Workspace-centric CRM|API key; OAuth 2.0|Plan/admin|REST|None found|Build with constraints|Workspace user email and account permissions are required|
DealCloud|Deal and relationship management for capital markets|OAuth 2.0; API key|Plan/admin|REST + GraphQL|Official|Build with constraints|An admin must enable API access for the user group|
Zendesk|Ticketing and customer-service platform|OAuth 2.0; API token via Basic|Self-serve|REST|None found|Build now|API-token auth is scheduled for retirement in 2027|
Intercom|Customer messaging, support, and engagement|OAuth 2.0; access token|Self-serve|REST|Official|Build now|Public apps require review and approved scopes|
Freshdesk|Cloud helpdesk and ticketing software|API key via Basic|Plan/admin|REST|Official beta|Build with constraints|Official MCP is Enterprise EAP; API limits vary by plan|
Front|Collaborative inbox and customer-operations platform|OAuth 2.0; API token|Self-serve|REST|Official|Build now|Public apps require OAuth and marketplace review|
Pylon|B2B support platform spanning chat and tickets|Bearer token; OAuth 2.0|Plan/admin|REST|Official|Build with constraints|Only admins can create scoped API tokens|
LiveAgent|Helpdesk, chat, and call-center software|API key|Plan/admin|REST|None found|Build with constraints|API v1 and v3 use separate keys and plan limits|
Plain|API-first B2B customer support platform|Bearer token|Self-serve|GraphQL|None found|Build now|Workspace-scoped keys need careful tenant isolation|https://www.plain.com/docs/graphql/introduction
Help Scout|Shared inbox, docs, and customer support|OAuth 2.0; API key via Basic|Plan/admin|REST|None found|Build with constraints|Docs and Inbox APIs use different auth models|
Gorgias|Ecommerce-focused customer support helpdesk|API key via Basic; OAuth 2.0|Plan/admin|REST|None found|Build with constraints|Public apps require OAuth and review|
Gladly|Enterprise customer-service conversation platform|API token via Basic; OAuth 2.0|Contact sales|REST|None found|Outreach first|OAuth registration and API roles require Gladly coordination|
Slack|Team messaging and collaboration workspace|OAuth 2.0|Self-serve|REST + Events|Official|Build now|Workspace admin approval can block installation|
Twilio|Programmable messaging, voice, and communications|API key via Basic; OAuth 2.0|Self-serve|REST|None found|Build now|Capabilities and regulatory setup vary by country|
Zoho Cliq|Business team chat in the Zoho suite|OAuth 2.0|Self-serve|REST|None found|Build now|Zoho data-center domains must be handled correctly|
Lark|Messaging, documents, calendar, and workplace suite|App credentials; OAuth 2.0|Self-serve|REST|Official|Build now|Tenant admins approve app permissions|
Pumble|Team messaging and workspace collaboration|API key; OAuth 2.0|Plan/admin|REST|None found|Build with constraints|API add-on availability depends on workspace plan|
Discord|Community chat, bots, and real-time messaging|OAuth 2.0; bot token|Self-serve|REST + WebSocket|None found|Build now|Privileged gateway intents need approval at scale|
Telegram|Consumer messaging with bot and client APIs|Bot token; app ID/hash|Self-serve|REST + MTProto|None found|Build now|Bot API and user API are separate trust models|
WhatsApp Business|Business messaging over Meta's WhatsApp network|OAuth 2.0; bearer token|Review required|REST + Webhooks|None found|Build with constraints|Business verification, templates, and app review gate production|
Aircall|Cloud phone system and call-center platform|API token via Basic; OAuth 2.0|Review required|REST + Webhooks|None found|Outreach first|Multi-customer OAuth credentials require technology partnership|
Vonage|Programmable voice, video, SMS, and verification|API key via Basic; JWT|Self-serve|REST|None found|Build now|Each API family has a different signing scheme|
Google Ads|Programmatic campaign management and reporting|OAuth 2.0; developer token|Review required|REST + gRPC|None found|Build with constraints|Production developer-token access is reviewed|
Meta Ads|Advertising management across Meta properties|OAuth 2.0|Review required|REST|None found|Build with constraints|App Review and business permissions gate real customers|
LinkedIn Ads|Campaign creation and analytics on LinkedIn|OAuth 2.0|Review required|REST|None found|Outreach first|Advertising API products require explicit approval|
GoHighLevel|Agency CRM, funnels, and marketing automation|OAuth 2.0; private token|Plan/admin|REST + Webhooks|None found|Build with constraints|Marketplace access and OAuth depend on agency plan|
Mailchimp|Email marketing and audience automation|API key; OAuth 2.0|Self-serve|REST|None found|Build now|Partner listing requires review, but private use is immediate|
Klaviyo|Ecommerce marketing automation and customer data|API key; OAuth 2.0|Self-serve|REST|None found|Build now|Marketplace distribution requires OAuth and review|
systeme.io|Funnels, email, courses, and online-business automation|API key|Plan/admin|REST + Webhooks|None found|Build with constraints|Public API availability follows account access|https://developer.systeme.io/
Pinterest|Visual discovery and advertising platform|OAuth 2.0|Review required|REST|None found|Outreach first|Trial access itself requires application approval|
Threads|Meta's text-based social network|OAuth 2.0|Review required|REST + Webhooks|None found|Build with constraints|Non-tester access requires Meta App Review|
SendGrid|Transactional and marketing email delivery|API key|Self-serve|REST|None found|Build now|Sender verification is required before meaningful sends|
Shopify|Hosted commerce platform for online stores|OAuth 2.0; access token|Self-serve|GraphQL|None found|Build now|Public apps need review and version upgrades every quarter|
WooCommerce|Open-source commerce plugin for WordPress|API key via Basic; OAuth 1.0a|Open source|REST|None found|Build now|Store versions and plugins create schema variance|
BigCommerce|Hosted ecommerce platform for stores and channels|OAuth 2.0; access token|Self-serve|REST + GraphQL|Official|Build now|Marketplace publication requires partner review|
Salesforce Commerce Cloud|Enterprise storefront and commerce services|OAuth 2.0/2.1|Plan/admin|REST|Official beta|Build with constraints|Requires a licensed B2C Commerce instance and admin setup|
Adobe Commerce|Composable and self-hosted enterprise ecommerce|OAuth 1.0a; bearer token|Open source|REST + GraphQL|None found|Build with constraints|Deployment versions and admin integration setup vary|
Squarespace|Website builder with commerce APIs|API key; OAuth 2.0|Review required|REST + Webhooks|None found|Build with constraints|OAuth extensions require registration and review|https://developers.squarespace.com/commerce-apis/making-requests
Ecwid|Embeddable online-store and commerce platform|OAuth 2.0; access token|Plan/admin|REST + Webhooks|None found|Build with constraints|API access needs a paid store or manual dev-store upgrade|
Gumroad|Digital-product storefront and creator payments|OAuth 2.0; access token|Self-serve|REST|Community|Build now|API documentation is sparse and marketplace semantics are limited|https://gumroad.com/api
Amazon Selling Partner|Amazon seller operations, catalog, and orders|OAuth 2.0 (LWA)|Review required|REST|None found|Outreach first|Public apps undergo Amazon registration and data-access review|
Fanbasis|Creator storefronts, payments, and digital experiences|API key|Contact sales|REST + Webhooks|None found|Outreach first|Official API docs are login-gated; no public OAuth path|https://dev-docs.fanbasis.com/login.html
DataForSEO|SEO, SERP, and marketing-data APIs|Basic credentials|Self-serve|REST|None found|Build now|Usage is credit-based and asynchronous endpoints need polling|
SE Ranking|SEO rank tracking, audit, and competitive research|API token|Plan/admin|REST|Official|Build with constraints|API access and quotas depend on subscription|
Ahrefs|SEO backlink, keyword, and site data|API key; OAuth 2.0|Plan/admin|REST|Official|Build with constraints|Production integrations and hosted MCP require paid access|
MrScraper|Hosted AI-assisted web scraping|API token|Self-serve|REST|Official|Build now|Targets can block or change independently of the API|
Apify|Cloud platform for scraping and automation actors|API token; OAuth 2.0|Self-serve|REST|Official|Build now|Actor inputs and outputs are not uniform|
Firecrawl|Web crawling and extraction for LLM-ready content|API key; OAuth 2.0|Self-serve|REST|Official|Build now|Credits and target-site defenses constrain reliability|
Bright Data|Proxy, scraping, browser, and web-data platform|API key; proxy Basic|Self-serve|REST|Official|Build now|Products expose different endpoints and compliance controls|
Sherlock|Open-source CLI that finds usernames across sites|No auth|Open source|CLI/local|N/A|Build with constraints|No hosted API: toolkit must wrap a local process and normalize sites|https://github.com/sherlock-project/sherlock
Waterfall.io|Contact and company enrichment waterfall|API key|Contact sales|REST|None found|Outreach first|Master keys and broader access are enterprise-managed|
Clay|Data enrichment and outbound workflow platform|API key|Plan/admin|REST|Official|Build with constraints|Broader people/company API access is plan-dependent|
GitHub|Code hosting, collaboration, and software delivery|OAuth 2.0; app/PAT token|Self-serve|REST + GraphQL|Official|Build now|Fine-grained permissions and org approval need careful UX|
Vercel|Frontend cloud deployment and hosting platform|Bearer token; OAuth 2.0|Self-serve|REST|Official|Build now|Marketplace provider status is reviewed; private API use is immediate|
Netlify|Web hosting, deployment, forms, and edge services|PAT; OAuth 2.0|Self-serve|REST|None found|Build now|Public integrations must implement OAuth|
Cloudflare|Edge network, DNS, security, and developer platform|API token; OAuth 2.0|Self-serve|REST|None found|Build now|The API surface is huge and token permissions are product-specific|
Supabase|Open-source Postgres backend platform|API key; OAuth 2.1|Self-serve|REST + GraphQL|Official|Build now|Service-role credentials must never reach user-facing agents|
Neo4j|Graph database and managed graph platform|Basic; OAuth 2.0|Self-serve|REST|Official|Build now|Write queries need strong guardrails|
Snowflake|Enterprise cloud data warehouse and platform|PAT; OAuth 2.0; key pair|Self-serve|REST + SQL|Official|Build with constraints|Admins must configure integrations, roles, and network policy|
MongoDB Atlas|Managed document database and cloud operations|OAuth 2.0; digest API key|Self-serve|REST|Official|Build now|Legacy keys and service accounts coexist|
Datadog|Observability, monitoring, logs, and incident data|API + application keys; OAuth 2.0|Review required|REST|None found|Build with constraints|Multi-customer OAuth is limited to approved partners|
Sentry|Application error monitoring and performance tracing|Bearer token; OAuth 2.0|Self-serve|REST|Official|Build now|Public integrations still require partner review|
Notion|Collaborative docs, wikis, and structured databases|Bearer token; OAuth 2.0|Self-serve|REST|Official|Build now|Pages must be explicitly shared with each integration|
Airtable|Spreadsheet-database hybrid for team workflows|PAT; OAuth 2.0|Self-serve|REST|Official|Build now|Base-level permissions and rate limits shape tool design|
Linear|Issue tracking and product development workflow|API key; OAuth 2.0|Self-serve|GraphQL|Official|Build now|GraphQL complexity needs a curated action layer|
Jira|Issue tracking and agile project management|OAuth 2.0; API token via Basic|Self-serve|REST + GraphQL|Official|Build now|Cloud and Data Center APIs differ materially|
Asana|Work, task, and project management|PAT; OAuth 2.0|Self-serve|REST|Official|Build now|Enterprise service accounts require super-admin setup|
Monday.com|Visual work management and automation platform|API token; OAuth 2.1|Self-serve|GraphQL|Official|Build now|Complexity accounting and board schemas vary|
ClickUp|Tasks, docs, chat, and project management|Personal token; OAuth 2.0|Self-serve|REST|Official|Build now|Workspace admins can restrict MCP and app installs|
Coda|Collaborative documents with programmable tables|API token; OAuth 2.0|Self-serve|REST|Official|Build now|Pack OAuth and public API tokens are separate paths|https://coda.io/developers/apis/v1
Smartsheet|Enterprise work management in grid form|Bearer token; OAuth 2.0|Plan/admin|REST|None found|Build with constraints|API access requires Business or Enterprise plan|
Harvest|Time tracking, expenses, and invoicing|PAT; OAuth 2.0|Self-serve|REST|None found|Build now|Only admins can register OAuth applications|
Stripe|Payments, billing, and financial infrastructure|API key; OAuth 2.0|Self-serve|REST|Official|Build now|Use restricted keys and confirmation steps for money movement|
Plaid|Bank-account connectivity and financial data|Client ID + secret; OAuth|Self-serve|REST|None found|Build with constraints|Production access and institution OAuth require review|
Binance|Crypto exchange, trading, and market data|Signed API key; partner OAuth 2.0|Self-serve|REST + WebSocket|None found|Build with constraints|Trading actions need strict scope and confirmation controls|
Paygent Connect|Marketplace payments, onboarding, and payouts|Bearer API key|Contact sales|REST + Webhooks|None found|Outreach first|Docs are not publicly indexed; commercial onboarding is required|https://www.gopaygent.com/
iPayX|Institutional foreign-exchange audit and verification|Unknown|Contact sales|No public API|None found|No public API|No public developer documentation or credential path was located|https://www.ipayx.ai/
QuickBooks|Small-business accounting, invoices, and payments|OAuth 2.0|Self-serve|REST|None found|Build now|Production apps must pass Intuit review|
Xero|Cloud accounting and bookkeeping platform|OAuth 2.0|Self-serve|REST|None found|Build with constraints|Connection-based pricing and app review affect distribution|
Brex|Corporate cards, spend, travel, and banking|Bearer token; OAuth 2.0|Plan/admin|REST|Official|Build with constraints|Customer admin agreement or partner approval is required|
Ramp|Corporate cards, expenses, and accounts payable|OAuth 2.0|Review required|REST|Official|Build with constraints|Developer access and sensitive scopes are reviewed|
PitchBook|Private-market company, deal, and investor research|API token|Contact sales|REST|Official|Outreach first|API and premium MCP are licensed enterprise products|https://pitchbook.com/data/api
NotebookLM|Grounded research notebooks over uploaded sources|Google IAM/OAuth|Plan/admin|REST preview|None found|Build with constraints|Only Gemini Notebook Enterprise exposes a preview API and needs licenses|https://docs.cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/api-notebooks
Otter AI|Meeting recording, transcription, and knowledge search|Bearer API key; MCP OAuth|Plan/admin|REST|Official|Build with constraints|REST API is Enterprise-only; MCP has no public API-key flow|https://help.otter.ai/hc/en-us/articles/36130822688279-Otter-ai-Public-API
Fathom|AI meeting recorder, summaries, and call insights|API key; OAuth 2.0|Self-serve|REST|Official|Build now|Public OAuth promotion may require review|
Consensus|AI search engine for scientific research|MCP OAuth; enterprise API key|Plan/admin|REST|Official|Build with constraints|MCP is self-serve, but raw API access is enterprise-gated|https://docs.consensus.app/docs/mcp
Reducto|Document parsing, extraction, and transformation|Bearer API key|Self-serve|REST|Official|Build now|Document workloads are asynchronous and credit-bound|
Devin|Autonomous software-engineering agent platform|Bearer API key; MCP OAuth|Plan/admin|REST|Official|Build with constraints|Requires a paid Devin workspace and organization policy|
Higgsfield|AI image and video generation suite|API credentials|Self-serve|REST|Official|Build now|Generation is asynchronous and credit-intensive|
Mermaid CLI|Local CLI that renders Mermaid diagrams to files|No auth|Open source|CLI/local|N/A|Build with constraints|Not a SaaS API; toolkit must sandbox local file and browser execution|https://github.com/mermaid-js/mermaid-cli
YouTube Transcript|API for transcripts, video metadata, and search|Bearer API key; MCP OAuth|Self-serve|REST|Official|Build now|Paid credits are required beyond free metadata calls|https://transcriptapi.com/docs/api/
Grain|AI meeting recording, transcripts, and conversation intelligence|PAT; OAuth 2.0|Self-serve|REST|Official|Build now|Workspace permissions bound transcript access|https://developers.grain.com/
`.trim();

const records = source.split("\n").map((line) => line.split("|"));
if (records.length !== 100) throw new Error(`Expected 100 curated records, got ${records.length}`);

const rows = records.map((fields, index) => {
  const [name, description, auth, access, api, mcp, verdict, blocker, overrideUrl] = fields;
  const rawRow = raw.rows[index];
  if (rawRow?.app !== name) {
    throw new Error(`Row ${index + 1} mismatch: seed=${rawRow?.app}, curated=${name}`);
  }
  const fallback = rawRow.citations.find((item) => /^https:\/\//.test(item.url ?? ""));
  const evidenceUrl = overrideUrl || fallback?.url;
  if (!evidenceUrl) throw new Error(`No evidence URL for ${name}`);
  const confidence =
    verdict === "No public API" || access === "Contact sales"
      ? "Medium"
      : evidenceUrl.includes("github.com") && access !== "Open source"
        ? "Medium"
        : "High";

  return {
    id: index + 1,
    name,
    category: rawRow.category,
    description,
    auth: auth.split("; "),
    access,
    api,
    mcp,
    verdict,
    blocker,
    evidence: [{ label: "Primary evidence", url: evidenceUrl }],
    confidence,
    checkedAt: "2026-07-23",
  };
});

await writeFile("data/apps.json", `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Wrote ${rows.length} reviewed rows to data/apps.json`);
