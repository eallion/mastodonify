document.addEventListener('DOMContentLoaded', () => {
    // 加载当前设置
    chrome.storage.sync.get(['instance', 'accessToken', 'userName', 'limit', 'types', 'excludeTypes', 'interval'], (data) => {
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
    });

    // 处理表单提交
    document.getElementById('settings-form').addEventListener('submit', (event) => {
        event.preventDefault();

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
                }, 500); // 等待过渡效果完成
            }, 2000); // 2 秒后隐藏
        });

    });
});

document.addEventListener('DOMContentLoaded', function () {
    // 设置国际化文本
    document.getElementById('setting_title').textContent = chrome.i18n.getMessage('setting_title');
    document.getElementById('setting_title_h1').textContent = chrome.i18n.getMessage('setting_title_h1');
    document.getElementById('description').textContent = chrome.i18n.getMessage('description');
    document.getElementById('docs').textContent = chrome.i18n.getMessage('docs');
    document.getElementById('access_token_label').textContent = chrome.i18n.getMessage('access_token_label');
    document.getElementById('user_name_label').textContent = chrome.i18n.getMessage('user_name_label');
    document.getElementById('limit_label').textContent = chrome.i18n.getMessage('limit_label');
    document.getElementById('exclude_types_label').textContent = chrome.i18n.getMessage('exclude_types_label');
    document.getElementById('interval_label').textContent = chrome.i18n.getMessage('interval_label');
    document.getElementById('expand_option').textContent = chrome.i18n.getMessage('expand_option');
    document.getElementById('button_save').textContent = chrome.i18n.getMessage('button_save');
  
    // 处理选填字段的展开和收起
    const optionalFields = document.getElementById('optional-fields');
    const toggleButton = document.getElementById('toggle-optional');

    // 右键选项页面始终展开所有设置项
    optionalFields.style.display = 'block';
    toggleButton.textContent = chrome.i18n.getMessage('close_option');

    toggleButton.addEventListener('click', function () {
        if (optionalFields.style.display === 'none') {
            optionalFields.style.display = 'block';
            toggleButton.textContent = chrome.i18n.getMessage('close_option'); // 更新按钮文本
        } else {
            optionalFields.style.display = 'none';
            toggleButton.textContent = chrome.i18n.getMessage('expand_option'); // 更新按钮文本
        }
    });
});


// 定义在设置更新时调用的函数
function onSettingsUpdated() {
    // 发送消息到 background.js
    chrome.runtime.sendMessage({ action: "settingsUpdated" });
}