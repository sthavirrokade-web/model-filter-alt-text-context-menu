document.addEventListener("DOMContentLoaded", initSidePanel);

function initSidePanel() {
  document
    .getElementById("refresh-data")
    .addEventListener("click", refreshData);

  loadData();

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
      loadData();
    }
  });
}

function refreshData() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) return;
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "refreshDealerData"
    });
  });
}

function loadData() {
  chrome.storage.local.get(
    ["dealerId", "dealerStatus", "analyticsCodes"],
    (result) => {
      const statusEl = document.getElementById("status-message");
      const dealerEl = document.getElementById("dealer-details");
      const analyticsEl = document.getElementById("analytics-details");

      statusEl.textContent = "";
      dealerEl.innerHTML = "";
      analyticsEl.innerHTML = "";

      if (result.dealerStatus === "missing") {
        statusEl.textContent = "Visit homepage to load data";
        return;
      }

      if (result.dealerId) {
        renderDetail(dealerEl, "Dealer ID", result.dealerId);
      }

      const analytics = result.analyticsCodes || { ga: [], gtm: [] };

      analytics.ga.forEach(code =>
        renderDetail(analyticsEl, "GA", code)
      );

      analytics.gtm.forEach(code =>
        renderDetail(analyticsEl, "GTM", code)
      );
    }
  );
}

function renderDetail(container, label, value) {
  const div = document.createElement("div");
  div.className = "detail";
  div.textContent = `${label}: ${value}`;
  div.addEventListener("click", () =>
    navigator.clipboard.writeText(value)
  );
  container.appendChild(div);
}