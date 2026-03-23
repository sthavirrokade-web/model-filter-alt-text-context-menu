let vehicleData = null;
const menuLookup = {};

export async function loadVehicleData() {
  const url = chrome.runtime.getURL("vehicleData.json");
  const res = await fetch(url);
  vehicleData = await res.json();
}

function id(...parts) {
  return parts.join("|");
}

export function createVehicleContextMenus() {
  chrome.contextMenus.removeAll(() => {
    /* Root */
    chrome.contextMenus.create({
      id: "add-vehicle",
      title: "Specialist Tools",
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
       OEM → Model → (Base + Trim)
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

        /* ===== BASE VARIANT (NEW) ===== */

        const baseAltId = id("oem-base-alt", make.name, model.name);
        menuLookup[baseAltId] = {
          type: "oem-base-alt",
          make: make.name,
          model: model.name
        };

        chrome.contextMenus.create({
          id: baseAltId,
          parentId: modelId,
          title: "Alt Text",
          contexts: ["editable"]
        });

        const baseFilterId = id("oem-base-filter", make.name, model.name);
        menuLookup[baseFilterId] = {
          type: "oem-base-filter",
          make: make.name,
          model: model.name
        };

        chrome.contextMenus.create({
          id: baseFilterId,
          parentId: modelId,
          title: "Filter",
          contexts: ["editable"]
        });

        /* ===== TRIMS (EXISTING) ===== */

        model.trims.forEach(trim => {
          const trimId = id("oem-trim", make.name, model.name, trim);
          chrome.contextMenus.create({
            id: trimId,
            parentId: modelId,
            title: trim,
            contexts: ["editable"]
          });

          const altId = id("oem-alt", make.name, model.name, trim);
          menuLookup[altId] = {
            type: "oem-alt",
            make: make.name,
            model: model.name,
            trim
          };

          chrome.contextMenus.create({
            id: altId,
            parentId: trimId,
            title: "Alt Text",
            contexts: ["editable"]
          });

          const filterId = id("oem-filter", make.name, model.name, trim);
          menuLookup[filterId] = {
            type: "oem-filter",
            make: make.name,
            model: model.name,
            trim
          };

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

export function handleVehicleMenuClick(info) {
  const payload = menuLookup[info.menuItemId];
  if (!payload) return null;

  /* Homepage banner templates */
  if (payload.type === "hb-alt") {
    return "#CURRENTYEAR# #DEALERMAKE# (Insert model name) in #CITY# #STATE#";
  }

  if (payload.type === "hb-filter") {
    return "/searchnew.aspx?Year=#CURRENTYEAR#&Model=(Insert model name)";
  }

  /* OEM → Base variant (NEW) */
  if (payload.type === "oem-base-alt") {
    return `2026 #DEALERMAKE# ${payload.model} in #CITY# #STATE#`;
  }

  if (payload.type === "oem-base-filter") {
    return `/searchnew.aspx?Year=2026&Make${encodeURIComponent(
      payload.make
    )}&ModelAndTrim=${encodeURIComponent(payload.model)}`;
  }

  /* OEM → Trim variant (EXISTING) */
  if (payload.type === "oem-alt") {
    return `2026 #DEALERMAKE# ${payload.model} ${payload.trim} in #CITY# #STATE#`;
  }

  if (payload.type === "oem-filter") {
    return `/searchnew.aspx?Year=2026&Make=${encodeURIComponent(
      payload.make
    )}&ModelAndTrim=${encodeURIComponent(
      `${payload.model} ${payload.trim}`
    )}`;
  }

  return null;
}