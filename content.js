chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "JISHO_LOOKUP") {
    const query = request.text.trim();
    if (!query) return;

    removeExistingPopup();
    showLoadingPopup(query);

    chrome.runtime.sendMessage({ type: "FETCH_JISHO", query }, (response) => {
      if (response.success) {
        removeExistingPopup();
        showResultsPopup(query, response.data);
      } else {
        removeExistingPopup();
        showErrorPopup("Failed to load results.");
        console.error(response.error);
      }
    });
  }
});

function showLoadingPopup(query) {
  const popup = createPopup(`Searching for “${query}”...`);
  document.body.appendChild(popup);
  fadeIn(popup);
}

function showErrorPopup(msg) {
  const popup = createPopup(msg);
  document.body.appendChild(popup);
  fadeIn(popup);
}

function showResultsPopup(query, data) {
  const popup = createPopup(`Results for “${query}”`);
  const body = document.createElement("div");
  body.className = "jisho-results";

  if (data.data.length === 0) {
    body.innerText = "No results found.";
  } else {
    data.data.slice(0, 3).forEach(entry => {
      const item = document.createElement("div");
      item.className = "jisho-entry";

      const word = entry.japanese[0].word || entry.japanese[0].reading;
      const reading = entry.japanese[0].reading || "";
      const senses = entry.senses.map(s => s.english_definitions.join(", ")).join("; ");

      item.innerHTML = `
        <div class="jisho-word">${word} <span class="jisho-reading">(${reading})</span></div>
        <div class="jisho-meaning">${senses}</div>
      `;
      body.appendChild(item);
    });
  }

  popup.appendChild(body);
  document.body.appendChild(popup);
  fadeIn(popup);
}

function createPopup(titleText) {
  removeExistingPopup();

  const popup = document.createElement("div");
  popup.className = "jisho-inline-popup";

  const header = document.createElement("div");
  header.className = "jisho-popup-header";
  header.textContent = titleText;

  const closeBtn = document.createElement("span");
  closeBtn.textContent = "✖";
  closeBtn.className = "jisho-close-btn";
  closeBtn.onclick = () => fadeOutAndRemove(popup);
  header.appendChild(closeBtn);
  popup.appendChild(header);

  const selection = window.getSelection();
  const rect = selection.getRangeAt(0).getBoundingClientRect();
  popup.style.top = `${rect.bottom + window.scrollY + 5}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;

  makeDraggable(popup, header);

  setTimeout(() => {
    document.addEventListener("click", function onClickOutside(e) {
      if (!popup.contains(e.target)) {
        fadeOutAndRemove(popup);
        document.removeEventListener("click", onClickOutside);
      }
    });
  }, 0);

  return popup;
}

function removeExistingPopup() {
  document.querySelectorAll(".jisho-inline-popup").forEach(el => el.remove());
}

function fadeIn(el) {
  requestAnimationFrame(() => el.classList.add("visible"));
}

function fadeOutAndRemove(el) {
  el.classList.remove("visible");
  setTimeout(() => el.remove(), 300);
}

function makeDraggable(popup, header) {
  let offsetX = 0, offsetY = 0, isDragging = false;
  header.onmousedown = (e) => {
    isDragging = true;
    offsetX = e.clientX - popup.offsetLeft;
    offsetY = e.clientY - popup.offsetTop;
    popup.style.cursor = "move";
  };
  document.onmousemove = (e) => {
    if (isDragging) {
      popup.style.left = `${e.clientX - offsetX}px`;
      popup.style.top = `${e.clientY - offsetY}px`;
    }
  };
  document.onmouseup = () => {
    isDragging = false;
    popup.style.cursor = "default";
  };
}
