document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const orig = params.get("orig") || "";

  const origEl = document.getElementById("origUrl");
  const msgEl = document.getElementById("msg");
  const backBtn = document.getElementById("backBtn");
  const whitelistBtn = document.getElementById("whitelistBtn");

  if (orig) {
    origEl.textContent = orig;
    msgEl.textContent = "You tried to visit: " + orig;
  }

  // Go back button
  backBtn.addEventListener("click", () => {
    if (history.length > 1) {
      history.back();
    } else {
      window.close();
    }
  });

  // Whitelist button
  whitelistBtn.addEventListener("click", () => {
    if (!orig) {
      alert("Original URL not found.");
      return;
    }
    try {
      const host = new URL(orig).hostname.replace(/^www\./i, "");
      chrome.storage.local.get(["tempWhitelist"], (data) => {
        const temp = data.tempWhitelist || {};
        temp[host] = Date.now() + 5 * 60 * 1000; // 5 min
        chrome.storage.local.set({ tempWhitelist: temp }, () => {
          // Navigate back to original URL
          location.href = orig;
        });
      });
    } catch (e) {
      alert("Could not whitelist this site.");
    }
  });
});
