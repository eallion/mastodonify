'use strict';

// Setup alarm on install/startup
chrome.runtime.onInstalled.addListener(setupAlarm);
chrome.runtime.onStartup.addListener(setupAlarm);

// Listen for messages from options page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateAlarm') {
    setupAlarm();
  } else if (request.action === 'checkNotifications') {
    checkNotifications();
  }
  // popup actions
  else if (request.action === 'markRead') {
    markAsRead();
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pollMastodon') {
    checkNotifications();
  }
});

function setupAlarm() {
  chrome.storage.sync.get(['interval'], (items) => {
    const interval = items.interval ? parseFloat(items.interval) : 300;
    // Alarm period is in minutes
    const periodInMinutes = interval / 60;
    
    chrome.alarms.create('pollMastodon', {
      periodInMinutes: Math.max(periodInMinutes, 1/60) 
    });
    // Trigger immediate check
    checkNotifications();
  });
}

function getBaseUrl(account) {
    if (!account) return null;
    let domain = account.split('@').pop(); 
    // Basic cleanup in case garbage got in
    domain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `https://${domain}`;
}

// Helper to get the server-side read marker
async function getLastReadId(baseUrl, token) {
    try {
        const url = `${baseUrl}/api/v1/markers?timeline[]=notifications`;
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            if (data.notifications && data.notifications.last_read_id) {
                console.log('Got server marker:', data.notifications.last_read_id);
                return data.notifications.last_read_id;
            }
        }
    } catch (e) {
        console.error('Error fetching marker:', e);
    }
    return null;
}

function checkNotifications() {
  chrome.storage.sync.get(['account', 'token', 'filters', 'last_read_id'], async (items) => {
    let { account, token, filters, last_read_id } = items;

    if (!account || !token) {
      console.log('No account configured.');
      chrome.action.setBadgeText({ text: 'ERR' });
      chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
      return; 
    }

    const baseUrl = getBaseUrl(account);
    if (!baseUrl) {
        console.error('Invalid account:', account);
        return;
    }

    // 1. Try to get server marker for better sync
    const serverLastReadId = await getLastReadId(baseUrl, token);
    
    // Logic: 
    // If we have a server marker, use that as the baseline for "unread".
    // If we don't present a 'since_id', Mastodon returns the latest notifications.
    // To get the "unread count", we need to count how many notifications have ID > marker.
    
    let sinceId = last_read_id;
    if (serverLastReadId) {
        sinceId = serverLastReadId;
    }

    // If still no sinceId (first run, no server marker), we initialize.
    if (!sinceId) {
        try {
            const url = `${baseUrl}/api/v1/notifications?limit=1`;
            console.log('Fetching initial:', url);
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) {
                // ... error logging ...
                return;
            }
            const data = await res.json();
            if (data && data.length > 0) {
                chrome.storage.sync.set({ last_read_id: data[0].id });
            }
        } catch (e) {
            console.error('Initial check error:', e);
        }
        return;
    }

    try {
      // Fetch notifications NEWER than the marker
      const url = `${baseUrl}/api/v1/notifications?since_id=${sinceId}&limit=40`;
      console.log('Polling:', url);
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
         console.error('Fetch failed', response.status);
         if (response.status === 401) {
             chrome.action.setBadgeText({ text: '!' });
         }
         return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
         return;
      }

      const notifications = await response.json();
      
      // Filter
      const ignoredTypes = filters || [];
      const relevantNotifications = notifications.filter(n => !ignoredTypes.includes(n.type));
      
      const count = relevantNotifications.length;
      console.log(`Unread count: ${count}`);
      
      if (count > 0) {
          const text = count >= 40 ? '40+' : count.toString();
          chrome.action.setBadgeText({ text: text });
          chrome.action.setBadgeBackgroundColor({ color: '#6364ff' });
          
          if (relevantNotifications.length > 0) {
              chrome.storage.local.set({ latest_fetched_id: relevantNotifications[0].id });
          }
      } else {
          chrome.action.setBadgeText({ text: '' });
      }

    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  });
}

function markAsRead() {
    chrome.storage.local.get(['latest_fetched_id'], (localItems) => {
        if (localItems.latest_fetched_id) {
            chrome.storage.sync.set({ last_read_id: localItems.latest_fetched_id }, () => {
                chrome.action.setBadgeText({ text: '' });
                chrome.storage.local.remove('latest_fetched_id');
            });
        }
    });
}
