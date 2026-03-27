document.addEventListener("DOMContentLoaded", initSidePanel);

function initSidePanel() {
  document
    .getElementById("refresh-data")
    .addEventListener("click", refreshData);

  loadData();

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") loadData();
  });
}

function refreshData() {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (!tabs[0]?.id) return;
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "refreshData"
    });
  });
}

function loadData() {
  chrome.storage.local.get(
    ["schemaData", "analyticsCodes", "providerInfo", "metaInfo"],
    ({ schemaData, analyticsCodes, providerInfo, metaInfo }) => {
      renderAddress(schemaData);
      renderGeo(schemaData);
      renderSocial(schemaData);
      renderAnalytics(analyticsCodes);
      renderProvider(providerInfo);
      renderMeta(metaInfo);
    }
  );
}

/* Master Render */

function renderProvider(provider) {
  const el = document.getElementById("provider-info");
  el.innerHTML = "";

  if (!provider?.name) return renderEmpty(el);

  const div = document.createElement("div");
  div.className = "detail";

  let icon = "";
  let iconClass = "";

  if (provider.confidence === "high") {
    icon = "✔";
    iconClass = "provider-icon provider-high";
  } else if (provider.confidence === "medium") {
    icon = "!";
    iconClass = "provider-icon provider-medium";
  }

  div.innerHTML = `
    ${icon ? `<span class="${iconClass}">${icon}</span>` : ""}
    <div>
      <div class="label">Platform</div>
      ${provider.name}
    </div>
  `;

  el.appendChild(div);
}

function renderAddress(schema) {
  const el = document.getElementById("address-info");
  el.innerHTML = "";

  if (!schema?.address) return renderEmpty(el);

  const a = schema.address;
  const text = [
    a.street,
    a.city && `${a.city}, ${a.state} ${a.zip}`,
    a.country
  ].filter(Boolean).join("\n");

  text ? renderValue(el, text) : renderEmpty(el);
}

function renderGeo(schema) {
  const el = document.getElementById("geo-info");
  el.innerHTML = "";

  if (!schema?.geo?.lat || !schema?.geo?.lng)
    return renderEmpty(el);

  renderLabeled(el, "Latitude", schema.geo.lat);
  renderLabeled(el, "Longitude", schema.geo.lng);

  if (schema.maps?.length) {
    schema.maps.forEach(url => renderLabeled(el, "Map", url));
  }
}

function renderSocial(schema) {
  const el = document.getElementById("social-info");
  el.innerHTML = "";

  if (!schema?.social?.length) return renderEmpty(el);

  schema.social.forEach(url => renderValue(el, url));
}

function renderAnalytics(codes) {
  const el = document.getElementById("analytics-info");
  el.innerHTML = "";

  const data = codes || { ga4: [], ua: [], gtm: [] };
  let found = false;

  data.ga4.forEach(v => { found = true; renderLabeled(el, "GA4", v); });
  data.ua.forEach(v => { found = true; renderLabeled(el, "UA", v); });
  data.gtm.forEach(v => { found = true; renderLabeled(el, "GTM", v); });

  if (!found) renderEmpty(el);
}

function renderMeta(meta) {
  const el = document.getElementById("meta-info");
  el.innerHTML = "";

  if (!meta?.title && !meta?.description) return renderEmpty(el);

  if (meta.title) renderLabeled(el, "Title", meta.title);
  if (meta.description) renderLabeled(el, "Description", meta.description);
}

/* Support Functions */

function renderValue(container, value) {
  const div = document.createElement("div");
  div.className = "detail";
  div.textContent = value;
  div.onclick = () => navigator.clipboard.writeText(value);
  container.appendChild(div);
}

function renderLabeled(container, label, value) {
  const div = document.createElement("div");
  div.className = "detail";
  div.innerHTML = `<div class="label">${label}</div>${value}`;
  div.onclick = () => navigator.clipboard.writeText(value);
  container.appendChild(div);
}

function renderEmpty(container) {
  const div = document.createElement("div");
  div.className = "no-data";
  div.textContent = "No data found";
  container.appendChild(div);
}