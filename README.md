# Mastodonify

English | [[中文说明](README.cn.md)]

Display unread notifications count from Mastodon extension for Chrome and Firefox.

[![](assets/ChromeStore.png)](https://chromewebstore.google.com/detail/moemfdcocgppacjkgbjmghhaeadaphdh)

## Features

- **Smart Popup UI**: Shows notification count when configured, settings when needed
- **Notification Badge**: Displays unread count on extension icon
- **Click Actions**: Click notification area to jump to notifications or profile
- **Auto-parse Instance**: Extracts instance from username automatically
- **Performance Optimized**: Built-in caching and intelligent refresh
- **Multi-language Support**: English and Chinese interface
- **Cross-browser Support**: Supports both Chrome and Firefox

## Installation

### Chrome Version

1. Download the latest version `mastodonify-chrome-v1.0.2.zip` from [Releases](https://github.com/eallion/mastodonify/releases)
2. Unzip the file
3. Open Chrome browser and go to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked"
6. Select the unzipped folder

### Firefox Version

1. Download the latest version `mastodonify-firefox-v1.0.2.zip` from [Releases](https://github.com/eallion/mastodonify/releases)
2. Unzip the file
3. Open Firefox browser and go to `about:debugging`
4. Click "This Firefox"
5. Click "Load Temporary Add-on"
6. Select the manifest.json file from the unzipped folder

## Quick Setup

### Required Settings

#### 1. Mastodon Username

Format: `@eallion@e5n.cc` (include both username and instance)

#### 2. Access Token

1. Go to your Mastodon instance: `Settings` > `Development`
2. Click `New application`
3. Fill in `Application name` (any name)
4. Check only `read:notifications` scope
5. Create and copy `Your access token`
6. Paste it into the extension settings

> Quick link: `https://{YOUR_INSTANCE}/settings/applications/`

### Optional Settings

Click the settings button next to notification count to access advanced options:

#### 3. Notification Limit

- Default: 100 notifications
- Range: 1-1000
- Keep default unless you receive high volume of notifications

#### 4. Exclude Notification Types

Check boxes to exclude specific notification types:

- `mention` - Mentions in posts
- `status` - New posts from followed users
- `reblog` - Boosts of your posts
- `follow` - New followers
- `follow_request` - Follow requests
- `favourite` - Favorites of your posts
- `poll` - Poll completions
- `update` - Edited post notifications
- `admin.sign_up` - New user sign-ups
- `admin.report` - New reports

#### 5. Refresh Interval

- Default: 300 seconds (5 minutes)
- Minimum: 60 seconds
- Longer intervals recommended to avoid rate limiting

## Usage

1. **First Time**: Extension opens settings automatically
2. **Configured**: Shows notification count with badge
3. **Click Notifications**:
   - With unread: Opens notifications page
   - Without unread: Opens your profile
4. **Settings**: Click gear icon to modify configuration

## Tips

- The instance is automatically extracted from your username
- Extension caches notifications for 30 seconds to reduce API calls
- Error states show in red with retry logic
- Badge shows "99+" for 100+ notifications

<details><summary>
Technical Details
</summary>

- Uses Mastodon API v2 `/api/v1/notifications/unread_count`
- Implements exponential backoff for errors
- Stores settings securely in browser sync storage
- Manifest V3 compliant

</details>

## Development

### Prerequisites

- Node.js 16+
- pnpm

### Install Dependencies

```bash
pnpm install
```

### Build Commands

```bash
# Build all platforms
pnpm run build

# Build Chrome version only
pnpm run build:chrome

# Build Firefox version only
pnpm run build:firefox

# Package for distribution
pnpm run package

# Clean build files
pnpm run clean
```

### Project Structure

```text
mastodonify/
├── src/                # Source code
├── build/              # Build scripts
├── dist/               # Build output
│   ├── chrome/         # Chrome version
│   └── firefox/        # Firefox version
├── release/            # Package files
├── _locales/           # Localization files
├── icons/              # Icon files
├── manifest.json       # Extension manifest
└── popup.html          # Popup page
```

## Contributing

Issues and Pull Requests are welcome!

## License

[MIT License](LICENSE)

## Changelog

### v1.0.2

- 🆕 Added Firefox support
- 🛠️ Optimized build system
- 📦 Unified build and packaging

### v1.0.1

- 🔧 Fixed notification detection issues
- 🎨 Improved UI

### v1.0.0

- 🎉 Initial release
- ✨ Notification detection and display
