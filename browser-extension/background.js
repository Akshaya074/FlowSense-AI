// Whitelisted developer documentation sites
const WHITELIST_DOMAINS = [
  'react.dev',
  'nextjs.org',
  'tailwindcss.com',
  'clerk.com',
  'supabase.com',
  'prisma.io',
  'developer.mozilla.org',
  'stackoverflow.com',
  'github.com'
];

// Simple cache to prevent logging spam/duplicates within short windows
let lastLoggedUrl = '';
let lastLoggedTime = 0;
const DUPLICATE_COOLDOWN_MS = 15000; // 15 seconds cooldown for identical URLs

// Verify whether a URL is in the developer whitelist
function isWhitelisted(urlStr) {
  try {
    const url = new URL(urlStr);
    const hostname = url.hostname.toLowerCase();
    
    // Checks if the tab hostname matches or ends with any of the whitelisted domains
    return WHITELIST_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch (e) {
    return false;
  }
}

// Ingest browser visit events to FlowSense AI REST API
async function logTabVisit(url, title) {
  chrome.storage.local.get(['flowsensePat', 'flowsenseUrl'], async (result) => {
    const token = result.flowsensePat;
    if (!token) {
      console.log('[FlowSense Browser] Tracking disabled: No token configured.');
      return;
    }

    // Default to localhost if no service URL is saved
    let serviceUrl = result.flowsenseUrl || 'http://localhost:3000';
    // Clean trailing slashes
    serviceUrl = serviceUrl.replace(/\/+$/, '');
    
    // Construct event endpoint URL
    const eventEndpoint = `${serviceUrl}/api/events`;

    try {
      const parsedUrl = new URL(url);
      const workspaceName = parsedUrl.hostname.replace('www.', '');

      const payload = {
        eventType: 'DOC_VISIT',
        resourceName: url,
        workspace: workspaceName,
        timestamp: new Date().toISOString(),
        metadata: {
          title: title || 'Documentation Visit'
        }
      };

      console.log(`[FlowSense Browser] Ingesting event to: ${eventEndpoint}`);
      const response = await fetch(eventEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log(`[FlowSense Browser] Logged: ${workspaceName} - 202 Accepted`);
      } else {
        console.warn(`[FlowSense Browser] API rejected log: ${response.status}`);
      }
    } catch (err) {
      console.error('[FlowSense Browser] Failed to send event:', err);
    }
  });
}

// Listen for tab URL updates (complete status change)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const url = tab.url;
    
    // Check if the site is a whitelisted developer resource
    if (isWhitelisted(url)) {
      const now = Date.now();
      
      // Skip logging if same URL was logged within the cooldown threshold
      if (url === lastLoggedUrl && (now - lastLoggedTime) < DUPLICATE_COOLDOWN_MS) {
        return;
      }

      // Update duplicate cache
      lastLoggedUrl = url;
      lastLoggedTime = now;

      // Log tab event
      logTabVisit(url, tab.title);
    }
  }
});
