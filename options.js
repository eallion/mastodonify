// ============= Firefox/Chrome 兼容性处理 =============
const API = (() => {
    const isFirefox = typeof browser !== 'undefined';
    const browserAPI = isFirefox ? browser : chrome;

    return {
        isFirefox,
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
            }
        },
        runtime: {
            sendMessage: (message) => {
                return browserAPI.runtime.sendMessage(message);
            }
        },
        i18n: {
            getMessage: (messageName, substitutions) => {
                return browserAPI.i18n.getMessage(messageName, substitutions);
            }
        }
    };
})();

// ============= 设置页面初始化 =============
document.addEventListener('DOMContentLoaded', () => {
    // 国际化文本（按需存在则设置）
    const setText = (id, key) => {
        const el = document.getElementById(id);
        if (el) el.textContent = API.i18n.getMessage(key);
    };

    setText('setting_title', 'setting_title');
    setText('setting_title_h1', 'setting_title_h1');
    setText('description', 'description');
    setText('docs', 'docs');
    setText('access_token_label', 'access_token_label');
    setText('user_name_label', 'user_name_label');
    setText('limit_label', 'limit_label');
    setText('exclude_types_label', 'exclude_types_label');
    setText('interval_label', 'interval_label');
    setText('expand_option', 'expand_option');
    setText('button_save', 'button_save');

    // 处理可选字段的展开/收起
    const optionalFields = document.getElementById('optional-fields');
    const toggleButton = document.getElementById('toggle-optional');
    if (optionalFields && toggleButton) {
        optionalFields.style.display = 'block';
        toggleButton.textContent = API.i18n.getMessage('close_option');
        toggleButton.addEventListener('click', function () {
            if (optionalFields.style.display === 'none') {
                optionalFields.style.display = 'block';
                toggleButton.textContent = API.i18n.getMessage('close_option');
            } else {
                optionalFields.style.display = 'none';
                toggleButton.textContent = API.i18n.getMessage('expand_option');
            }
        });
    }

    // 加载当前设置并初始化表单
    (async () => {
        const data = await API.storage.sync.get(['instance', 'accessToken', 'userName', 'limit', 'types', 'excludeTypes', 'interval']);
        const setValue = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.value = value;
        };

        setValue('accessToken', data.accessToken || '');
        setValue('userName', data.userName || '');
        setValue('limit', data.limit || '100');
        setValue('interval', data.interval || '300');

        // 设置排除通知类型的复选框
        const excludeTypes = Array.isArray(data.excludeTypes) ? data.excludeTypes : [];
        const excludeCheckboxes = document.querySelectorAll('input[name="excludeType"]');
        excludeCheckboxes.forEach(checkbox => {
            checkbox.checked = excludeTypes.includes(checkbox.value);
        });
    })();

    // 表单提交处理
    const form = document.getElementById('settings-form');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const userName = (document.getElementById('userName') || {}).value || '';
            let instance = '';
            if (userName && userName.startsWith('@') && userName.includes('@', 1)) {
                const parts = userName.split('@');
                instance = parts[2] || '';
            }

            const accessToken = (document.getElementById('accessToken') || {}).value || '';
            const limit = (document.getElementById('limit') || {}).value || 100;
            const types = [];
            const excludeTypes = Array.from(document.querySelectorAll('input[name="excludeType"]:checked'))
                .map(checkbox => checkbox.value);
            const interval = (document.getElementById('interval') || {}).value || 300;

            (async () => {
                await API.storage.sync.set({ instance, accessToken, userName, limit, types, excludeTypes, interval });
                const messageElement = document.getElementById('message');
                if (messageElement) {
                    messageElement.textContent = API.i18n.getMessage('settings_saved');
                    messageElement.style.display = 'block';
                    messageElement.style.opacity = '1';

                    onSettingsUpdated();

                    setTimeout(() => {
                        messageElement.style.opacity = '0';
                        setTimeout(() => {
                            messageElement.style.display = 'none';
                        }, 500);
                    }, 2000);
                }
            })();
        });
    }
});

// 定义在设置更新时调用的函数
function onSettingsUpdated() {
    API.runtime.sendMessage({ action: "settingsUpdated" });
}
