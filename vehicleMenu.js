/* Create simplified menus */
export function createVehicleContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "supplies",
      title: "Supplies",
      contexts: ["editable"]
    });

    chrome.contextMenus.create({
      id: "alt-text",
      parentId: "supplies",
      title: "Alt Text",
      contexts: ["editable"]
    });

    chrome.contextMenus.create({
      id: "filter",
      parentId: "supplies",
      title: "Filter",
      contexts: ["editable"]
    });

    chrome.contextMenus.create({
      id: "dealer",
      parentId: "supplies",
      title: "Dealer Alt",
      contexts: ["editable"]
    });
  });
}

/* Return pasted text (NO in‑memory dependency) */
export function handleVehicleMenuClick(info) {
  switch (info.menuItemId) {
    case "alt-text":
      return "#CURRENTYEAR# #DEALERMAKE# (insert model here) in #CITY# #STATE#";

    case "filter":
      return "/searchnew.aspx?Year=2026&ModelAndTrim=(insert model here)";

    case "dealer":
      return "(add banner context) at #NAME# in #CITY# #STATE#";

    default:
      return null;
  }
}