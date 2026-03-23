// =============================================================================
// Background Service Worker - Context Menu Paste Model Details
// =============================================================================

let vehicleData = null;

// Set this to your raw JSON URL in GitHub (or any publicly accessible endpoint)
// For now, loading locally

const VEHICLE_DATA_URL = chrome.runtime.getURL('vehicleData.json');

async function loadVehicleData() {
  try {
    const response = await fetch(VEHICLE_DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch vehicle data: ${response.status} ${response.statusText}`);
    }

    vehicleData = await response.json();
  } catch (error) {
    console.error("Could not load vehicle data", error);
    vehicleData = null;
  }
}

async function loadAndCreateContextMenus() {
  await loadVehicleData();
  createContextMenus();
}

chrome.runtime.onInstalled.addListener(() => {
  loadAndCreateContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  loadAndCreateContextMenus();
});

function sanitizeId(...parts) {
  return parts
    .map(p => p.toString().replace(/[^a-zA-Z0-9_-]/g, "_"))
    .join("|");
}

function createContextMenus() {
  chrome.contextMenus.removeAll(() => {
    if (!vehicleData || typeof vehicleData !== "object") {
      console.warn("No vehicleData available, context menu will not be built yet.");
      return;
    }

    chrome.contextMenus.create({
      id: "insert-vehicle",
      title: "Add Model Details",
      contexts: ["editable"],
      documentUrlPatterns: ["<all_urls>"]
    });

    for (const [oem, years] of Object.entries(vehicleData)) {
      const oemId = sanitizeId("oem", oem);
      chrome.contextMenus.create({
        id: oemId,
        parentId: "insert-vehicle",
        title: oem,
        contexts: ["editable"],
        documentUrlPatterns: ["<all_urls>"]
      });

      for (const [year, models] of Object.entries(years)) {
        const yearId = sanitizeId("year", oem, year);
        chrome.contextMenus.create({
          id: yearId,
          parentId: oemId,
          title: year,
          contexts: ["editable"],
          documentUrlPatterns: ["<all_urls>"]
        });

        for (const model of models) {
          const modelId = sanitizeId("model", oem, year, model);
          chrome.contextMenus.create({
            id: modelId,
            parentId: yearId,
            title: model,
            contexts: ["editable"],
            documentUrlPatterns: ["<all_urls>"]
          });

          chrome.contextMenus.create({
            id: sanitizeId("model", oem, year, model, "alttext"),
            parentId: modelId,
            title: "Alt Text",
            contexts: ["editable"],
            documentUrlPatterns: ["<all_urls>"]
          });

          chrome.contextMenus.create({
            id: sanitizeId("model", oem, year, model, "searchfilter"),
            parentId: modelId,
            title: "Model Search Filters",
            contexts: ["editable"],
            documentUrlPatterns: ["<all_urls>"]
          });
        }
      }
    }
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.menuItemId || !info.menuItemId.startsWith("model|")) {
    return;
  }

  const parts = info.menuItemId.split("|");
  // format: model|OEM|Year|ModelName (alttext/searchfilter)
  if (parts.length < 4) return;

  const oem = parts[1];
  const year = parts[2];
  let mode = null;
  let modelParts = parts.slice(3);

  const lastPart = modelParts[modelParts.length - 1];
  if (lastPart === "alttext" || lastPart === "searchfilter") {
    mode = lastPart;
    modelParts = modelParts.slice(0, -1);
  }

  const model = modelParts.join("|");
  const vehicleText = `${oem} ${year} ${model}`;
  const altText = `#CURRENTYEAR# #DEALERMAKE# ${model} in #CITY# #STATE#`;
  const searchFilterText = `/searchnew.aspx?Year=${year}&ModelAndTrim=${encodeURIComponent(model)}`;

  if (!tab || typeof tab.id !== "number") {
    console.warn("Insert vehicle: no valid tab id available");
    return;
  }

  let text = vehicleText;
  if (mode === "alttext") {
    text = altText;
  } else if (mode === "searchfilter") {
    text = searchFilterText;
  }

  chrome.tabs.sendMessage(tab.id, {
    action: "insertVehicle",
    text
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.warn("Insert vehicle message failed:", chrome.runtime.lastError.message);
    }
  });
});
