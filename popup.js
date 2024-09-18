document.addEventListener('DOMContentLoaded', () => {
    // 加载当前设置
    chrome.storage.sync.get(['instance', 'accessToken', 'userName', 'limit', 'types', 'excludeTypes', 'interval'], (data) => {
        document.getElementById('instance').value = data.instance || '';
        document.getElementById('accessToken').value = data.accessToken || '';
        document.getElementById('userName').value = data.userName || '';
        document.getElementById('limit').value = data.limit || '';

        const types = Array.isArray(data.types) && data.types.length > 0 ? data.types.join(', ') : '';
        document.getElementById('types').value = types;

        const excludeTypes = Array.isArray(data.excludeTypes) && data.excludeTypes.length > 0 ? data.excludeTypes.join(', ') : '';
        document.getElementById('excludeTypes').value = excludeTypes;

        document.getElementById('interval').value = data.interval || '';
    });

    // 处理表单提交
    document.getElementById('settings-form').addEventListener('submit', (event) => {
        event.preventDefault();

        const instance = document.getElementById('instance').value;
        const accessToken = document.getElementById('accessToken').value;
        const userName = document.getElementById('userName').value;
        const limit = document.getElementById('limit').value || 100;
        const types = document.getElementById('types').value ? document.getElementById('types').value.split(',').map(type => type.trim()) : []; // 如果没有输入，设置为空数组
        const excludeTypes = document.getElementById('excludeTypes').value ? document.getElementById('excludeTypes').value.split(',').map(type => type.trim()) : []; // 如果没有输入，设置为空数组
        const interval = document.getElementById('interval').value || 10; // 获取 interval 的值，默认为 10

        // 保存设置
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
    document.getElementById('setting_title').innerHTML = chrome.i18n.getMessage('setting_title');
    document.getElementById('setting_title_h1').innerHTML = chrome.i18n.getMessage('setting_title_h1');
    document.getElementById('description').innerHTML = chrome.i18n.getMessage('description');
    document.getElementById('docs').innerHTML = chrome.i18n.getMessage('docs');
    document.getElementById('instance_label').innerHTML = chrome.i18n.getMessage('instance_label');
    document.getElementById('access_token_label').innerHTML = chrome.i18n.getMessage('access_token_label');
    document.getElementById('user_name_label').innerHTML = chrome.i18n.getMessage('user_name_label');
    document.getElementById('limit_label').innerHTML = chrome.i18n.getMessage('limit_label');
    document.getElementById('types_label').innerHTML = chrome.i18n.getMessage('types_label');
    document.getElementById('exclude_types_label').innerHTML = chrome.i18n.getMessage('exclude_types_label');
    document.getElementById('interval_label').innerHTML = chrome.i18n.getMessage('interval_label');
    document.getElementById('expand_option').innerHTML = chrome.i18n.getMessage('expand_option');
    document.getElementById('button_save').innerHTML = chrome.i18n.getMessage('button_save');

    // 处理选填字段的展开和收起
    const optionalFields = document.getElementById('optional-fields');
    const toggleButton = document.getElementById('toggle-optional');

    toggleButton.addEventListener('click', function () {
        if (optionalFields.style.display === 'none') {
            optionalFields.style.display = 'block';
            toggleButton.innerHTML = chrome.i18n.getMessage('close_option'); // 更新按钮文本
        } else {
            optionalFields.style.display = 'none';
            toggleButton.innerHTML = chrome.i18n.getMessage('expand_option'); // 更新按钮文本
        }
    });
});

// 定义在设置更新时调用的函数
function onSettingsUpdated() {
    // 在这里执行您需要的逻辑，例如调用 background.js 中的函数
    console.log("Settings have been updated. You can call your function here.");
    // 例如，您可以发送消息到 background.js
    chrome.runtime.sendMessage({ action: "settingsUpdated" });
}