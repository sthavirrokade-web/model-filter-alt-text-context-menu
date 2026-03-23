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

/* Dealer ID via HTML comment */
function extractDealerId() {
  const it = document.createNodeIterator(
    document.documentElement,
    NodeFilter.SHOW_COMMENT
  );
  let node;
  while ((node = it.nextNode())) {
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

document.addEventListener("DOMContentLoaded", () => {
  extractDealerData();
  extractAnalytics();
});