let lastFocusedElement = document.activeElement;

function trackTarget(e) {
  const el = e.target;
  if (
    el &&
    (el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      el.isContentEditable)
  ) {
    lastFocusedElement = el;
  }
}

window.addEventListener("focusin", trackTarget);
window.addEventListener("contextmenu", trackTarget);

function insertText(el, text) {
  if (!el || !text) return;

  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;

    el.value =
      el.value.slice(0, start) +
      text +
      el.value.slice(end);

    el.setSelectionRange(start + text.length, start + text.length);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.focus();
  } else if (el.isContentEditable) {
    document.execCommand("insertText", false, text);
  }
}

/* Website Provider Detection [WIP] */

function detectProviderTier1(schemaNodes) {
  const providerDefs = [
    { name: "dealer-inspire", match: "dealerinspire.com" },
    { name: "dealer-com", match: "dealer.com" },
    { name: "dealeron", match: "dealeron.com" },
    { name: "dealerfire", match: "dealerfire.com" },
    { name: "team-velocity", match: "teamvelocitymarketing.com" },
    { name: "dealer-eprocess", match: "dealereprocess.com" },
    { name: "cloud-software-group", match: "cloudsoftwaregroup.com" },
    { name: "flexdealer", match: "flexdealer.com" },
    { name: "haystak-digital", match: "haystakdigital.com" },
    { name: "netsertive", match: "netsertive.com" },
    { name: "leadcar", match: "leadcar.com" },
    { name: "360-agency", match: "360.agency" }
  ];

  /* Primary: src */
  const scriptSrcs = Array.from(document.querySelectorAll("script[src]"))
    .map(s => s.src.toLowerCase());

  for (const p of providerDefs) {
    if (scriptSrcs.some(src => src.includes(p.match))) {
      return { name: p.name, confidence: "high" };
    }
  }

  /* Fallback: <a> href */
  const linkHrefs = Array.from(document.querySelectorAll("a[href]"))
    .map(a => a.href.toLowerCase());

  for (const p of providerDefs) {
    if (linkHrefs.some(href => href.includes(p.match))) {
      return { name: p.name, confidence: "medium" };
    }
  }

  /* Worst case scenario detection */
  if (schemaNodes.some(n => n["@graph"])) {
    return { name: "unknown", confidence: "medium" };
  }

  return { name: "unknown", confidence: "low" };
}

/* Extract Schema Data */

function extractSchemaData() {
  const scripts = document.querySelectorAll(
    'script[type="application/ld+json"]'
  );

  const blocks = [];
  scripts.forEach(script => {
    try {
      blocks.push(JSON.parse(script.textContent.trim()));
    } catch {
      /* ignore invalid JSON */
    }
  });

  const nodes = [];
  blocks.forEach(b => {
    if (Array.isArray(b)) nodes.push(...b);
    else if (b?.["@graph"]) nodes.push(...b["@graph"]);
    else if (typeof b === "object") nodes.push(b);
  });

  const result = {
    address: {
      street: null,
      city: null,
      state: null,
      zip: null,
      country: null
    },
    geo: {
      lat: null,
      lng: null
    },
    maps: [],
    social: []
  };

  nodes.forEach(node => {
    if (!node || typeof node !== "object") return;

    if (node.address) {
      result.address.street ||= node.address.streetAddress || null;
      result.address.city ||= node.address.addressLocality || null;
      result.address.state ||= node.address.addressRegion || null;
      result.address.zip ||= node.address.postalCode || null;
      result.address.country ||= node.address.addressCountry || null;
    }

    if (node.geo) {
      result.geo.lat ||= node.geo.latitude || null;
      result.geo.lng ||= node.geo.longitude || null;
    }

    if (node.hasMap) {
      Array.isArray(node.hasMap)
        ? result.maps.push(...node.hasMap)
        : result.maps.push(node.hasMap);
    }

    if (Array.isArray(node.sameAs)) {
      result.social.push(...node.sameAs);
    }
  });

  result.maps = [...new Set(result.maps)];
  result.social = [...new Set(result.social)];

  const providerInfo = detectProviderTier1(nodes);

  chrome.storage.local.set({
    schemaData: result,
    providerInfo
  });
}

/* GA/GTM Codes */

function extractAnalytics() {
  const codes = { ga4: [], ua: [], gtm: [] };

  document.querySelectorAll("script[src]").forEach(script => {
    const src = script.src || "";

    const gtm = src.match(/GTM-[A-Z0-9]+/i);
    const ga4 = src.match(/G-[A-Z0-9]+/i);
    const ua = src.match(/UA-\d+-\d+/i);

    if (gtm && !codes.gtm.includes(gtm[0])) codes.gtm.push(gtm[0]);
    if (ga4 && !codes.ga4.includes(ga4[0])) codes.ga4.push(ga4[0]);
    if (ua && !codes.ua.includes(ua[0])) codes.ua.push(ua[0]);
  });
  chrome.storage.local.set({ analyticsCodes: codes });
}

/* Refresh Data */

chrome.runtime.onMessage.addListener(req => {
  if (req.action === "insertVehicle") {
    insertText(lastFocusedElement, req.text);
  }

  if (req.action === "refreshData") {
    extractSchemaData();
    extractAnalytics();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  extractSchemaData();
  extractAnalytics();
});