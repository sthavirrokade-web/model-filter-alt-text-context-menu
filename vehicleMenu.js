const menuLookup = {};

/* Create simplified menus */
export function createVehicleContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "supplies",
      title: "SEO Supplies",
      contexts: ["editable"]
    });

    /* Alt Text */
    menuLookup["alt-text"] =
      "#CURRENTYEAR# #DEALERMAKE# (MODEL) in #CITY# #STATE#";

    chrome.contextMenus.create({
      id: "alt-text",
      parentId: "supplies",
      title: "Alt Text",
      contexts: ["editable"]
    });

    /* Filter */
    menuLookup["filter"] =
      "/searchnew.aspx?Year=2026&ModelAndTrim=(MODEL)";

    chrome.contextMenus.create({
      id: "filter",
      parentId: "supplies",
      title: "Filter",
      contexts: ["editable"]
    });

    /* Dealer */
    menuLookup["dealer"] =
      "(BANNER_SUBJECT) at #NAME# in #CITY# #STATE#";

    chrome.contextMenus.create({
      id: "dealer",
      parentId: "supplies",
      title: "Dealer",
      contexts: ["editable"]
    });
  });
}

/* Return pasted text */
export function handleVehicleMenuClick(info) {
  return menuLookup[info.menuItemId] || null;
}