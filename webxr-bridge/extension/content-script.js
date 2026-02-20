// Content script for Monado WebXR Bridge
// Injects the WebXR polyfill bundle into the page context
(() => {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('webxr-polyfill-bundle.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
})();
