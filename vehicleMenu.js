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

    chrome.contextMenus.create({
      id: "re-codes",
      parentId: "supplies",
      title: "Replacement Codes",
      contexts: ["editable"]
    });

    chrome.contextMenus.create({
      id: "dealership-name",
      parentId: "re-codes",
      title: "Name",
      contexts: ["editable"]
    });

  chrome.contextMenus.create({
    id: "dealership-city",
    parentId: "re-codes",
    title: "City",
    contexts: ["editable"]
  });

  chrome.contextMenus.create({
    id: "dealership-state-abbv",
    parentId: "re-codes",
    title: "State Abbv",
    contexts: ["editable"]
  });

  chrome.contextMenus.create({
    id: "dealership-make",
    parentId: "re-codes",
    title: "Make",
    contexts: ["editable"]
  });

  chrome.contextMenus.create({
    id: "city-state",
    parentId: "re-codes",
    title: "City, State",
    contexts: ["editable"]
  });

  chrome.contextMenus.create({
    id: "schema-logo",
    parentId: "re-codes",
    title: "Schema logo",
    contexts: ["editable"]
  });

  chrome.contextMenus.create({
    id: "schema-desc",
    parentId: "re-codes",
    title: "Schema desc",
    contexts: ["editable"]
  });

  chrome.contextMenus.create({
    id: "css",
    parentId: "supplies",
    title: "CSS Snippets",
    contexts: ["editable"]
  });

  chrome.contextMenus.create({
    id: "img-text",
    parentId: "css",
    title: "Img + Text",
    contexts: ["editable"]
  });

  chrome.contextMenus.create({
    id: "img-three",
    parentId: "css",
    title: "3 Images",
    contexts: ["editable"]
  });
  });
}

/* Return pasted text */
export function handleVehicleMenuClick(info) {
  switch (info.menuItemId) {
    case "alt-text":
      return "#CURRENTYEAR# #DEALERMAKE# (insert model here) in #CITY# #STATE#";

    case "filter":
      return "/searchnew.aspx?Year=2026&ModelAndTrim=(insert model here)";

    case "dealer":
      return "(add banner context) at #NAME# in #CITY# #STATE#.";

    case "dealership-name":
      return "%(DEALERSHIP_NAME) "
      
    case "dealership-city":
      return "%(CITY) ";

    case "dealership-state-abbv":
      return "%(STATE_ABBREV) ";

    case "dealership-make":
      return "%(MAKE) ";

    case "city-state":
      return "%(CITY), %(STATE_ABBREV) ";

    case "schema-logo":
      return "(Add Primary URL Here)/static/dealer-######/logo.png";

    case "schema-desc":
      return "#NAME# is a %(make) dealer in %(CITY), %(STATE_ABBREV). We specialize in new %(MAKE), used cars, service, and financing.";

    case "img-text":
      return `<div class="row"><div class="col-md-6"><img/></div><div class="col-md-6"><p>replace with img tag for 2 images</p></div></div><br>`

    case "img-three":
      return `<div class="row"><div class="col-md-4"><img></div><div class="col-md-4"><img></div><div class="col-md-4"><img></div></div><br>`;
    
    default:
      return null;
  }
}