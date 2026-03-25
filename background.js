import {
  createVehicleContextMenus,
  handleVehicleMenuClick
} from "./vehicleMenu.js";

/* Initialize menus */
function initialize() {
  createVehicleContextMenus();
}

chrome.runtime.onInstalled.addListener(initialize);
chrome.runtime.onStartup.addListener(initialize);

/* Handle context menu */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;

  const text = handleVehicleMenuClick(info);
  if (!text) return;

  chrome.tabs.sendMessage(tab.id, {
    action: "insertVehicle",
    text
  });
});

/* Toolbar opens side panel */
chrome.action.onClicked.addListener(tab => {
  if (chrome.sidePanel?.open && tab?.windowId) {
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

/* Keyboard shortcut */
chrome.commands.onCommand.addListener(command => {
  if (command === "open-side-panel") {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (!tabs[0]) return;
      chrome.sidePanel.open({
        tabId: tabs[0].id,
        windowId: tabs[0].windowId
      });
    });
  }
});