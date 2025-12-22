// Helper to replace i18n strings
function localizeHtml() {
    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const msg = chrome.i18n.getMessage(elem.getAttribute('data-i18n'));
        if (msg) elem.textContent = msg;
    });
}

// Saves options to chrome.storage
const saveOptions = () => {
    let account = document.getElementById('account').value.trim();
    const token = document.getElementById('token').value.trim();
    const interval = parseInt(document.getElementById('interval').value, 10) || 300;
  
    const filters = [];
    document.querySelectorAll('.filter:checked').forEach((checkbox) => {
      filters.push(checkbox.value);
    });
  
    if (!account || !token) {
        showStatus(chrome.i18n.getMessage('statusEnterAll') || 'Please enter both account and token.', 'red');
        return;
    }

    const urlMatch = account.match(/^https?:\/\/([^\/]+)\/@([^\/]+)/);
    if (urlMatch) {
         account = `@${urlMatch[2]}@${urlMatch[1]}`;
    }

    let instanceDomain = '';
    const parts = account.split('@').filter(p => p);
    if (parts.length >= 2) {
        instanceDomain = parts[parts.length - 1];
    }

    if (!instanceDomain || !instanceDomain.includes('.')) {
        showStatus((chrome.i18n.getMessage('statusInvalidAcct') || 'Invalid account format'), 'red');
        return;
    }
    
    document.getElementById('account').value = account;
  
    chrome.storage.sync.set(
      { account, token, interval, filters, instanceDomain },
      () => {
        showStatus(chrome.i18n.getMessage('statusSaved') || 'Options saved.', 'green');
        chrome.runtime.sendMessage({ action: "updateAlarm" });
        chrome.runtime.sendMessage({ action: "checkNotifications" });
      }
    );
  };
  
  const restoreOptions = () => {
    localizeHtml(); // Apply translations
    
    chrome.storage.sync.get(
      { account: '', token: '', interval: 300, filters: [] },
      (items) => {
        document.getElementById('account').value = items.account;
        document.getElementById('token').value = items.token;
        document.getElementById('interval').value = items.interval;
        
        items.filters.forEach((filterValue) => {
            const checkbox = document.querySelector(`.filter[value="${filterValue}"]`);
            if (checkbox) checkbox.checked = true;
        });
      }
    );
  };

  const showStatus = (msg, color = 'black') => {
      const status = document.getElementById('status');
      status.textContent = msg;
      status.style.color = color;
      setTimeout(() => {
          status.textContent = '';
      }, 3000);
  };
  
  const testConnection = async () => {
      let account = document.getElementById('account').value.trim();
      const token = document.getElementById('token').value.trim();
      
      if (!account || !token) {
          showStatus(chrome.i18n.getMessage('statusEnterAll'), 'red');
          return;
      }

      const urlMatch = account.match(/^https?:\/\/([^\/]+)\/@([^\/]+)/);
      if (urlMatch) {
           account = `@${urlMatch[2]}@${urlMatch[1]}`;
           document.getElementById('account').value = account;
      }
      
      const parts = account.split('@').filter(p => p);
      if (parts.length < 2) {
          showStatus(chrome.i18n.getMessage('statusInvalidAcct'), 'red');
          return;
      }
      const domain = parts[parts.length - 1];

      try {
          const response = await fetch(`https://${domain}/api/v1/notifications?limit=1`, {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          
          if (response.ok) {
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                   showStatus(chrome.i18n.getMessage('statusConnSuccess'), 'green');
              } else {
                   showStatus('Connection OK but HTML returned', 'orange');
              }
          } else {
              showStatus(`${chrome.i18n.getMessage('statusConnFail')}: ${response.status}`, 'red');
          }
      } catch (error) {
          showStatus(`${chrome.i18n.getMessage('statusError')}: ${error.message}`, 'red');
      }
  };

  const updateTokenHelp = () => {
      const accountInput = document.getElementById('account');
      const helpDiv = document.getElementById('token-help');
      const account = accountInput.value.trim();
      
      const pre = chrome.i18n.getMessage('tokenHelpPre');
      const linkText = chrome.i18n.getMessage('tokenHelpLink');
      const post = chrome.i18n.getMessage('tokenHelpPost');

      // Attempt to extract domain
      let domain = null;
      
      // Try @user@domain
      const parts = account.split('@').filter(p => p);
      if (parts.length >= 2) {
          domain = parts[parts.length - 1];
      } else {
          // Try URL match logic similar to save/test options
          // But strict regex for robust extract during typing might be annoying if bouncing.
          // Just simple scan:
          const urlMatch = account.match(/^https?:\/\/([^\/]+)/);
          if (urlMatch) domain = urlMatch[1];
      }

      if (domain && domain.includes('.')) {
          // Valid looking domain
          const url = `https://${domain}/settings/applications`;
          helpDiv.innerHTML = `${pre}<a href="${url}" target="_blank">${linkText}</a>${post}`;
      } else {
          // Fallback static text
          helpDiv.innerHTML = `${pre}${linkText}${post}`;
      }
  };

  document.getElementById('account').addEventListener('input', updateTokenHelp);

  document.addEventListener('DOMContentLoaded', () => {
      restoreOptions();
      // Trigger help update once after restore (wrapped in timeout to ensure value is populated)
      setTimeout(updateTokenHelp, 100); 
  });
  document.getElementById('save').addEventListener('click', saveOptions);
  document.getElementById('test').addEventListener('click', testConnection);
