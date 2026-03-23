// =============================================================================
// Content Script - Receives insertion command and enters text at cursor
// =============================================================================

let lastFocusedElement = document.activeElement;

window.addEventListener("focusin", (event) => {
  const target = event.target;
  if (
    target &&
    (target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable)
  ) {
    lastFocusedElement = target;
  }
});

// Track right-click target so context-menu action can insert into correct field

window.addEventListener("contextmenu", (event) => {
  const target = event.target;
  if (
    target &&
    (target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable)
  ) {
    lastFocusedElement = target;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "insertVehicle") {
    const text = request.text;
    insertText(lastFocusedElement || document.activeElement, text);
  }
});

function insertText(element, text) {
  if (!element) return;

  if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
    const startPos = element.selectionStart ?? 0;
    const endPos = element.selectionEnd ?? 0;
    const currentValue = element.value || "";

    element.value =
      currentValue.substring(0, startPos) +
      text +
      currentValue.substring(endPos);

    const newCursorPos = startPos + text.length;
    element.setSelectionRange(newCursorPos, newCursorPos);
    element.focus();
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  if (element.isContentEditable) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      element.textContent = (element.textContent || "") + text;
      return;
    }
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.setStart(range.endContainer, range.endOffset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
