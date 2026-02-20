// Background script for Monado WebXR Bridge
// Phase 1: Stub — native messaging connection is Phase 2
console.log('Monado WebXR Bridge background script loaded');

// Phase 2 will add:
// - Native messaging connection to openxr-bridge-macos host (com.openxr.bridge)
// - Message relay between content scripts and native host
// - WebSocket connection management for frame data

chrome.runtime.onInstalled.addListener((details) => {
  console.log('Monado WebXR Bridge installed:', details.reason);
});

// Forward messages from content scripts (Phase 2: relay to native host)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === 'monado-webxr-bridge') {
    // Phase 2: forward to native messaging host
    sendResponse({ received: true, phase: 1 });
    return true;
  }
});
