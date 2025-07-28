chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "jishoInlineLookup",
    title: "Look up on Jisho.org",
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "FETCH_JISHO") {
    const url = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(request.query)}`;
    fetch(url)
      .then(response => response.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});
