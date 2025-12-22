# Privacy Policy

**Last Updated: December 23, 2024**

## Overview

Mastodonify is a browser extension that helps you monitor unread Mastodon notifications. We are committed to protecting your privacy. This privacy policy explains how we collect, use, and handle your data.

## Data Collection and Use

### 1. User Credentials and Account Information

- **What we collect**: Your Mastodon account handle (e.g., `@user@mastodon.social`) and Access Token
- **How we use it**: To authenticate with your Mastodon instance and fetch your notifications
- **Storage**: Your credentials are stored locally in your browser's storage using the `storage` permission
- **Transmission**: Your credentials are only sent directly to your Mastodon server over HTTPS to retrieve notification data
- **Retention**: Stored locally on your device until you remove them from extension settings

### 2. Notification Data

- **What we collect**: Notification metadata from your Mastodon account (notification type, count, timestamp)
- **How we use it**: To display an accurate badge count on the extension icon and provide a popup notification summary
- **Storage**: Temporarily cached in local browser storage for display purposes
- **Transmission**: Downloaded from your Mastodon server only; never sent to third parties
- **Retention**: Cached only during the current browser session and cleared periodically

### 3. Synchronization Data

- **What we collect**: Read/unread status markers from Mastodon's Markers API
- **How we use it**: To sync notification read status across your devices
- **Storage**: Stored on your Mastodon server only (via the Markers API)
- **Transmission**: Communicated only with your Mastodon instance
- **Retention**: As per your Mastodon server's retention policy

### 4. User Preferences

- **What we collect**: Your notification filter settings (notification types to ignore, polling interval)
- **How we use it**: To customize which notifications you see and how often the extension checks for updates
- **Storage**: Stored locally in your browser's storage
- **Transmission**: Never transmitted; stored locally only
- **Retention**: Stored locally until you uninstall the extension or clear your browser data

## Data Sharing

**Mastodonify does NOT:**

- Collect data for analytics or tracking purposes
- Share your data with third parties
- Send your data to our servers
- Use cookies or tracking mechanisms
- Collect personally identifiable information beyond what you explicitly provide

**Your data is only transmitted to:**

- Your Mastodon instance (the server you use for your account)
- Only with your explicit authorization via the Access Token you provide

## Permissions Used

- **`storage`**: To store your account settings and credentials locally in your browser
- **`alarms`**: To schedule periodic checks for new notifications
- **`<all_urls>`**: To access your Mastodon server and other Mastodon instances you may interact with

## Security

- All communication with Mastodon servers is encrypted (HTTPS only)
- Credentials are stored locally in your browser and are not exposed to external services
- The extension does not have network access beyond your Mastodon instance(s)

## Your Rights

- You can view all stored data through the extension settings
- You can delete your account credentials and preferences at any time through the settings
- You can uninstall the extension to completely remove all local data

## Changes to This Policy

We may update this privacy policy from time to time. Any changes will be reflected with an updated "Last Updated" date. Continued use of the extension constitutes your acceptance of any changes.

## Contact

For questions about this privacy policy or our privacy practices, please open an issue on the [GitHub repository](https://github.com/eallion/mastodonify).

---

## 隐私政策（中文）

**最后更新：2024年12月23日**

### 概述

Mastodonify 是一个帮助您监控长毛象(Mastodon)未读通知的浏览器扩展。我们致力于保护您的隐私。本隐私政策说明了我们如何收集、使用和处理您的数据。

### 数据收集和使用

#### 1. 用户凭证和账户信息

- **收集内容**: 您的长毛象账户手柄（例如：`@user@mastodon.social`）和访问令牌(Access Token)
- **使用方式**: 向您的长毛象实例进行身份验证并获取您的通知
- **存储位置**: 您的凭证存储在浏览器的本地存储中
- **传输方式**: 您的凭证仅通过 HTTPS 直接发送到您的长毛象服务器以检索通知数据
- **保留时间**: 在您从扩展设置中移除之前，一直存储在您的设备上

#### 2. 通知数据

- **收集内容**: 来自您长毛象账户的通知元数据（通知类型、数量、时间戳）
- **使用方式**: 在扩展图标上显示准确的徽章计数并提供弹出通知摘要
- **存储位置**: 临时缓存在本地浏览器存储中以用于显示
- **传输方式**: 仅从您的长毛象服务器下载；永不发送给第三方
- **保留时间**: 仅在当前浏览器会话期间缓存，定期清除

#### 3. 同步数据

- **收集内容**: 来自长毛象 Markers API 的已读/未读状态标记
- **使用方式**: 在您的设备间同步通知的已读状态
- **存储位置**: 仅存储在您的长毛象服务器上
- **传输方式**: 仅与您的长毛象实例进行通信
- **保留时间**: 按照您的长毛象服务器的保留政策

#### 4. 用户偏好设置

- **收集内容**: 您的通知过滤设置（要忽略的通知类型、轮询间隔）
- **使用方式**: 自定义您看到的通知以及扩展检查更新的频率
- **存储位置**: 存储在您的浏览器本地存储中
- **传输方式**: 永不传输；仅本地存储
- **保留时间**: 存储在本地，直到您卸载扩展或清除浏览器数据

### 数据共享

**Mastodonify 不会:**

- 为了分析或跟踪目的收集数据
- 与第三方共享您的数据
- 将您的数据发送到我们的服务器
- 使用 Cookie 或跟踪机制
- 收集超出您明确提供的个人身份信息

**您的数据仅传输给:**

- 您的长毛象实例（您用于账户的服务器）
- 仅通过您提供的访问令牌进行明确授权

### 使用的权限

- **`storage`**: 在您的浏览器中本地存储账户设置和凭证
- **`alarms`**: 安排定期检查新通知
- **`<all_urls>`**: 访问您的长毛象服务器和您可能交互的其他长毛象实例

### 安全性

- 与长毛象服务器的所有通信都是加密的（仅限 HTTPS）
- 凭证存储在您的浏览器本地，不会暴露给外部服务
- 扩展除了您的长毛象实例外没有网络访问权限

### 您的权利

- 您可以通过扩展设置查看所有存储的数据
- 您可以随时通过设置删除您的账户凭证和偏好设置
- 您可以卸载扩展以完全删除所有本地数据

### 政策变更

我们可能会不时更新本隐私政策。任何更改都将反映在更新的"最后更新"日期中。继续使用该扩展即表示您接受任何更改。

### 联系我们

如有关于本隐私政策或我们隐私实践的问题，请在 [GitHub 仓库](https://github.com/eallion/mastodonify) 上提交问题。
