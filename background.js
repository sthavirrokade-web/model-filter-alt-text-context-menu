import {
  loadVehicleData,
  createVehicleContextMenus,
  handleVehicleMenuClick
} from "./vehicleMenu.js";

async function initialize() {
  await loadVehicleData();
  createVehicleContextMenus();
}

chrome.runtime.onInstalled.addListener(initialize);
chrome.runtime.onStartup.addListener(initialize);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const result = handleVehicleMenuClick(info);
  if (!result || !tab?.id) return;

  Promise.resolve(result).then(text => {
    if (!text) return;
    chrome.tabs.sendMessage(tab.id, {
      action: "insertVehicle",
      text
    });
  });
});

chrome.action.onClicked.addListener(tab => {
  if (chrome.sidePanel?.open && tab?.windowId) {
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

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