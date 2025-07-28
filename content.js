chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "JISHO_LOOKUP") {
    const query = encodeURIComponent(request.text);
    const iframeUrl = `https://jisho.org/search/${query}`;

    removeExistingPopup();

    const popup = document.createElement("div");
    popup.className = "jisho-inline-popup";

    const header = document.createElement("div");
    header.className = "jisho-popup-header";
    header.textContent = "Jisho.org Lookup";

    const closeBtn = document.createElement("span");
    closeBtn.textContent = "✖";
    closeBtn.className = "jisho-close-btn";
    closeBtn.onclick = () => fadeOutAndRemove(popup);
    header.appendChild(closeBtn);
    popup.appendChild(header);

    const iframe = document.createElement("iframe");
    iframe.src = iframeUrl;
    iframe.setAttribute("sandbox", "allow-same-origin");
    iframe.setAttribute("tabindex", "-1");
    popup.appendChild(iframe);

    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    popup.style.top = `${rect.bottom + window.scrollY + 5}px`;
    popup.style.left = `${rect.left + window.scrollX}px`;

    document.body.appendChild(popup);
    requestAnimationFrame(() => popup.classList.add("visible"));

    makeDraggable(popup, header);

    function onKeyDown(e) {
      if (e.key === "Escape") {
        fadeOutAndRemove(popup);
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("click", onDocClick);
      }
    }

    function onDocClick(e) {
      if (!popup.contains(e.target)) {
        fadeOutAndRemove(popup);
        document.removeEventListener("click", onDocClick);
        document.removeEventListener("keydown", onKeyDown);
      }
    }

    setTimeout(() => {
      document.addEventListener("click", onDocClick);
      document.addEventListener("keydown", onKeyDown);
    }, 0);
  }
});

function removeExistingPopup() {
  document.querySelectorAll(".jisho-inline-popup").forEach(el => el.remove());
}

function fadeOutAndRemove(el) {
  el.classList.remove("visible");
  setTimeout(() => el.remove(), 300);
}

function makeDraggable(popup, header) {
  let offsetX = 0, offsetY = 0, isDragging = false;

  header.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - popup.offsetLeft;
    offsetY = e.clientY - popup.offsetTop;
    popup.style.cursor = "move";
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      popup.style.left = `${e.clientX - offsetX}px`;
      popup.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    popup.style.cursor = "default";
  });
}
