// ============= Firefox/Chrome 兼容性处理 =============
// 为Firefox和Chrome提供统一的API接口
const API = (() => {
    const isFirefox = typeof browser !== 'undefined';
    const browserAPI = isFirefox ? browser : chrome;
    
    return {
        // 获取浏览器环境标识
        isFirefox,
        
        // 统一的存储接口
        storage: {
            sync: {
                get: (keys) => {
                    if (isFirefox) {
                        return browserAPI.storage.sync.get(keys);
                    } else {
                        return new Promise((resolve) => {
                            browserAPI.storage.sync.get(keys, resolve);
                        });
                    }
                },
                set: (items) => {
                    if (isFirefox) {
                        return browserAPI.storage.sync.set(items);
                    } else {
                        return new Promise((resolve) => {
                            browserAPI.storage.sync.set(items, resolve);
                        });
                    }
                }
            },
            local: {
                set: (items) => {
                    if (isFirefox) {
                        return browserAPI.storage.local.set(items);
                    } else {
                        return new Promise((resolve) => {
                            browserAPI.storage.local.set(items, resolve);
                        });
                    }
                }
            }
        },
        
        // 统一的徽章接口
        action: {
            setBadgeText: (details) => {
                return browserAPI.action.setBadgeText(details);
            },
            setBadgeBackgroundColor: (details) => {
                return browserAPI.action.setBadgeBackgroundColor(details);
            },
            setBadgeTextColor: (details) => {
                // Firefox 和某些版本的 Chrome 可能不支持
                if (browserAPI.action.setBadgeTextColor) {
                    return browserAPI.action.setBadgeTextColor(details);
                }
            },
            setBadgeProperties: (details) => {
                // 仅 Chrome 支持
                if (browserAPI.action.setBadgeProperties) {
                    return browserAPI.action.setBadgeProperties(details);
                }
            }
        },
        
        // 统一的标签接口
        tabs: {
            create: (details) => {
                return browserAPI.tabs.create(details);
            }
        },
        
        // 统一的运行时接口
        runtime: {
            onStartup: browserAPI.runtime.onStartup,
            onInstalled: browserAPI.runtime.onInstalled,
            onMessage: browserAPI.runtime.onMessage,
            sendMessage: (message) => {
                return browserAPI.runtime.sendMessage(message);
            }
        },
        
        // 统一的i18n接口
        i18n: {
            getMessage: (messageName, substitutions) => {
                return browserAPI.i18n.getMessage(messageName, substitutions);
            }
        }
    };
})();

// ============= 全局变量定义 =============
let fetchInterval = 300000; // 默认请求间隔为5分钟
let accountUrl = ''; // 用于存储账户的 URL
let fetchTimer = null; // 定时器 ID
let isFetching = false; // 防止重复请求
let lastNotificationCount = 0; // 记录上次的通知数量
let lastInstanceUrl = ''; // 记录当前的实例URL
let retryCount = 0; // 重试计数
let maxRetries = 3; // 最大重试次数
let consecutiveErrors = 0; // 连续错误计数
let lastFetchTime = 0; // 上次获取时间
let cacheTimeout = 10000; // 缓存10秒（改短以确保更及时的更新）
let notificationCache = new Map(); // 使用Map作为缓存
let forceFresh = false; // 强制刷新标志，用于确保及时更新

// 更新徽章显示
function updateBadge(count) {
    if (count !== lastNotificationCount) {
        lastNotificationCount = count;
    }
    // 始终更新徽章显示（即使数字相同，也要确保UI同步）
    if (count > 0) {
        // 格式化显示数量
        let displayText = count.toString();
        if (count > 99) {
            displayText = '99+';
        }
        API.action.setBadgeText({ text: displayText }); // 显示未读通知数量

        // 紫色徽章 (#6364ff)
        API.action.setBadgeBackgroundColor({ color: '#6364ff' });

        // 设置徽章文字颜色为白色
        API.action.setBadgeTextColor({ color: '#ffffff' });

        // 设置徽章样式使其更像圆形（仅 Chrome 支持）
        API.action.setBadgeProperties({
            minimum: 1, // 最小字符数，让徽章更紧凑
            maximum: 3  // 最大字符数，限制宽度使徽章更接近圆形
        });
    } else {
        API.action.setBadgeText({ text: '' }); // 清除徽章
    }
}

// 更新通知数量（使用缓存）
function updateNotificationCount(count) {
    updateBadge(count);
}

async function fetchUnreadCount() {
    // 防止重复请求
    if (isFetching) {
        return;
    }
    isFetching = true;

    try {
        const data = await API.storage.sync.get();
        const { instance, accessToken, userName, limit, types, excludeTypes, interval } = data;

        if (!accessToken || !userName) {
            updateBadge(0); // 使用 updateBadge 统一处理
            isFetching = false;
            return; // 如果缺少必要的设置，直接返回
        }

        const newFetchInterval = (interval || 300) * 1000; // 将秒转换为毫秒

        // 如果间隔发生变化，重新设置定时器
        if (newFetchInterval !== fetchInterval) {
            fetchInterval = newFetchInterval;
            restartFetchTimer();
        }

        // 解析 instance
        let instanceUrl = instance;

        // 保存实例URL用于通知页面跳转
        if (instanceUrl) {
            lastInstanceUrl = instanceUrl;
        }

        // 如果没有单独设置 instance，从 userName 中提取
        if (!instanceUrl && userName) {
            // 检查 userName 是否是完整格式（@user@instance）
            if (userName.startsWith('@') && userName.includes('@', 1)) {
                const parts = userName.split('@');
                // parts = ['', 'user', 'instance']
                instanceUrl = parts[2];

                // 保存实例URL用于通知页面跳转
                if (instanceUrl) {
                    lastInstanceUrl = instanceUrl;
                }
            }
        }

        if (!instanceUrl) {
            updateBadge(0); // 使用 updateBadge 统一处理
            isFetching = false;
            return;
        }

        // 检查缓存（除非强制刷新）
        if (!forceFresh) {
            const cacheKey = `${instanceUrl}_${accessToken.slice(-10)}`;
            const cached = notificationCache.get(cacheKey);
            const now = Date.now();
            if (cached && (now - cached.timestamp) < cacheTimeout) {
                // 使用缓存数据
                updateNotificationCount(cached.count);
                isFetching = false;
                return;
            }
        }
        forceFresh = false; // 重置强制刷新标志

        // 尝试直接使用 unread_count 端点（不带任何参数）
        const unreadCountUrl = new URL(`https://${instanceUrl}/api/v1/notifications/unread_count`);

        const response = await fetch(unreadCountUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': 'Mastodonify/1.0'
            }
        });

        if (response.ok) {
            const data = await response.json();
            const count = data.count; // 获取 count 值

            // 成功获取数据，重置错误计数
            retryCount = 0;
            consecutiveErrors = 0;

            // 更新缓存
            const cacheKey = `${instanceUrl}_${accessToken.slice(-10)}`;
            notificationCache.set(cacheKey, {
                count: count,
                timestamp: Date.now()
            });

            // 更新通知数量
            updateNotificationCount(count);

            // 获取 accountUrl 用于打开 Mastodon 按钮
            await getAccountUrl(instanceUrl, userName, accessToken);
            return;
        } else if (response.status === 401) {
            // 认证失败
            await API.storage.local.set({
                lastError: {
                    message: 'invalid_token',
                    timestamp: Date.now(),
                    count: consecutiveErrors
                }
            });
            // 不更改徽章，保持原样显示错误状态
            API.action.setBadgeText({ text: '!' });
            API.action.setBadgeBackgroundColor({ color: '#e53e3e' });
            API.action.setBadgeTextColor({ color: '#ffffff' });
            lastNotificationCount = 0; // 重置计数，这样即使重新授权，徽章也能更新
            return;
        } else if (response.status === 429) {
            // 请求过于频繁
            await API.storage.local.set({
                lastError: {
                    message: 'rate_limit_exceeded',
                    timestamp: Date.now(),
                    count: consecutiveErrors
                }
            });
            API.action.setBadgeText({ text: '!' });
            API.action.setBadgeBackgroundColor({ color: '#f59e0b' });
            API.action.setBadgeTextColor({ color: '#ffffff' });
            lastNotificationCount = 0; // 重置计数
            return;
        }

        // 如果直接请求失败，尝试通过 account ID 获取
        await getAccountAndFetchNotifications(instanceUrl, userName, accessToken, limit, types, excludeTypes);
    } catch (error) {
        consecutiveErrors++;
        retryCount++;

        // 如果未达到最大重试次数且是网络相关错误，则重试
        if (retryCount < maxRetries && error.name === 'TypeError' ||
            (error.message && error.message.includes('fetch'))) {
            setTimeout(fetchUnreadCount, 5000 * retryCount); // 递增延迟重试
        } else {
            // 显示错误状态
            API.action.setBadgeText({ text: '!' });
            API.action.setBadgeBackgroundColor({ color: '#e53e3e' }); // 红色
            API.action.setBadgeTextColor({ color: '#ffffff' });

            // 记录错误但不控制台输出
            await API.storage.local.set({
                lastError: {
                    message: error.message,
                    timestamp: Date.now(),
                    count: consecutiveErrors
                }
            });
        }
    } finally {
        isFetching = false; // 确保无论成功还是失败，都清除标志
    }
}

// 获取账户 URL
async function getAccountUrl(instanceUrl, userName, accessToken) {
    try {
        let lookupAcct = userName;
        if (userName.startsWith('@')) {
            lookupAcct = userName.substring(1);
        }

        const accountLookupUrl = new URL(`https://${instanceUrl}/api/v1/accounts/lookup?acct=${lookupAcct}`);
        const accountResponse = await fetch(accountLookupUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': 'Mastodonify/1.0'
            }
        });

        if (accountResponse.ok) {
            const accountData = await accountResponse.json();
            accountUrl = accountData.url;
            await API.storage.sync.set({ accountUrl });
        }
    } catch (error) {
        // 忽略错误，不影响主要功能
    }
}

// 通过账户 ID 获取通知数量
async function getAccountAndFetchNotifications(instanceUrl, userName, accessToken, limit, types, excludeTypes) {
    try {
        let lookupAcct = userName;
        if (userName.startsWith('@')) {
            lookupAcct = userName.substring(1);
        }

        const accountLookupUrl = new URL(`https://${instanceUrl}/api/v1/accounts/lookup?acct=${lookupAcct}`);
        const accountResponse = await fetch(accountLookupUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mastodonify/1.0'
            }
        });

        if (!accountResponse.ok) {
            console.error('Error fetching account ID:', accountResponse.statusText);
            updateBadge(0); // 使用统一的函数处理
            return;
        }

        const accountData = await accountResponse.json();
        const accountId = accountData.id;
        accountUrl = accountData.url;
        await API.storage.sync.set({ accountUrl });

        // 尝试使用带 account_id 的 unread_count 端点
        const unreadCountUrl = new URL(`https://${instanceUrl}/api/v1/notifications/unread_count?account_id=${accountId}`);

        const response = await fetch(unreadCountUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': 'Mastodonify/1.0'
            }
        });

        if (response.ok) {
            const data = await response.json();
            const count = data.count;

            // 更新缓存
            const cacheKey = `${instanceUrl}_${accessToken.slice(-10)}`;
            notificationCache.set(cacheKey, {
                count: count,
                timestamp: Date.now()
            });

            // 重置错误计数
            retryCount = 0;
            consecutiveErrors = 0;

            // 更新通知数量
            updateNotificationCount(count);
        } else {
            await fetchNotificationCountAlternative(instanceUrl, accessToken, limit, types, excludeTypes);
        }
    } catch (error) {
        updateBadge(0); // 使用统一的函数处理
    }
}

// 备选方法：使用通用的 notifications 端点
async function fetchNotificationCountAlternative(instanceUrl, accessToken, limit, types, excludeTypes) {
    try {
        const notificationsUrl = new URL(`https://${instanceUrl}/api/v1/notifications`);

        // 添加查询参数
        notificationsUrl.searchParams.append('exclude_types[]', 'admin.sign_up');
        notificationsUrl.searchParams.append('exclude_types[]', 'admin.report');
        notificationsUrl.searchParams.append('limit', limit || '50');

        // 添加用户指定的排除类型
        if (excludeTypes && excludeTypes.length > 0) {
            excludeTypes.forEach(type => {
                if (type && type.trim()) {
                    notificationsUrl.searchParams.append('exclude_types[]', type.trim());
                }
            });
        }

        if (types && types.length > 0) {
            // 如果指定了 types，则只获取这些类型的通知
            // 清除默认的排除类型，然后使用用户指定的类型
            notificationsUrl.searchParams.delete('exclude_types[]');
            types.forEach(type => {
                if (type && type.trim()) {
                    notificationsUrl.searchParams.append('types[]', type.trim());
                }
            });
        }

        const response = await fetch(notificationsUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': 'Mastodonify/1.0'
            }
        });

        if (response.ok) {
            const notifications = await response.json();

            // 在标准的 Mastodon API 中，返回的通知都是未读的
            // 已读的通知不会出现在结果中（除非使用 include_types 参数）
            const unreadCount = notifications.length;

            // 更新缓存
            const cacheKey = `${instanceUrl}_${accessToken.slice(-10)}`;
            notificationCache.set(cacheKey, {
                count: unreadCount,
                timestamp: Date.now()
            });

            // 重置错误计数
            retryCount = 0;
            consecutiveErrors = 0;

            // 更新通知数量
            updateNotificationCount(unreadCount);
        } else {
            updateBadge(0); // 使用统一的函数处理
        }
    } catch (error) {
        updateBadge(0); // 使用统一的函数处理
    }
}

// 定时请求未读通知数量
function startFetchTimer() {
    if (fetchTimer) {
        clearInterval(fetchTimer);
    }
    fetchTimer = setInterval(fetchUnreadCount, fetchInterval);
}

function restartFetchTimer() {
    startFetchTimer();
    // 立即执行一次
    fetchUnreadCount();
}

// 初始化时先获取设置，然后启动定时器
async function initializeExtension() {
    // 读取设置以获取正确的轮询间隔
    const data = await API.storage.sync.get(['interval']);
    const { interval } = data;
    if (interval) {
        fetchInterval = interval * 1000; // 将秒转换为毫秒
    }
    startFetchTimer();
    // 立即执行一次获取通知
    fetchUnreadCount();
}

initializeExtension(); // 使用新的初始化函数

// 监听浏览器启动事件
API.runtime.onStartup.addListener(() => {
    fetchUnreadCount(); // 在浏览器启动时调用 fetchUnreadCount 函数
});

// 在扩展安装时调用该函数
API.runtime.onInstalled.addListener(() => {
    fetchUnreadCount(); // 在扩展安装时调用 fetchUnreadCount 函数
});


// 监听来自 popup.js 的消息
API.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === "settingsUpdated") {
        forceFresh = true; // 设置强制刷新标志
        fetchUnreadCount(); // 调用 fetchUnreadCount 函数
    } else if (request.action === "openMastodon") {
        // 处理跳转到 Mastodon 实例的请求
        API.tabs.create({ url: request.url });
    } else if (request.action === "testNotifications" || request.action === "refreshNotifications") {
        // 测试通知数量或手动刷新
        forceFresh = true; // 设置强制刷新标志，跳过缓存
        fetchUnreadCount();
    } else if (request.action === "getNotificationCount") {
        // 获取当前的 userName
        (async () => {
            const data = await API.storage.sync.get(['userName']);
            // 从 userName 中提取用户名部分（去掉 @ 和实例）
            let userHandle = '';
            if (data.userName && data.userName.startsWith('@') && data.userName.includes('@', 1)) {
                const parts = data.userName.split('@');
                userHandle = parts[1]; // 获取用户名部分
            }

            // 返回当前通知数量、实例URL和用户名
            sendResponse({
                count: lastNotificationCount,
                instanceUrl: lastInstanceUrl,
                userName: userHandle
            });
        })();
    }
    return true; // 保持消息通道打开以支持异步响应
});