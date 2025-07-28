chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "lookup_inline",
    title: "Look up on Jisho (Inline)",
    contexts: ["selection"]
  });
  chrome.contextMenus.create({
    id: "lookup_tab",
    title: "Open on Jisho.org",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const query = info.selectionText.trim();
  if (!query) return;

  if (info.menuItemId === "lookup_inline") {
    chrome.tabs.sendMessage(tab.id, {
      type: "JISHO_LOOKUP",
      text: query
    });
  }

  if (info.menuItemId === "lookup_tab") {
    const url = `https://jisho.org/search/${encodeURIComponent(query)}`;
    chrome.tabs.create({ url });
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
