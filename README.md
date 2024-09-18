# Mastodonify

English | [[中文说明](README.cn.md)]

Display unread notifications count from Mastodon extension for Chrome.

[![](assets/ChromeStore.png)](https://chromewebstore.google.com/detail/moemfdcocgppacjkgbjmghhaeadaphdh)

### Settings

#### 1. User Name

The format for Mastodon usernames: `@eallion@e5n.cc`

#### 2. Access Token

Go to the Mastodon instance, `Settings` > `Development` to create a `New Application`.

> Quick link: https://{INSTANCE}/settings/applications/

You can fill in the `Application Name` with anything, and only check the permission scopes `read:notification`.

After successful creation, copy `Your Access Token` and paste it into the browser extension's "`Token`" field. There is no need to copy the `Client key` or `Client secret`.

<details><summary>
Optional： 👈👈👈
</summary>  

#### 3. Instance

Instance domain, e.g., e5n.cc

Note: If you enter the full Mastodon username, there is no need to fill in the `Instance` option, as it will be automatically resolved.

#### 4. Limit

How many notifications to view at a time, default is 100, maximum is 1000. If you haven't encountered SPAM, keeping the default usually meets the needs.

#### 5. Types

Fill in the types below, separated by commas.

- `mention` = Someone mentioned you in their status
- `status` = Someone you enabled notifications for has posted a status
- `reblog` = Someone boosted one of your statuses
- `follow` = Someone followed you
- `follow_request` = Someone requested to follow you
- `favourite` = Someone favourited one of your statuses
- `poll` = A poll you have voted in or created has ended
- `update` = A status you boosted with has been edited
- `admin.sign_up` = Someone signed up (optionally sent to admins)
- `admin.report` = A new report has been filed

#### 6. Exclude Types

Same as above.

#### 7. Request Interval

Default is 300 seconds (5 minutes). Do not set it too fast to avoid being banned.

</details>
