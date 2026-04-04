# APP 交易同步接口开发文档

## 1. 目标

这份文档定义第一版 App 与服务端之间的交易同步方案。

本版目标很务实：

1. App 可以拉取服务端最新交易
2. App 可以批量把本地交易上行到服务端
3. 不修改现有数据库表结构
4. 直接兼容当前设备令牌认证

## 2. 认证方式

App 完成连接验证后，会拿到设备令牌：

```http
Authorization: Bearer dev-connection-id
```

后续调用同步接口时，直接带上这个令牌即可。

## 3. 接口概览

### 3.1 增量拉取

`GET /api/sync/transactions/pull`

用途：

- App 拉取当前账户下的最新交易
- 支持首次全量拉取
- 支持基于游标的增量拉取

### 3.2 批量上行

`POST /api/sync/transactions/push`

用途：

- App 批量提交新交易
- App 批量更新已有交易
- 通过稳定的 `orderId` 实现第一版幂等

## 4. 拉取接口

### 请求参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `limit` | 否 | 单次最多拉取条数，默认 100，最大 200 |
| `cursor` | 否 | 上一页返回的游标，优先使用 |
| `updatedAfter` | 否 | 兼容参数，首次接入时可用 ISO 时间字符串 |

### 请求示例

```http
GET /api/sync/transactions/pull?limit=100
Authorization: Bearer dev-connection-id
```

### 成功响应

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "items": [
      {
        "id": "tx_xxx",
        "orderId": "app_device123_0f5d8f3a",
        "date": "2026-03-23T10:20:00.000Z",
        "type": "EXPENSE",
        "amount": "32.5",
        "category": "餐饮",
        "platform": "APP",
        "merchant": "便利店",
        "description": "早餐",
        "paymentMethod": "现金",
        "status": "SUCCESS",
        "createdAt": "2026-03-23T10:20:10.000Z",
        "updatedAt": "2026-03-23T10:20:10.000Z"
      }
    ],
    "limit": 100,
    "hasMore": false,
    "nextCursor": null,
    "serverTime": "2026-03-23T10:30:00.000Z"
  }
}
```

### 使用方式

首次同步：

1. 不传 `cursor`
2. 保存返回的 `nextCursor`
3. 下次继续带 `cursor` 增量拉取

## 5. 上行接口

### 请求体

```json
{
  "items": [
    {
      "clientId": "local-1",
      "orderId": "app_device123_0f5d8f3a",
      "date": "2026-03-23T10:20:00.000Z",
      "type": "EXPENSE",
      "amount": "32.5",
      "category": "餐饮",
      "platform": "APP",
      "merchant": "便利店",
      "description": "早餐",
      "paymentMethod": "现金",
      "status": "SUCCESS"
    }
  ]
}
```

### 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `clientId` | 否 | App 本地临时 ID，仅用于结果映射 |
| `id` | 否 | 服务端交易 ID，更新已有记录时可传 |
| `orderId` | 建议是 | 新交易建议必传，用于幂等 |
| `date` | 是 | ISO 时间字符串 |
| `type` | 是 | `INCOME / EXPENSE / TRANSFER / REPAYMENT` |
| `amount` | 是 | 数字或字符串均可 |
| `category` | 是 | 分类 |
| `platform` | 是 | 平台，App 可统一传 `APP` |
| `merchant` | 否 | 商户名称 |
| `description` | 否 | 描述 |
| `paymentMethod` | 否 | 支付方式 |
| `status` | 否 | 状态 |

### 幂等建议

第一版不改库结构，因此建议 App 在创建本地交易时生成稳定的 `orderId`。

推荐格式：

```text
app_<deviceId>_<uuid>
```

例如：

```text
app_android-7f3c0d_4e64b17f-b0c5-47a6-bb57-2cae9b7ec8d3
```

好处：

- 同一条交易重复上报时，服务端会按 `orderId` 更新，不会重复创建
- 不需要新增数据库字段

### 成功响应

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "summary": {
      "total": 1,
      "created": 1,
      "updated": 0,
      "errors": 0
    },
    "items": [
      {
        "clientId": "local-1",
        "id": "tx_xxx",
        "orderId": "app_device123_0f5d8f3a",
        "action": "created"
      }
    ],
    "serverTime": "2026-03-23T10:30:00.000Z"
  }
}
```

## 6. 同步策略建议

建议 App 采用下面的顺序：

1. 启动后先执行 `pull`
2. 用户新增或编辑交易后写入本地队列
3. 在网络可用时批量执行 `push`
4. `push` 成功后记录服务端返回的 `id`
5. 再执行一次 `pull`，确保本地与服务端最终一致

## 7. 第一版限制

为了不改库结构，这一版同步方案有明确限制：

### 7.1 不支持删除同步广播

当前没有“删除墓碑表”或“同步日志表”，所以某个设备删除交易后，其他设备无法通过增量拉取得知这条记录已经被删掉。

这意味着：

- 当前版本适合单设备主写
- 或者适合“以服务端为主，App 作为补录端”

### 7.2 新交易最好带 `orderId`

如果新交易既没有 `id`，又没有稳定的 `orderId`，服务端无法安全判断它是不是重复上报。

### 7.3 不做复杂冲突合并

当前默认采用“最后一次上行覆盖”的简单策略，不做字段级冲突合并。

## 8. 后续升级方向

如果后面你准备把 App 做成真正的长期同步客户端，建议下一阶段补下面这些能力：

1. `device_sync_log`：记录每次同步开始、结束、失败原因
2. `transaction_tombstone`：支持删除同步
3. `device_heartbeat`：记录设备最后活跃时间
4. `device_refresh_token`：支持长期登录和令牌刷新
5. 冲突策略：例如按 `updatedAt` 或版本号做合并

## 9. 当前结论

这版同步接口适合你当前阶段：

- 不改数据库
- 先把 App 连起来
- 先把“新增 / 修改 / 拉取”跑通

等你后面真的开始做“多设备长期同步”和“删除同步”时，再扩表是最稳妥的方案。
