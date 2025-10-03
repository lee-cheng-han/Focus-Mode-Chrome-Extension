document.addEventListener('DOMContentLoaded', () => {
  const enabledEl = document.getElementById('enabled');
  const blockedEl = document.getElementById('blocked');
  const saveBtn = document.getElementById('save');
  const whitelistBtn = document.getElementById('whitelistBtn');

  // Load current settings
  chrome.storage.local.get(['enabled','blockedSites'], (data) => {
    enabledEl.checked = (data.enabled !== false);
    blockedEl.value = (data.blockedSites || []).join(', ');
  });

  // Save settings
  saveBtn.addEventListener('click', () => {
    const enabled = enabledEl.checked;
    const blockedSites = blockedEl.value.split(',').map(s => s.trim()).filter(Boolean);
    chrome.storage.local.set({ enabled, blockedSites }, () => {
      saveBtn.textContent = 'Saved';
      setTimeout(() => saveBtn.textContent = 'Save', 1000);
    });
  });

  // Whitelist current site for 5 minutes
  if (whitelistBtn) {
    whitelistBtn.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || !tabs[0]) return;
        const tab = tabs[0];
        let targetUrl = tab.url || '';

        // If we're on the extension's blocked page, extract original URL from query params
        try {
          const tabUrlObj = new URL(tab.url);
          if (tabUrlObj.protocol === 'chrome-extension:' && tabUrlObj.pathname.endsWith('/blocked.html')) {
            const params = new URLSearchParams(tabUrlObj.search);
            const orig = params.get('orig');
            if (orig) targetUrl = orig;
          }
        } catch (e) {
          // ignore parsing errors
        }

        try {
          const hostname = new URL(targetUrl).hostname.replace(/^www\./i, '');

          chrome.storage.local.get(['tempWhitelist'], (data) => {
            const tempWhitelist = data.tempWhitelist || {};
            tempWhitelist[hostname] = Date.now() + 5 * 60 * 1000; // 5 minutes
            chrome.storage.local.set({ tempWhitelist }, () => {
              whitelistBtn.textContent = 'Whitelisted!';
              // If we were on the blocked page, navigate the tab back to the original URL
              chrome.tabs.update(tab.id, { url: targetUrl });
              setTimeout(() => whitelistBtn.textContent = 'Whitelist 5 min', 2000);
            });
          });
        } catch (e) {
          alert('Could not determine site to whitelist.');
        }
      });
    });
  }
});