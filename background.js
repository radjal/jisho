chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "jishoInlineLookup",
    title: "Look up on Jisho.org (Iframe)",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "jishoInlineLookup" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: "JISHO_LOOKUP",
      text: info.selectionText
    });
  }
});
