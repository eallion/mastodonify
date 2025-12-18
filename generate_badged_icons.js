// 这个脚本用于生成带有通知数量标记的图标
// 由于 Chrome 扩展 API 限制，我们使用动态图标来模拟右上角徽章效果

// 在 background.js 中添加这个函数
function updateIconWithBadge(count) {
    // 由于 Chrome 限制，我们只能使用 setBadgeText
    // 但可以通过调整视觉样式使其更明显
    if (count > 0) {
        // 使用更醒目的颜色和更大的徽章
        chrome.action.setBadgeText({
            text: count > 99 ? '99+' : count.toString()
        });
        chrome.action.setBadgeBackgroundColor({ color: '#e84528' });
        chrome.action.setBadgeTextColor({ color: '#ffffff' });

        // 尝试使用徽章相关的其他属性
        if (chrome.action.setBadgeProperties) {
            chrome.action.setBadgeProperties({
                position: 'top-right' // 某些浏览器支持
            });
        }
    } else {
        chrome.action.setBadgeText({ text: '' });
    }
}