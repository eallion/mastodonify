function localizeHtml() {
    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const key = elem.getAttribute('data-i18n');
        const msg = chrome.i18n.getMessage(key);
        if (msg) elem.textContent = msg;
        
        if (elem.title === 'Settings') {
             const titleMsg = chrome.i18n.getMessage('settingsTitle');
             if(titleMsg) elem.title = titleMsg;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    localizeHtml();
    
    chrome.storage.sync.get(['account', 'token', 'interval'], (items) => {
        if (!items.account || !items.token) {
            showSetup();
        } else {
            showMain(items.account, items.interval);
        }
    });

    document.getElementById('go-to-settings').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    document.getElementById('settings-btn').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
});

function showSetup() {
    document.getElementById('setup-view').classList.remove('hidden');
    document.getElementById('main-view').classList.add('hidden');
}

function showMain(account, interval) {
    document.getElementById('setup-view').classList.add('hidden');
    document.getElementById('main-view').classList.remove('hidden');

    const domain = account.split('@').pop();
    const notifBtn = document.getElementById('notif-btn');

    chrome.action.getBadgeText({}, (text) => {
        const suffix = chrome.i18n.getMessage('suffixNotif') || 'Notifications';
        const noUnread = chrome.i18n.getMessage('noUnread') || 'No unread notifications';
        
        if (text && text !== '' && text !== 'ERR' && text !== '!') {
            notifBtn.textContent = `${text} ${suffix}`;
        } else {
            notifBtn.textContent = noUnread;
        }
    });

    notifBtn.addEventListener('click', () => {
        const url = `https://${domain}/notifications`;
        chrome.tabs.create({ url: url });
        chrome.runtime.sendMessage({ action: 'markRead' });
        window.close();
    });
    
    startCountdown(interval);
}

function startCountdown(intervalSeconds) {
    const intervalMs = (intervalSeconds || 300) * 1000;
    
    const updateTimer = async () => {
        const alarm = await chrome.alarms.get('pollMastodon');
        const btn = document.getElementById('notif-btn');
        
        if (!alarm || !btn) {
             if (btn) btn.style.background = '#6364ff';
             return;
        }

        const now = Date.now();
        let timeLeft = alarm.scheduledTime - now;
        
        if (timeLeft < 0) timeLeft = 0;
        if (timeLeft > intervalMs) timeLeft = intervalMs;

        // p represents remaining percentage (100 -> 0)
        const p = (timeLeft / intervalMs) * 100;
        
        // Linear gradient: 
        // 0% to p% : Remaining Color (#6364ff - Mastodon Purple)
        // p% to 100% : Elapsed Color (#303030 - Dark Gray for contrast)
        // using "to right"
        
        // This makes the purple bar shrink from right to left as time passes (assuming LTR)
        // Or we can fill "elapsed" from left.
        // User said "left to right 變色" (color change).
        // Let's stick to "Remaining" bar shrinks.
        // So [PPPPPP.....] -> [PPP.......] -> [..........]
        
        btn.style.background = `linear-gradient(to right, #6364ff ${p}%, #909090 ${p}%)`;
    };
    
    updateTimer();
    setInterval(updateTimer, 1000); 
}
