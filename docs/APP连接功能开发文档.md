# APP 连接功能开发文档

## 1. 目标

连接页的目标是让 Web 端为移动 App 生成一次性验证码，App 端在输入服务器地址后，使用验证码完成安全绑定。绑定完成后，App 持有一个设备令牌，可继续访问后端接口。

当前这一轮实现聚焦三件事：

1. Web 端可生成连接码，并清晰展示服务器地址、有效期和对接说明。
2. App 端可通过 `服务器地址 + OTP + 设备信息` 完成验证。
3. 已授权设备可在 Web 端查看和撤销，撤销后设备令牌立即失效。

## 2. 业务流程

### 2.1 Web 端生成连接码

1. 用户进入侧边栏的“连接”页面。
2. 点击“生成连接码”。
3. 服务端创建一条 `appconnection` 记录：
   - `otpCode`: 6 位数字验证码
   - `isVerified`: `false`
   - `expiresAt`: 当前时间 + 5 分钟
   - `userId`: 当前用户
   - `accountId`: 当前默认账户
4. 前端展示：
   - 验证码
   - 服务器地址（来自 `PUBLIC_IP` 或当前请求推导）
   - 剩余有效时间
   - App 对接接口说明

### 2.2 App 端完成验证

1. App 端输入服务器地址。
2. App 端输入 Web 端展示的 OTP。
3. App 调用 `POST /api/connect/verify`。
4. 服务端校验：
   - OTP 是否存在
   - OTP 是否未过期
   - OTP 是否未被使用
   - `deviceId` 是否存在
5. 校验成功后，服务端写入：
   - `isVerified = true`
   - `verifiedAt`
   - `deviceId`
   - `deviceName`
   - `ipAddress`
6. 服务端返回设备令牌，App 后续请求可直接携带该令牌访问接口。

### 2.3 Web 端查看与撤销

1. Web 页面轮询已授权设备列表。
2. 若刚生成的连接记录已被 App 验证，页面状态切换为“已完成绑定”。
3. 用户可在设备列表中点击“撤销”。
4. 撤销后对应 `appconnection` 记录被删除，相关设备令牌立即失效。

## 3. 数据模型

核心表：`appconnection`

关键字段说明：

- `id`: 连接记录 ID，同时也是设备令牌的一部分。
- `userId`: 连接所属用户。
- `accountId`: 连接绑定的账户，用于多账户隔离。
- `deviceId`: App 设备唯一标识，必填。
- `deviceName`: 设备名称，可选。
- `ipAddress`: 发起验证时的 IP。
- `otpCode`: 6 位一次性验证码。
- `isVerified`: 是否已完成验证。
- `expiresAt`: OTP 失效时间。
- `verifiedAt`: 实际绑定完成时间。

## 4. API 契约

### 4.1 生成连接码

`POST /api/connect/generate`

请求体：

```json
{}
```

响应体：

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "connectionId": "conn_xxx",
    "otpCode": "123456",
    "publicIp": "192.168.1.20",
    "verifyPath": "/api/connect/verify",
    "expiresAt": "2026-03-23T12:00:00.000Z",
    "expiresInSeconds": 300
  }
}
```

说明：

- 每次生成都会覆盖当前账户下未完成验证的旧 OTP。
- `publicIp` 优先使用 `PUBLIC_IP`，未配置时退回到当前请求地址推导结果。
- `connectionId` 用于 Web 端判断这次生成的验证码是否已被成功验证。

### 4.2 App 验证连接

`POST /api/connect/verify`

请求体：

```json
{
  "otpCode": "123456",
  "deviceId": "ios-uuid-or-android-id",
  "deviceName": "iPhone 15"
}
```

成功响应：

```json
{
  "code": 200,
  "message": "verified",
  "data": {
    "accessToken": "dev-connection-id",
    "tokenType": "device",
    "connectionId": "connection-id",
    "verifiedAt": "2026-03-23T12:01:23.000Z"
  }
}
```

说明：

- `accessToken` 是设备令牌，不是普通网页登录 JWT。
- 服务端会根据 `dev-<connectionId>` 反查有效的连接记录。
- 设备被撤销后，该令牌会立即失效。

### 4.3 获取已授权设备

`GET /api/connect/devices`

返回当前账户下所有已完成验证的设备列表。

### 4.4 撤销设备授权

`DELETE /api/connect/:id`

说明：

- 仅可撤销当前账户下的设备。
- 删除记录后，设备令牌不再可用。

## 5. 设备令牌机制

当前实现采用轻量方案：

- App 验证成功后拿到 `dev-<connectionId>`。
- 服务端收到请求后：
  - 先尝试按普通 JWT 验证；
  - 若不是 JWT，则尝试按设备令牌解析；
  - 若对应连接记录存在且 `isVerified = true`，则将该请求视为已认证。

优点：

- 实现简单；
- 撤销设备后立即失效；
- 不需要额外的 token 黑名单系统。

限制：

- 当前设备令牌与连接记录强绑定；
- 后续如果需要刷新令牌、权限分级、长期会话，需要升级为正式的设备认证体系。

## 6. Web 页面职责

连接页当前应承担以下职责：

1. 生成 OTP。
2. 展示服务器地址、接口路径和示例请求。
3. 显示倒计时与绑定状态。
4. 自动刷新设备列表，感知 App 是否已绑定成功。
5. 提供设备撤销入口。

## 7. App 端接入建议

### 7.1 最小实现

1. 用户输入服务器地址。
2. 用户输入 6 位验证码。
3. App 生成或读取本机 `deviceId`。
4. 调用 `POST {server}/api/connect/verify`。
5. 保存返回的 `accessToken`。
6. 后续请求统一带上：

```http
Authorization: Bearer dev-connection-id
```

### 7.2 建议补充

- 首次启动为设备生成稳定的 `deviceId`。
- 保存最近一次连接过的服务器地址。
- 在连接失败时区分：
  - 验证码不存在
  - 验证码已过期
  - 网络连接失败
  - 设备已被撤销

## 8. 环境变量

服务端相关配置：

```env
PORT=3006
PUBLIC_IP="0.0.0.0"
JWT_SECRET="please-change-me"
```

建议：

- 本地开发可将 `PUBLIC_IP` 配成局域网 IP，例如 `192.168.1.20`。
- 生产环境可配置为公网 IP 或域名。
- 若使用 Nginx 或网关代理，App 实际访问路径应与代理后的路由保持一致。

## 9. 本轮已完成内容

- 连接页补全为可读的中文界面，并加入开发接入说明。
- 生成连接码响应补充 `connectionId`、`verifyPath`、`expiresInSeconds`。
- Web 端支持轮询识别“本次验证码是否已验证成功”。
- 连接记录在多账户模式下改为按 `accountId` 隔离。
- 内存模式下补齐用户/账户隔离，避免串号。
- 设备令牌接入统一认证逻辑，撤销后立即失效。

## 10. 后续建议

建议按下面顺序继续迭代：

1. 增加二维码展示，将服务器地址和 OTP 直接编码给 App 扫描。
2. 为设备令牌增加过期时间与刷新机制。
3. 增加“设备备注/最后活跃时间/最近同步时间”。
4. 对 `/api/connect/verify` 增加限流。
5. 为 App 增加“测试服务器连通性”的预检接口。

## 11. 联调检查清单

### Web 端

- 能成功生成 6 位 OTP。
- 剩余时间倒计时正常。
- 过期后状态切换正常。
- App 验证成功后，页面能自动显示“已完成绑定”。
- 设备列表能看到新设备。
- 撤销后设备从列表消失。

### App 端

- 输入服务器地址和 OTP 后能成功调用验证接口。
- 成功后能保存设备令牌。
- 使用设备令牌访问业务接口时能通过认证。
- 被撤销后再次请求会失败。
