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

function extractDealerId() {
  /* Scan for JSON metadata */
  const metaScript = document.getElementById("dealeron_website_metadata");
  if (metaScript?.textContent) {
    try {
      const data = JSON.parse(metaScript.textContent);
      if (data?.dealerId) {
        return String(data.dealerId);
      }
    } catch (e) {
      console.warn("Invalid dealer metadata JSON");
    }
  }

  /* Fallback: HTML comment scan */
  const iterator = document.createNodeIterator(
    document.documentElement,
    NodeFilter.SHOW_COMMENT
  );
  let node;
  while ((node = iterator.nextNode())) {
    const match = node.nodeValue.match(/Dealer ID:\s*(\d+)/i);
    if (match) return match[1];
  }
  return null;
}

function extractDealerData() {
  const dealerId = extractDealerId();
  chrome.storage.local.set({
    dealerStatus: dealerId ? "loaded" : "missing",
    dealerId: dealerId || null
  });
}

/* Analytics */
function extractAnalytics() {
  const codes = { ga: [], gtm: [] };
  document.querySelectorAll("script").forEach(s => {
    const src = s.src || "";
    const gtm = src.match(/GTM-[A-Z0-9]+/);
    const ga = src.match(/G-[A-Z0-9]+/);
    if (gtm && !codes.gtm.includes(gtm[0])) codes.gtm.push(gtm[0]);
    if (ga && !codes.ga.includes(ga[0])) codes.ga.push(ga[0]);
  });
  chrome.storage.local.set({ analyticsCodes: codes });
}

chrome.runtime.onMessage.addListener(req => {
  if (req.action === "insertVehicle") {
    insertText(lastFocusedElement, req.text);
  }
  if (req.action === "refreshDealerData") {
    extractDealerData();
    extractAnalytics();
  }
});

function insertText(el, text) {
  if (!el) return;
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
    const s = el.selectionStart ?? 0;
    const e = el.selectionEnd ?? 0;
    el.value = el.value.slice(0, s) + text + el.value.slice(e);
    el.setSelectionRange(s + text.length, s + text.length);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.focus();
  } else if (el.isContentEditable) {
    document.execCommand("insertText", false, text);
  }
}


function extractMetaData() {
  const titleTag = document.title(
    'meta[property="og:title"]'
  );
  const title = titleTag?.getAttribute("content") || document.title || null;

  const descTag = document.querySelector(
    'meta[name="description"], meta[property="og:description"]'
  );
  const description = descTag?.getAttribute("content") || null;

  chrome.storage.local.set({
    metaTitle: title,
    metaDescription: description
  });
}
console.log(metaTitle, metaDescription)

document.addEventListener("DOMContentLoaded", () => {
  extractDealerData();
  extractAnalytics();
  extractMetaData();
});