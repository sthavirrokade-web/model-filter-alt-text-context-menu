let vehicleData = null;
const menuLookup = {};

/* Load vehicle data */
export async function loadVehicleData() {
  const url = chrome.runtime.getURL("vehicleData.json");
  const res = await fetch(url);
  vehicleData = await res.json();
}

/* ID helper */
function id(...parts) {
  return parts.join("|");
}

/* Build context menus */
export function createVehicleContextMenus() {
  chrome.contextMenus.removeAll(() => {

    /* Root */
    chrome.contextMenus.create({
      id: "add-vehicle",
      title: "Add Vehicle",
      contexts: ["editable"]
    });

    /* ============================
       Homepage Banners (Templates)
    ============================ */

    chrome.contextMenus.create({
      id: "homepage-banners",
      parentId: "add-vehicle",
      title: "Homepage Banners",
      contexts: ["editable"]
    });

    menuLookup["hb-alt"] = { type: "hb-alt" };
    chrome.contextMenus.create({
      id: "hb-alt",
      parentId: "homepage-banners",
      title: "Alt Text",
      contexts: ["editable"]
    });

    menuLookup["hb-filter"] = { type: "hb-filter" };
    chrome.contextMenus.create({
      id: "hb-filter",
      parentId: "homepage-banners",
      title: "Filter",
      contexts: ["editable"]
    });

    /* ============================
       OEM → Model → Trim
    ============================ */

    chrome.contextMenus.create({
      id: "oem-root",
      parentId: "add-vehicle",
      title: "OEM",
      contexts: ["editable"]
    });

    vehicleData.makes.forEach(make => {
      const makeId = id("oem", make.name);

      chrome.contextMenus.create({
        id: makeId,
        parentId: "oem-root",
        title: make.name,
        contexts: ["editable"]
      });

      make.models.forEach(model => {
        const modelId = id("oem-model", make.name, model.name);

        chrome.contextMenus.create({
          id: modelId,
          parentId: makeId,
          title: model.name,
          contexts: ["editable"]
        });

        model.trims.forEach(trim => {
          const trimId = id("oem-trim", make.name, model.name, trim);

          chrome.contextMenus.create({
            id: trimId,
            parentId: modelId,
            title: trim,
            contexts: ["editable"]
          });

          const altId = id("oem-alt", make.name, model.name, trim);
          menuLookup[altId] = { type: "oem-alt", model: model.name, trim };

          chrome.contextMenus.create({
            id: altId,
            parentId: trimId,
            title: "Alt Text",
            contexts: ["editable"]
          });

          const filterId = id("oem-filter", make.name, model.name, trim);
          menuLookup[filterId] = { type: "oem-filter", model: model.name, trim };

          chrome.contextMenus.create({
            id: filterId,
            parentId: trimId,
            title: "Filter",
            contexts: ["editable"]
          });
        });
      });
    });
  });
}

/* Handle menu click */
export function handleVehicleMenuClick(info) {
  const payload = menuLookup[info.menuItemId];
  if (!payload) return null;

  if (payload.type === "hb-alt") {
    return "#CURRENTYEAR# #DEALERMAKE# (Insert model name) in #CITY# #STATE#";
  }

  if (payload.type === "hb-filter") {
    return "/searchnew.aspx?Year=#CURRENTYEAR#&ModelAndTrim=(Insert model name)";
  }

  if (payload.type === "oem-alt") {
    return `2026 #DEALERMAKE# ${payload.model} ${payload.trim} in #CITY# #STATE#`;
  }

  if (payload.type === "oem-filter") {
    return `/searchnew.aspx?Year=2026&ModelAndTrim=${encodeURIComponent(
      `${payload.model} ${payload.trim}`
  )}`;
  }

  return null;
}