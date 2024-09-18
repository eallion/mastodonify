# Mastodonify

中文说明 | [[English](README.md)]

Mastodon 未读通知数提示的 Chrome 插件。

[![](assets/ChromeStore.png)](https://chromewebstore.google.com/detail/moemfdcocgppacjkgbjmghhaeadaphdh)

### 设置

#### 1. 用户名

Mastodon 的用户名格式：`@eallion@e5n.cc`

#### 2. Access Token

前往 Mastodon 实例，`设置` `开发` 新建一个 `创建新应用`

> 快捷直达：https://{INSTANCE}/settings/applications/

`应用名称` 随便填，（只）勾上权限范围 `read:notifications` 这一个即可。

创建成功后，复制 `你的访问令牌` 填入浏览器扩展的「令牌」，不需要复制 `应用 ID` `应用密钥`。

<details><summary>
选填项： 👈👈👈
</summary>  

#### 3. 实例

实例域名，如：e5n.cc

注：如果填入完整的 Mastodon 用户名，则无须再填入 `实例` 这一选项，会自动解析。

#### 4. 限制 Limit

每次查看多少条通知，默认 100，最大 1000，没有遇到 SPAM，保持默认一般都能满足需求。

#### 5. 想看的通知类型 Types

填入下面的类型，用半角逗号分隔。

- `mention` = 有人提到你在他们的状态中
- `status` = 你启用了通知的某人发布了状态
- `reblog` = 有人转发了你的状态
- `follow` = 有人关注了你
- `follow_request` = 有人请求关注你
- `favourite` = 有人收藏了你的状态
- `poll` = 你投票或创建的投票已结束
- `update` = 你转发的状态已被编辑
- `admin.sign_up` = 有人注册了（可选发送给管理员）
- `admin.report` = 一份新的报告已被提交

#### 6. 排除的通知类型

同上。

#### 7. 刷新时间间隔

默认 300 秒（5 分钟），不要设置太快，小心被 BAN。

</details>
