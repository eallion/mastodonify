# Mastodonify

中文说明 | [[English](README.md)]

Mastodon 未读通知数提示的 Chrome 插件。

[![](assets/ChromeStore.png)](https://chromewebstore.google.com/detail/moemfdcocgppacjkgbjmghhaeadaphdh)

## 功能特性

- **智能弹出界面**：配置后显示通知数，需要时显示设置
- **通知角标**：在扩展图标上显示未读数量
- **点击跳转**：点击通知区域跳转到通知或个人主页
- **自动解析实例**：从用户名中自动提取实例地址
- **性能优化**：内置缓存和智能刷新机制
- **多语言支持**：中英文界面

## 快速设置

### 必填设置

#### 1. Mastodon 用户名

格式：`@eallion@e5n.cc`（需包含用户名和实例）

#### 2. 访问令牌

1. 访问 Mastodon 实例：`设置` > `开发`
2. 点击`新应用`
3. 填写`应用名称`（任意名称）
4. 只勾选`read:notifications`权限
5. 创建后复制`你的访问令牌`
6. 粘贴到扩展设置中

> 快捷链接：`https://{你的实例}/settings/applications/`

### 可选设置

点击通知数旁的设置按钮访问高级选项：

#### 3. 通知数量限制

- 默认：100 条通知
- 范围：1-1000
- 除非通知量很大，否则建议保持默认

#### 4. 排除通知类型

勾选复选框排除特定类型通知：

- `mention` - 帖子中的提及
- `status` - 关注用户的新帖子
- `reblog` - 你帖子的转发
- `follow` - 新关注者
- `follow_request` - 关注请求
- `favourite` - 你帖子的收藏
- `poll` - 投票完成
- `update` - 帖子编辑通知
- `admin.sign_up` - 新用户注册
- `admin.report` - 新报告

#### 5. 刷新间隔

- 默认：300 秒（5 分钟）
- 最小：60 秒
- 建议设置较长时间以避免请求限制

## 使用方法

1. **首次使用**：扩展自动打开设置页面
2. **已配置**：显示带角标的通知数量
3. **点击通知**：
   - 有未读：打开通知页面
   - 无未读：打开个人主页
4. **修改设置**：点击设置图标

## 使用技巧

- 实例会从用户名中自动提取
- 扩展缓存通知 30 秒以减少 API 调用
- 错误状态显示红色并有重试逻辑
- 99+ 条通知时角标显示 "99+"

<details><summary>
技术细节
</summary>

- 使用 Mastodon API v2 `/api/v1/notifications/unread_count`
- 实现指数退避错误处理
- 设置安全存储在 Chrome 同步存储中
- 符合 Manifest V3 规范

</details>
