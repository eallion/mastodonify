# Mastodonify

![Icon](icons/mastodonify-128.png)

**Mastodonify** is a lightweight, cross-browser extension (Chrome & Firefox) that notifies you of unread Mastodon notifications directly on the extension icon. It supports periodic polling, customizable filters, and synchronization with your server-side read markers.

[中文说明](#mastodonify-中文说明)

---

## Features

- **Cross-Browser Support**: Works on Chrome (Manifest V3) and Firefox (MV3).
- **Badge Notifications**: Displays the exact number of unread notifications on the extension icon.
- **Smart Sync**: Uses Mastodon's Markers API to sync read status across devices (if you read it on your phone, the badge clears).
- **Customizable Filters**: Choose to ignore specific notification types (e.g., Favourites, Reblogs, Polls).
- **Internationalization**: Available in English, Simplified Chinese (简体中文), and Japanese (日本語).
- **Countdown Timer**: Visual progress bar on the popup button showing when the next check will occur.

## Installation

### Chrome / Edge / Brave

1. Download the latest `mastodonify-chrome.zip` from releases.
2. Unzip the file.
3. Open `chrome://extensions/` in your browser.
4. Enable **Developer mode** in the top right corner.
5. Click **Load unpacked** and select the unzipped directory.

### Firefox

1. Download the latest `mastodonify-firefox.zip` from releases.
2. Unzip the file.
3. Open `about:debugging` in Firefox.
4. Click **This Firefox** on the left sidebar.
5. Click **Load Temporary Add-on...**.
6. Select the `manifest.json` file inside the unzipped directory.

## Configuration

1. Click the Mastodonify icon in your browser toolbar.
2. Click **Open Settings**.
3. **Account**: Enter your full handle (e.g., `@user@mastodon.social`).
4. **Access Token**:
   - Go to your instance's **Preferences** -> **Development**.
   - Click **New Application**.
   - Name it "Mastodonify".
   - Ensure `read:notifications` scope is selected.
   - Click **Submit** and copy the **Access Token**.
   - Paste the token into the extension settings.
5. **Check Interval**: Set how often (in seconds) to check for notifications (Default: 300s).
6. **Filters**: Check any notification types you want to **ignore**.
7. Click **Save Settings**.

## Development

### Build

To create the distributable zip files for Chrome and Firefox:

```bash
./build.sh
```

This will generate:

- `release/mastodonify-chrome.zip`
- `release/mastodonify-firefox.zip`

---

# Mastodonify (中文说明)

**Mastodonify** 是一个轻量级的跨浏览器扩展（支持 Chrome 和 Firefox），能够在扩展图标上实时显示 Mastodon 的未读通知数量。它支持定时轮询、自定义过滤，并能与服务器端的阅读标记同步。

## 功能特性

- **跨浏览器支持**：完美支持 Chrome (Manifest V3) 和 Firefox (MV3)。
- **角标提醒**：在扩展图标上直接显示未读通知的确切数量。
- **智能同步**：利用 Mastodon Markers API 跨设备同步阅读状态（如果您在手机上已读，扩展角标会自动清除）。
- **自定义过滤**：可选择忽略特定类型的通知（如：点赞、转嘟、投票等）。
- **多语言支持**：内置英语、简体中文、日语支持。
- **倒计时显示**：点击图标弹出的按钮上带有可视化进度条，显示距离下一次检查的剩余时间。

## 安装指南

### Chrome / Edge / Brave

1. 下载最新的 `mastodonify-chrome.zip` 压缩包。
2. 解压文件。
3. 在浏览器地址栏输入 `chrome://extensions/` 并回车。
4. 打开右上角的 **开发者模式 (Developer mode)**。
5. 点击 **加载已解压的扩展程序 (Load unpacked)**，选择解压后的文件夹。

### Firefox

1. 下载最新的 `mastodonify-firefox.zip` 压缩包。
2. 解压文件。
3. 在浏览器地址栏输入 `about:debugging` 并回车。
4. 点击左侧的 **此 Firefox (This Firefox)**。
5. 点击 **临时载入附加组件 (Load Temporary Add-on...)**。
6. 选择解压文件夹中的 `manifest.json` 文件。

## 设置说明

1. 点击浏览器工具栏上的 Mastodonify 图标。
2. 点击 **打开设置 (Open Settings)**。
3. **账号 (Account)**：输入您的完整账号（例如 `@user@mastodon.social`）。
4. **访问令牌 (Access Token)**：
   - 登录您的 Mastodon 实例，进入 **首选项 (Preferences)** -> **开发 (Development)**。
   - 点击 **新建应用 (New Application)**。
   - 输入名称 "Mastodonify"。
   - 确保勾选 `read:notifications` 权限。
   - 点击 **提交 (Submit)**，然后复制生成的 **访问令牌 (Access Token)**。
   - 将令牌粘贴到扩展设置中。
5. **检查间隔**：设置检查通知的频率（秒），默认为 300 秒（5 分钟）。
6. **忽略类型**：勾选您不想看到的通知类型（例如：不想看“点赞”通知）。
7. 点击 **保存设置 (Save Settings)**。

## 开发构建

运行以下脚本即可生成适用于 Chrome 和 Firefox 的发布包：

```bash
./build.sh
```

生成的文件位于 `release/` 目录下。
