let fetchInterval = 300000; // 默认请求间隔为 5 分
let accountUrl = ''; // 用于存储账户的 URL

async function fetchUnreadCount() {
    const { instance, accessToken, userName, limit, types, excludeTypes, interval } = await chrome.storage.sync.get();

    if (!accessToken || !userName) {
        return; // 如果缺少必要的设置，直接返回
    }

    fetchInterval = (interval || 300) * 1000; // 将秒转换为毫秒

    // 解析 instance
    let instanceUrl = instance || userName.substring(userName.lastIndexOf('@') + 1); // 从 userName 中提取 instance
    if (!instanceUrl) {
        console.error('Instance is required but not provided.');
        return;
    }

    // 获取 accountId
    const accountLookupUrl = new URL(`https://${instanceUrl}/api/v1/accounts/lookup?acct=${userName}`);
    try {
        const accountResponse = await fetch(accountLookupUrl, {
            method: 'GET'
        });

        if (!accountResponse.ok) {
            console.error('Error fetching account ID:', accountResponse.statusText);
            chrome.action.setBadgeText({ text: '' }); // 不显示数字
            return;
        }

        const accountData = await accountResponse.json();
        const accountId = accountData.id; // 获取 accountId
        accountUrl = accountData.url; // 获取 account 的 URL

        // 构建 unread_count 请求的 URL
        const unreadCountUrl = new URL(`https://${instanceUrl}/api/v1/notifications/unread_count?${accountId}`);
        if (limit) unreadCountUrl.searchParams.append('limit', limit);
        if (types.length) unreadCountUrl.searchParams.append('types', types.join(','));
        if (excludeTypes.length) unreadCountUrl.searchParams.append('exclude_types', excludeTypes.join(','));
        
        const response = await fetch(unreadCountUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.ok) {
            // console.log('Response status:', response.status); // 打印响应状态
            const data = await response.json();
            const count = data.count; // 获取 count 值

            if (count > 0) {
                chrome.action.setBadgeText({ text: count.toString() }); // 显示未读通知数量
            } else {
                chrome.action.setBadgeText({ text: '' }); // 不显示数字
            }
        } else {
            console.error('Error fetching unread count:', response.statusText);
            chrome.action.setBadgeText({ text: '' }); // 不显示数字
        }
    } catch (error) {
        console.error('Fetch error:', error);
        chrome.action.setBadgeText({ text: '' }); // 不显示数字
    }
}

// 定时请求未读通知数量
setInterval(fetchUnreadCount, fetchInterval); // 使用用户设置的间隔

// 监听浏览器启动事件
chrome.runtime.onStartup.addListener(() => {
    fetchUnreadCount(); // 在浏览器启动时调用 fetchUnreadCount 函数
});

// 在扩展安装时调用该函数
chrome.runtime.onInstalled.addListener(() => {
    fetchUnreadCount(); // 在扩展安装时调用 fetchUnreadCount 函数
});

// 监听来自 popup.js 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "settingsUpdated") {
        fetchUnreadCount(); // 调用 fetchUnreadCount 函数
    }
});

// 监听图标点击事件，跳转到实例
chrome.action.onClicked.addListener(async (tab) => {
    const { accessToken, userName } = await chrome.storage.sync.get(['accessToken', 'userName']);
    
    if (!accessToken || !userName) {
        // 如果没有设置 accessToken 和 userName，打开 popup
        chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') }); // 打开 popup.html
    } else {
        // 如果已设置，跳转到 accountUrl
        if (accountUrl) {
            chrome.tabs.create({ url: accountUrl });
        } else {
            console.error('Account URL is not set. Please fetch unread count first.');
        }
    }
});