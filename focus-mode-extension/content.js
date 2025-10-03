// content.js - runs on every page. If the page is our blocked.html it does nothing.
(function(){
  // this content script is intentionally light: the actual blocking is done by background redirect.
  // however we use this script for optional future features (soft-dimming).
  chrome.storage.local.get(['mode'], (data) => {
    // placeholder - no-op for now
  });
})();
