const [apps, verification] = await Promise.all([
  fetch("data/apps.json").then((response) => response.json()),
  fetch("data/verification.json").then((response) => response.json()),
]);

const $ = (selector) => document.querySelector(selector);
const body = $("#apps-body");
const search = $("#search");
const categoryFilter = $("#category-filter");
const verdictFilter = $("#verdict-filter");
const accessFilter = $("#access-filter");

const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const options = (element, values) => {
  [...new Set(values)].sort().forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    element.append(option);
  });
};

options(categoryFilter, apps.map((app) => app.category));
options(verdictFilter, apps.map((app) => app.verdict));
options(accessFilter, apps.map((app) => app.access));

const renderRows = (rows) => {
  body.innerHTML = rows.map((app) => `
    <tr>
      <th scope="row">
        <span class="app-index">${String(app.id).padStart(2, "0")}</span>
        <strong>${app.name}</strong>
        <small>${app.category}</small>
      </th>
      <td>${app.description}</td>
      <td><strong>${app.auth.join(" · ")}</strong><span class="access-label">${app.access}</span></td>
      <td><strong>${app.api}</strong><span>${app.mcp === "N/A" ? "MCP not applicable" : `${app.mcp} MCP`}</span></td>
      <td><span class="verdict verdict-${slug(app.verdict)}">${app.verdict}</span><small>${app.blocker}</small></td>
      <td><a class="evidence-link" href="${app.evidence[0].url}" target="_blank" rel="noreferrer">Source <span aria-hidden="true">↗</span></a><small>${app.confidence} confidence</small></td>
    </tr>
  `).join("");
  $("#visible-count").textContent = rows.length;
  $("#empty-state").hidden = rows.length !== 0;
  $(".table-shell").hidden = rows.length === 0;
};

const applyFilters = () => {
  const query = search.value.trim().toLowerCase();
  const rows = apps.filter((app) => {
    const haystack = [app.name, app.category, app.description, ...app.auth, app.access, app.api, app.mcp, app.verdict, app.blocker].join(" ").toLowerCase();
    return (!query || haystack.includes(query))
      && (!categoryFilter.value || app.category === categoryFilter.value)
      && (!verdictFilter.value || app.verdict === verdictFilter.value)
      && (!accessFilter.value || app.access === accessFilter.value);
  });
  renderRows(rows);
};

$("#filters").addEventListener("input", applyFilters);
$("#filters").addEventListener("reset", () => requestAnimationFrame(applyFilters));
renderRows(apps);

const categoryStats = Object.values(apps.reduce((map, app) => {
  map[app.category] ??= { name: app.category, total: 0, ready: 0 };
  map[app.category].total += 1;
  if (app.verdict === "Build now") map[app.category].ready += 1;
  return map;
}, {})).sort((a, b) => b.ready - a.ready || a.name.localeCompare(b.name));

$("#category-bars").innerHTML = categoryStats.map((item) => `
  <div class="category-row">
    <span>${item.name}</span>
    <div class="category-track"><i style="--ready: ${item.ready * 10}%"></i></div>
    <strong>${item.ready}/10</strong>
  </div>
`).join("");

const featuredCorrections = verification.samples.filter((item) => [8, 58, 84, 91, 98, 99].includes(item.id));
$("#corrections").innerHTML = featuredCorrections.map((item) => {
  const app = apps[item.id - 1];
  return `
    <article class="correction">
      <div><span>${app.name}</span><strong>${item.first}/8 → ${item.final}/8</strong></div>
      <p>${item.note}</p>
      <a href="${app.evidence[0].url}" target="_blank" rel="noreferrer">Verified source ↗</a>
    </article>
  `;
}).join("");
