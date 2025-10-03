# Focus Mode for Procrastinators - Chrome Extension (Demo)

This is a simple demo Chrome extension that blocks configured distracting sites by redirecting them to a local blocked page.

## How to install locally (developer)

1. Download and unzip the repo.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (top-right).
4. Click **Load unpacked** and choose the `focus-mode-extension` folder.
5. Click the extension icon -> configure blocked sites -> open a blocked site to test.

## Notes
- This demo uses `chrome.webNavigation.onBeforeNavigate` to redirect blocked sites to `blocked.html`.
- It stores settings in `chrome.storage.local`.
- For a production build or store publication, add a proper icon, privacy policy and follow Chrome Web Store policies.
