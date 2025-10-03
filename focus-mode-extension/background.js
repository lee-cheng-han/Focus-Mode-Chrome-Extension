const DEFAULT_BLOCKED = [
  "youtube.com",
  "reddit.com",
  "instagram.com",
  "tiktok.com"
];

// Initialize defaults
chrome.storage.local.get(['enabled','blockedSites','tempWhitelist'], (data) => {
  if (data.enabled === undefined) chrome.storage.local.set({enabled: true});
  if (!data.blockedSites) chrome.storage.local.set({blockedSites: DEFAULT_BLOCKED});
  if (!data.tempWhitelist) chrome.storage.local.set({tempWhitelist: {}});
});

function cleanTempWhitelist(tempWhitelist) {
  const now = Date.now();
  let changed = false;
  for (const host in tempWhitelist) {
    if (!Object.prototype.hasOwnProperty.call(tempWhitelist, host)) continue;
    const expires = tempWhitelist[host];
    if (!expires || expires <= now) {
      delete tempWhitelist[host];
      changed = true;
    }
  }
  return { tempWhitelist, changed };
}

// Listen for navigation and block if needed
chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
  try {
    // only handle top-level navigations
    if (details.frameId && details.frameId !== 0) return;

    const urlStr = details.url || '';
    // don't try to parse non-http(s) urls
    if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) return;

    const url = new URL(urlStr);
    const hostname = url.hostname.replace(/^www\./i, '').toLowerCase();

    // avoid redirect loop for the blocked page itself
    const blockedPageUrl = chrome.runtime.getURL('blocked.html');
    if (urlStr.startsWith(blockedPageUrl)) return;

    chrome.storage.local.get(['enabled','blockedSites','tempWhitelist'], (data) => {
      const enabled = (data.enabled !== false);
      if (!enabled) return;

      const blockedSites = data.blockedSites || DEFAULT_BLOCKED;
      const tempWhitelist = data.tempWhitelist || {};

      // Clean expired whitelist entries
      const cleaned = cleanTempWhitelist(tempWhitelist);
      if (cleaned.changed) {
        chrome.storage.local.set({ tempWhitelist: cleaned.tempWhitelist });
      }

      // If host is whitelisted and not expired, allow navigation
      const now = Date.now();
      if (cleaned.tempWhitelist[hostname] && cleaned.tempWhitelist[hostname] > now) {
        return;
      }

      // If hostname matches a blocked site, redirect to blocked page
      if (blockedSites.some(s => hostname.includes(s))) {
        const blockedUrl = chrome.runtime.getURL('blocked.html') + '?orig=' + encodeURIComponent(details.url);
        chrome.tabs.update(details.tabId, { url: blockedUrl });
      }
    });
  } catch (e) {
    console.error("Error in navigation listener:", e);
  }
}, { url: [{ schemes: ["http","https"] }] });
