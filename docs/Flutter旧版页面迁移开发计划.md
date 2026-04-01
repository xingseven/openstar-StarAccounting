# Flutter 旧版页面迁移开发计划

## 1. 这份文档解决什么问题

这份文档用于把当前 `web/src` 旧版 TS 页面，按优先级和可执行步骤迁移到新的 `flutter/lib/`。

这次计划只做两件事：

1. 先盘清楚旧版有哪些页面、哪些已经迁了、哪些还没迁。
2. 再把后续开发拆成可以直接执行的阶段，避免一上来就同时改路由、鉴权、图表、表单和接口。

## 2. 当前工作区现状

以当前工作区代码为准：

- 旧版主页面仍集中在 `web/src/app/(dashboard)/`。
- 登录与注册页仍在 `web/src/app/auth/`。
- 新版 Flutter 工程在 `flutter/`。
- 当前 `flutter/lib/` 已落地的业务模块只有 `features/consumption/`。
- `flutter/lib/main.dart` 已有基础 `go_router` 壳层和桌面/移动导航雏形。
- `flutter/lib/core/api_client.dart` 已支持基础 `dio + token` 注入，但还没有完整鉴权流程、路由守卫和统一错误恢复。

结论：

- 现在不是“把最后几页补完”的阶段，而是“消费页先行，剩余页面按业务分组继续迁”的阶段。
- 后续必须优先补公共底座，否则每迁一页都会重复写网络、表单、加载态、空态和错误态。

## 3. 旧版页面盘点

### 3.1 主导航页面

| 旧版路由 | 旧版文件 | 体量 | 复杂度 | Flutter 现状 | 备注 |
| --- | --- | ---: | --- | --- | --- |
| `/` | `web/src/app/(dashboard)/page.tsx` | 159 行 | 中 | 未迁 | 聚合资产、贷款、预算、储蓄与最近流水 |
| `/assets` | `web/src/app/(dashboard)/assets/page.tsx` | 344 行 | 中 | 未迁 | 资产列表、汇率/显示币种、增删改 |
| `/consumption` | `web/src/app/(dashboard)/consumption/page.tsx` | 237 行 | 中 | 已迁基础版 | 已有 Flutter 页面，但仍需和旧版继续补齐 |
| `/savings` | `web/src/app/(dashboard)/savings/page.tsx` | 221 行 | 中 | 未迁 | 目标卡片、计划、取出、批量操作 |
| `/loans` | `web/src/app/(dashboard)/loans/page.tsx` | 409 行 | 中高 | 未迁 | 贷款 CRUD、还款登记、计划表、历史对账 |
| `/connections` | `web/src/app/(dashboard)/connections/page.tsx` | 577 行 | 高 | 未迁 | OTP 连接码、设备绑定、轮询状态、撤销设备 |
| `/ai` | `web/src/app/(dashboard)/ai/page.tsx` | 730 行 | 高 | 未迁 | AI 模型配置、表单、状态反馈，业务复杂 |
| `/data` | `web/src/app/(dashboard)/data/page.tsx` | 1016 行 | 很高 | 未迁 | 导入、分页表格、批量操作、手动记账、归类规则 |
| `/themes` | `web/src/app/(dashboard)/themes/page.tsx` | 325 行 | 中 | 未迁 | 主题切换与预览 |
| `/settings` | `web/src/app/(dashboard)/settings/page.tsx` | 375 行 | 中 | 未迁 | 系统配置、账户级设置 |
| `/about` | `web/src/app/(dashboard)/about/page.tsx` | 699 行 | 中高 | 未迁 | 说明、版本、更新、下载信息 |
| `/admin` | `web/src/app/(dashboard)/admin/page.tsx` | 188 行 | 中 | 未迁 | 管理端页面 |

### 3.2 次级业务页面

| 旧版路由 | 旧版文件 | 复杂度 | 备注 |
| --- | --- | --- | --- |
| `/budgets` | `web/src/app/(dashboard)/budgets/page.tsx` | 中高 | 预算创建、编辑、删除、预警展示 |
| `/auth/login` | `web/src/app/auth/login/page.tsx` | 中 | 登录表单、token 落地、next 跳转 |
| `/auth/register` | `web/src/app/auth/register/page.tsx` | 中 | 注册表单、token 落地 |

### 3.3 旧版页面迁移优先级判断

优先迁移收益最高的是：

1. `dashboard`
2. `assets`
3. `savings`
4. `loans`

原因：

- 这四页和现在已完成的 `consumption` 共同构成财务主链路。
- 这四页的接口和交互边界相对稳定，适合先沉淀 Flutter 的列表、表单、统计卡、图表与底部面板规范。
- 迁完这四页后，新 Flutter 工作台才算具备基本可用性。

第二批再迁：

1. `data`
2. `connections`
3. `budgets`

原因：

- 这三页是“能力中台”，复杂但复用度高。
- 它们会反向影响前面主业务页的数据完整性与联动能力。

最后迁：

1. `ai`
2. `settings`
3. `themes`
4. `about`
5. `admin`

原因：

- 这些页面更多偏配置、展示或管理。
- 在 Flutter 主业务页还没站稳之前，提前迁它们性价比不高。

## 4. 迁移原则

### 4.1 目录原则

- 新代码只放 `flutter/lib/`。
- 旧版参考代码保留在 `web/src/`，只读不继续扩写。
- 页面迁移期间，不再把新的业务实现写回 `web/src`。

### 4.2 实现原则

- 不做 React 到 Dart 的机械翻译，按 Flutter 组件习惯重组。
- 先跑通真实接口，再补视觉细节。
- 先抽公共组件和状态模式，再落具体业务页。
- 每迁一页都要同时具备 `loading / empty / error / refresh` 四种基础状态。
- 每迁一页都要先保证移动端可用，再补桌面细节。

### 4.3 验收原则

每完成一个阶段，至少通过：

- `flutter analyze`
- `flutter test`（有对应测试时）
- `flutter build web`
- 对应页面的真实接口联调
- Web 预览路径或 Flutter 本地路由可正常打开

## 5. 建议目录落位

建议继续统一为下面这套结构：

```text
flutter/lib/
  core/
    api/
    auth/
    router/
    storage/
    theme/
    utils/
  shared/
    layout/
    widgets/
    forms/
    charts/
    feedback/
  features/
    auth/
    dashboard/
    assets/
    consumption/
    savings/
    loans/
    budgets/
    data/
    connections/
    ai/
    settings/
    themes/
    about/
    admin/
```

## 6. 分阶段开发计划

### 阶段 0：补公共底座

目标：先把后面每个页面都会重复用到的基础能力补齐。

本阶段必须完成：

1. 鉴权闭环
   - 新建 `features/auth/`
   - 落登录页、注册页、token 持久化、退出登录
   - 给 `go_router` 增加登录守卫和未登录跳转
2. Shell 收口
   - 把 `main.dart` 中的临时壳层拆到 `shared/layout/`
   - 统一桌面侧边栏、移动端底部导航、页面标题区
3. 网络层规范
   - 把 `ApiClient` 拆成请求封装、异常映射、分页/列表响应解析
   - 统一 `401`、`403`、网络失败、后端报错文案
4. 通用 UI 基础件
   - 指标卡
   - 空态/错误态
   - 列表容器
   - 通用底部弹层
   - 表单输入与校验反馈
5. 图表与列表基础能力
   - 将消费页里已验证过的图表卡、列表卡抽成共享组件

阶段验收：

- Flutter 可以从登录进入主工作台。
- `consumption` 页面接入新壳层后仍可正常工作。
- 新页面开发不再需要直接在 `main.dart` 写大量页面逻辑。

### 阶段 1：迁主工作台第一组

目标：先把财务主链路做完整。

迁移顺序：

1. `dashboard`
2. `assets`
3. `savings`
4. `loans`

每页重点：

- `dashboard`
  - 复用旧版聚合接口
  - 先还原总资产、总负债、本月收支、预算提醒、最近流水
  - 不追求一次补齐所有装饰性视觉
- `assets`
  - 先做列表、总资产、币种切换、增删改
  - Logo 识别能力可作为第二步补齐
- `savings`
  - 先做目标列表、总储蓄、目标进度
  - 计划打卡、取出、归档、复制作为同阶段补齐
- `loans`
  - 先做贷款列表、剩余金额、基础 CRUD
  - 再补还款登记、还款计划、历史自动对账

阶段验收：

- 主导航核心 5 页：`dashboard / assets / consumption / savings / loans` 全部可在 Flutter 中跑通。
- 旧站只保留对照参考，新站已能承担日常核心使用路径。

### 阶段 2：迁数据中台能力

目标：补齐“导入、预算、连接”这些会影响主业务链路的数据能力。

迁移顺序：

1. `budgets`
2. `connections`
3. `data`

原因说明：

- `budgets` 体量较小，可以先沉淀多状态表单与预警卡片。
- `connections` 要处理倒计时、轮询和设备管理，适合作为状态型页面模板。
- `data` 是全项目最重页面，必须放到公共底座成熟之后再做。

`data` 页拆分建议：

1. 导入区
2. 交易表格与分页
3. 批量操作
4. 手动补录
5. 交易对方规则

不要一次把 `data/page.tsx` 原样搬过去，必须拆模块。

阶段验收：

- 预算预警可以在 Flutter 中查看和维护。
- App/Web 连接码生成与设备授权流程可以在 Flutter 中操作。
- 数据页至少完成“导入 + 列表 + 批量操作”的主链路。

### 阶段 3：迁配置与说明类页面

目标：把剩余非主链路页面收尾。

迁移顺序：

1. `settings`
2. `themes`
3. `ai`
4. `about`
5. `admin`

说明：

- `settings`、`themes` 先迁，是因为它们会影响全局体验与主题切换。
- `ai` 业务复杂但不阻塞基础记账流程，适合放在主链路稳定后。
- `about` 和 `admin` 放最后，避免过早投入到收益较低的页面。

阶段验收：

- 旧版主导航页面在 Flutter 中全部具备对应入口。
- 配置页、说明页和管理页全部完成迁移。

## 7. 每页迁移模板

后续每迁一页，统一按这个顺序执行：

1. 读旧页面入口文件
2. 读该页面依赖的 `features/*` 组件和 `data-loader`
3. 列出接口清单、状态清单、弹层清单、图表清单
4. 先建 `data / presentation / widgets` 结构
5. 先接真实接口和基础状态
6. 再补表单、弹层、图表和动效
7. 最后补路由、联调、分析与构建验证

## 8. 风险点

### 8.1 不要直接复制旧 TS 组件结构

旧站很多页面已经混合了：

- 页面逻辑
- 网络请求
- 表单状态
- 图表数据转换
- UI 壳层

Flutter 必须按 feature 拆开，否则后面维护会更难。

### 8.2 `data` 与 `ai` 两页不要提前并行硬上

这两页体量最大，且依赖较多：

- `data` 依赖导入、表格、批量操作、分类建议、规则系统
- `ai` 依赖模型配置、表单、网络状态、结果反馈

建议等阶段 0 和阶段 1 稳定后再做。

### 8.3 鉴权必须先补

旧站已经有 `localStorage token` 流程，Flutter 虽然已有 token 注入，但没有完整登录守卫。

如果不先补鉴权：

- 后续每个页面都要临时处理未登录状态
- 路由和接口联调会不断返工

## 9. 建议排期

按单人串行开发估算：

| 阶段 | 目标 | 预计周期 |
| --- | --- | --- |
| 阶段 0 | 鉴权、壳层、公共组件、网络层规范 | 2-3 天 |
| 阶段 1 | dashboard / assets / savings / loans | 4-6 天 |
| 阶段 2 | budgets / connections / data | 4-6 天 |
| 阶段 3 | settings / themes / ai / about / admin | 3-5 天 |

如果多人并行：

- 一人负责 `core + shared`
- 一人负责主链路页
- 一人负责中后台能力页

但前提仍然是先完成阶段 0。

## 10. 本次结论

本次旧版盘点后的明确结论如下：

1. 当前 Flutter 不是“全站迁移后期”，而是“消费页先行后的正式扩张阶段”。
2. 下一步最合理的顺序不是先做 `data`，而是先补 `dashboard / assets / savings / loans`。
3. 在正式迁页面前，必须先补鉴权、路由守卫、共享壳层、共享表单与共享反馈组件。
4. `data`、`connections`、`budgets` 应作为第二批；`ai`、`settings`、`themes`、`about`、`admin` 放第三批。

后续就按这份计划推进，不再从单个页面随机开工。
