document.addEventListener('DOMContentLoaded', function () {
    // 设置国际化文本（popup_options.html 不需要标题）
    if (document.getElementById('setting_title')) {
        document.getElementById('setting_title').textContent = chrome.i18n.getMessage('setting_title');
    }
    if (document.getElementById('description')) {
        document.getElementById('description').innerHTML = chrome.i18n.getMessage('description');
        document.getElementById('docs').innerHTML = chrome.i18n.getMessage('docs');
    }
    document.getElementById('access_token_label').textContent = chrome.i18n.getMessage('access_token_label');
    document.getElementById('user_name_label').textContent = chrome.i18n.getMessage('user_name_label');
    document.getElementById('limit_label').textContent = chrome.i18n.getMessage('limit_label');
    document.getElementById('exclude_types_label').textContent = chrome.i18n.getMessage('exclude_types_label');
    document.getElementById('interval_label').textContent = chrome.i18n.getMessage('interval_label');
        document.getElementById('button_save').textContent = chrome.i18n.getMessage('button_save');

  // 设置新增的国际化文本
  if (document.getElementById('basic_info_title')) {
    document.getElementById('basic_info_title').textContent = chrome.i18n.getMessage('basic_info_title');
  }
  if (document.getElementById('advanced_settings_title')) {
    document.getElementById('advanced_settings_title').textContent = chrome.i18n.getMessage('advanced_settings_title');
  }
  if (document.getElementById('username_hint')) {
    document.getElementById('username_hint').textContent = chrome.i18n.getMessage('username_hint');
  }
  if (document.getElementById('token_hint')) {
    document.getElementById('token_hint').textContent = chrome.i18n.getMessage('token_hint');
  }
  if (document.getElementById('settings_link')) {
    document.getElementById('settings_link').textContent = chrome.i18n.getMessage('settings_button');
  }
  
    // 加载当前设置和显示通知状态
    chrome.storage.sync.get(['instance', 'accessToken', 'userName', 'limit', 'types', 'excludeTypes', 'interval', 'accountUrl'], (data) => {
        document.getElementById('accessToken').value = data.accessToken || '';
        document.getElementById('userName').value = data.userName || '';
        document.getElementById('limit').value = data.limit || '100';

        // 设置排除通知类型的复选框
        const excludeTypes = Array.isArray(data.excludeTypes) ? data.excludeTypes : [];
        const excludeCheckboxes = document.querySelectorAll('input[name="excludeType"]');
        excludeCheckboxes.forEach(checkbox => {
            checkbox.checked = excludeTypes.includes(checkbox.value);
        });

        document.getElementById('interval').value = data.interval || '300';

  
        // 判断是否为首次安装或必填项缺失
        const hasRequiredSettings = data.accessToken && data.userName;

        if (!hasRequiredSettings) {
            // 首次安装或必填项缺失，显示设置表单
            document.getElementById('notification-settings-container').style.display = 'none';
            document.getElementById('settings-form').style.display = 'block';
        } else {
            // 必填项完整，默认显示通知状态
            document.getElementById('settings-form').style.display = 'none';
            document.getElementById('notification-settings-container').style.display = 'flex';
            document.getElementById('settings-button').style.display = 'flex';
            document.getElementById('settings-link').style.display = 'inline-block';
        }

        // 显示通知状态
        updateNotificationStatus();

        // 如果必填项已配置，点击设置链接显示设置
        if (hasRequiredSettings) {
            const settingsLink = document.getElementById('settings-link');
            settingsLink.addEventListener('click', (e) => {
                e.stopPropagation(); // 防止触发通知状态的点击事件
                const form = document.getElementById('settings-form');
                const settingsBtn = document.getElementById('settings-button');

                if (form.style.display === 'none') {
                    form.style.display = 'block';
                    settingsBtn.style.display = 'none';
                }
            });
        }

        // 检查是否有错误
        chrome.storage.local.get(['lastError'], (result) => {
            if (result.lastError && Date.now() - result.lastError.timestamp < 300000) { // 5分钟内的错误
                const errorElement = document.getElementById('message');
                errorElement.textContent = `${chrome.i18n.getMessage('network_error') || '网络错误'} (${result.lastError.count})`;
                errorElement.style.display = 'block';
                errorElement.style.opacity = '1';
                errorElement.style.backgroundColor = '#e53e3e';

                setTimeout(() => {
                    errorElement.style.opacity = '0';
                    setTimeout(() => {
                        errorElement.style.display = 'none';
                        errorElement.style.backgroundColor = '';
                    }, 500);
                }, 3000);
            }
        });
    });

    // 处理表单提交
    document.getElementById('settings-form').addEventListener('submit', (event) => {
        event.preventDefault();

        const submitButton = document.querySelector('.submit-button');
        submitButton.classList.add('loading');
        submitButton.disabled = true;

        // 从 userName 中提取实例
        const userName = document.getElementById('userName').value;
        let instance = '';

        if (userName && userName.startsWith('@') && userName.includes('@', 1)) {
            const parts = userName.split('@');
            instance = parts[2]; // 提取实例地址
        }

        const accessToken = document.getElementById('accessToken').value;
        const limit = document.getElementById('limit').value || 100;
        const types = []; // 默认获取所有类型的通知
        const excludeTypes = Array.from(document.querySelectorAll('input[name="excludeType"]:checked'))
            .map(checkbox => checkbox.value); // 获取选中的排除类型
        const interval = document.getElementById('interval').value || 300; // 获取interval的值，默认为300秒（5分钟）

        // 保存设置（不再需要单独保存 instance，因为可以从 userName 解析）
        chrome.storage.sync.set({ instance, accessToken, userName, limit, types, excludeTypes, interval }, () => {
            submitButton.classList.remove('loading');
            submitButton.disabled = false;

            const messageElement = document.getElementById('message');
            messageElement.textContent = chrome.i18n.getMessage('settings_saved');
            messageElement.style.display = 'block';
            messageElement.style.opacity = '1'; // 显示消息

            // 调用需要执行的函数
            onSettingsUpdated(); // 调用函数

            // 设定一段时间后隐藏消息
            setTimeout(() => {
                messageElement.style.opacity = '0'; // 隐藏消息
                setTimeout(() => {
                    messageElement.style.display = 'none'; // 完全隐藏

                    // 如果有必填项，隐藏设置表单并显示通知状态容器
                    if (accessToken && userName) {
                        document.getElementById('settings-form').style.display = 'none';
                        document.getElementById('notification-settings-container').style.display = 'flex';
                        document.getElementById('settings-button').style.display = 'flex';
                        document.getElementById('settings-link').style.display = 'inline-block';
                    }
                }, 500); // 等待过渡效果完成
            }, 2000); // 2 秒后隐藏
        });

    });

  });

// 更新通知状态显示
function updateNotificationStatus() {
    // 显示加载状态
    const notificationCount = document.getElementById('notification-count');
    const notificationText = document.getElementById('notification-text');
    notificationCount.textContent = '...';
    notificationText.textContent = chrome.i18n.getMessage('loading') || '加载中...';

    // 向 background.js 请求当前通知数量和实例URL
    chrome.runtime.sendMessage({ action: "getNotificationCount" }, (response) => {
        const notificationStatus = document.getElementById('notification-status');
        const notificationCount = document.getElementById('notification-count');
        const notificationText = document.getElementById('notification-text');

        // 始终显示通知状态区域
        notificationStatus.style.display = 'flex';
        notificationStatus.classList.remove('has-notifications');

        if (response && response.count !== undefined) {
            if (response.count > 0) {
                // 有未读通知
                notificationCount.textContent = response.count > 99 ? '99+' : response.count;
                notificationText.textContent = chrome.i18n.getMessage('unread_notifications_text');
                notificationStatus.classList.add('has-notifications');

                // 清除所有现有的事件监听器
                notificationStatus.replaceWith(notificationStatus.cloneNode(true));

                // 重新获取元素引用（因为 replaceWith 创建了新元素）
                const newNotificationStatus = document.getElementById('notification-status');

                // 添加点击事件，跳转到通知页面
                newNotificationStatus.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (response.instanceUrl) {
                        const notificationsUrl = `https://${response.instanceUrl}/notifications`;
                        chrome.tabs.create({ url: notificationsUrl });
                    }
                });
            } else {
                // 没有新通知
                notificationCount.textContent = '0';
                notificationText.textContent = chrome.i18n.getMessage('no_new_notifications');
                notificationStatus.style.backgroundColor = '#4a5568'; // 灰色背景

                // 清除所有现有的事件监听器
                notificationStatus.replaceWith(notificationStatus.cloneNode(true));

                // 重新获取元素引用（因为 replaceWith 创建了新元素）
                const newNotificationStatus = document.getElementById('notification-status');

                // 添加点击事件，跳转到用户主页
                newNotificationStatus.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (response.instanceUrl && response.userName) {
                        const profileUrl = `https://${response.instanceUrl}/@${response.userName}`;
                        chrome.tabs.create({ url: profileUrl });
                    }
                });
            }
        } else {
            // 配置错误
            notificationCount.textContent = '!';
            notificationText.textContent = chrome.i18n.getMessage('configuration_error');
            notificationStatus.style.backgroundColor = '#e53e3e'; // 红色背景
            notificationStatus.onclick = null; // 移除点击事件
        }
    });
}


// 定义在设置更新时调用的函数
function onSettingsUpdated() {
    // 发送消息到 background.js
    chrome.runtime.sendMessage({ action: "settingsUpdated" });

    // 更新通知状态
    setTimeout(updateNotificationStatus, 1000);
}