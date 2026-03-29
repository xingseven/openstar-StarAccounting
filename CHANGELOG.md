# Changelog

## 2026-03-29

### Modified

- **消费图表移动端布局对齐 PC**:
  - 将“支付渠道占比”和“本期收入与支出”两张卡片在移动端也改为图表在左、说明在右的双列布局。
  - 移动端图表尺寸同步收窄到 `84px`，在保留右侧文字可读性的前提下尽量贴近 PC 版阅读方式。
- **消费平台 Logo 外圈边框移除**:
  - 去掉支付宝、微信及默认平台图标外层的 `ring` 描边，保留淡色底托，减少徽标区域的视觉干扰。
- **消费平台 Logo 底托移除**:
  - 进一步去掉支付宝、微信及默认平台图标外层的浅色圆角底托，仅保留 logo 本体与占位尺寸。
- **消费热区矩阵高度压缩**:
  - 压缩“平台 × 分类”热区矩阵的标签列宽、行间距和单元格高度，减少该模块在页面中的纵向占用。
- **消费图表右上角元素清理**:
  - 去掉消费页各图表卡片右上角的图标、统计胶囊和时间胶囊，统一收敛图表标题区。
- **消费热区矩阵与日历圆角收敛**:
  - 收紧“平台 × 分类”和“消费日历”单元格圆角，避免在移动端压缩宽度后出现胶囊和椭圆观感。
- **消费图表列表样式向总览页对齐**:
  - 将消费页“平台分布”和“收支对比”两张图表改成与总览页“近期消费构成”一致的左图右侧圆角信息行布局。
  - 去掉收支对比中的横向进度条，统一为更简洁的数值列表式表达。
- **消费日历 PC 端字体增强**:
  - 提高消费日历在 PC 端的日期和金额字号，增强方块内数值的可读性。

## 2026-03-28

### Modified

- **主题颜色层级增强**:
  - 共享主题原语新增模块色板变量，支持按模块覆盖 Hero、Surface、Metric Card 的浅色叠层与边框强调。
  - 仪表盘、消费、资产、贷款、储蓄分别引入冷蓝、青绿、靛紫、暖铜、翡翠五组模块主色，弱化“整站一张底板”的观感。
  - 同步调整关键主按钮、进度条、徽标和局部高亮，让不同业务模块在首屏就能拉开视觉反差。
- **主题去毛玻璃化收敛**:
  - 默认主题和主题注册表整体切换为更扎实的实色容器，降低半透明背景、模糊叠层和玻璃感表面。
  - 共享 `ThemeHero / ThemeSurface / ThemeMetricCard` 改为优先使用纯色底和清晰边框，模块色仅保留在边框、按钮与强调块。
  - 仪表盘、消费、资产等页移除主要模糊光斑、半透明浮卡和 `backdrop-blur` 筛选浮层，使界面更克制。

## 2.3.15 - 2026-03-25

### Added

- **贷款页新增历史还款扫描能力**:
  - 每笔贷款可主动扫描当前账户下已导入的历史还款交易。
  - 匹配成功后会为旧交易补上 `loanId`，并按已识别的还款记录重算贷款剩余金额与已还期数。

### Modified

- **数据管理页手动录入升级为收入 / 支出双模式**:
  - 新增“录入收入 / 录入支出”按钮切换。
  - 支持云闪付、银行卡、现金等无法导出的消费手动补录。
  - 支出分类补充“还款 / 信用卡还款 / 贷款还款 / 转账支出”等选项。

- **信用借还导入识别增强**:
  - 微信“信用卡还款”交易导入时识别为 `REPAYMENT`。
  - 支付宝“信用借还”中的还款 / 归还 / 放款类记录会识别为 `REPAYMENT / TRANSFER`。
  - 消费页平台映射补充“银行卡 / 现金”，避免手动录入后显示为“其他”。

## 2.3.14 - 2026-03-25

### Added

- **数据管理页新增手动收入补录表单**:
  - 新增“银行卡收入”手动补录区，支持记录工资、奖金、报销等无法从银行卡账单自动导入的收入。
  - 支持填写金额、入账时间、收入分类、入账平台、来源 / 发放方和备注。
  - 保存后会自动刷新数据管理列表，便于快速校对收支平衡。

### Modified

- **交易接口统一切换到当前账户作用域**:
  - `GET /api/transactions`
  - `POST /api/transactions`
  - `PUT /api/transactions/:id`
  - `DELETE /api/transactions/:id`
  - `POST /api/transactions/batch`
  - 上述接口改为统一使用 `requireAccountId`，避免交易数据只按用户维度读写而忽略当前账户。

## 2.3.13 - 2026-03-25

### Modified

- **移动端主题卡片继续减负**:
  - 共享主题壳层、提示、表单区、工具栏在移动端进一步弱化边框和阴影，减少“每层都描边”的臃肿感。
  - 储蓄页与贷款页的业务卡片继续压平内部结构，减少嵌套模块数量，并统一移动端字号层级。
  - 贷款页与储蓄页在移动端改为“核心列表优先、分析模块后置”的阅读顺序，首屏更聚焦。

- **贷款页图表可读性修正**:
  - 将“还款进度”图表图例移动到顶部。
  - 重新调整图表网格留白，避免图例与 X 轴平台名称重叠。

## 2.3.12 - 2026-03-24

### Added

- **新增主题验收样本 `terracotta`**:
  - 在 `web/src/themes/registry.ts` 新增赤陶主题，补齐完整主题变量。
  - 主题中心自动展示新主题，无需修改主题页逻辑，完成“新增主题无需逐页改代码”的验收。

### Modified

- **主题系统收尾并继续下沉共享 UI primitive**:
  - 将 AI、资产、预算、贷款、设置、登录、注册、数据管理、连接等页面的表单、提示与操作区继续收口到 shared primitive。
  - 在 `web/src/components/shared/theme-primitives.tsx` 中补充输入框、下拉、多行输入、白底按钮、图标按钮、列表项和状态壳子等共享常量。
  - 继续清理主题组件中散落的重复样式，使资产、消费、储蓄、贷款等主题页统一依赖共享样式层。

- **全量前端校验链路恢复为通过状态**:
  - 修复 `ClientOnly`、`AuthGate`、`Skeletons`、`dashboard/page.tsx`、`assets/page.tsx`、`savings/page.tsx`、`public/sw.js` 等历史 lint/typecheck 问题。
  - 本次落地后 `npm run lint`、`npm run typecheck`、`npm run build` 均通过。

## 2.3.11 - 2026-03-24

### Modified

- **总览页资金体检改为同款指标卡样式**:
  - 去掉资金体检的大模块容器、标题区和深色分层样式
  - 将负债占比、预算预警、储蓄净流入改为与顶部三张核心卡片一致的指标卡样式
  - 保持该组卡片继续位于“总资产 / 总负债 / 储蓄净流入”下方，整体改成规整的横向卡片排布

## 2.3.10 - 2026-03-24

### Modified

- **总览页资金体检模块调整位置与布局**:
  - 将总览页“资金体检”模块移动到顶部三张核心指标卡片下方
  - 资金体检的三张洞察卡在中等及以上屏幕改为一行三列展示
  - 保持原有数据计算与状态提示逻辑不变，仅调整展示层级与排版节奏

## 2.3.9 - 2026-03-24

### Modified

- **底部弹层表单样式继续统一**:
  - 贷款页面的新增贷款和登记还款底部弹层统一使用主题操作栏
  - 储蓄目标创建流程的底部动作区统一接入主题操作栏
  - 储蓄取款弹层的提示区、表单区和操作区统一接入主题样式
  - 移动端表单动作区视觉与当前主题风格保持一致

## 2.3.8 - 2026-03-24

### Added

- **关于页面新增统一更新中心**:
  - 新增更新检查接口与下载代理接口
  - 新增网站本地更新清单 `web/public/updates/latest.json`
  - 新增 `docs/更新发布与镜像说明.md`
  - 新增 `docs/APP端更新发布准备清单.md`

### Modified

- **关于页面升级为统一更新入口**:
  - 网页端支持“刷新并更新”
  - App 端支持通过后端代理下载安装包
  - 前端不再直接依赖 GitHub，改为网站镜像优先、GitHub 备用

- **移动端导航与头部交互继续优化**:
  - 底部滑动导航进一步缩小尺寸
  - 顶部导航支持下滑隐藏、上滑显示
  - 继续压缩移动端顶部导航栏高度与控件尺寸

## 2.3.7 - 2026-03-23

### Added

- **新增全局主题系统与主题注册中心**:
  - 新增 `web/src/themes/registry.ts`，集中定义主题元信息、主题预览以及全局 CSS 变量映射。
  - 新增 `web/src/components/shared/theme-provider.tsx`，支持主题状态管理、本地持久化与全局变量注入。
  - 新增 `web/src/components/shared/theme-primitives.tsx`，抽象 `ThemeHero`、`ThemeSurface`、`ThemeDarkPanel`、`ThemeSectionHeader`、`ThemeMetricCard` 等共享主题组件。
  - 主题中心页 `web/src/app/(dashboard)/themes/page.tsx` 升级为真正的全局主题切换入口，支持切换后即时作用于整套 dashboard UI。

### Modified

- **Dashboard 区域页面主题统一接入共享框架**:
  - 将总览、资产、消费、储蓄、贷款、设置、连接、数据管理、后台管理、关于、AI 配置页面接入共享主题 primitive，减少逐页硬编码样式。
  - 将 `Header`、`Sidebar`、`Dashboard Layout` 统一改为读取主题变量，确保导航、内容壳层与页面卡片同步切换。
  - 让新增主题时不再需要逐页重写 UI，只需补充主题配置即可完成全局切换。

- **主题系统基础变量接入全局样式层**:
  - 在 `web/src/app/globals.css` 中新增 `theme-*` 系列 CSS 变量默认值。
  - `Providers` 接入 `ThemeProvider`，整个应用在根级别挂载主题上下文。

### Modified Files

1. `web/src/themes/registry.ts` - 主题注册中心与主题预设
2. `web/src/components/shared/theme-provider.tsx` - 主题 Provider 与切换逻辑
3. `web/src/components/shared/theme-primitives.tsx` - 共享主题基础组件
4. `web/src/app/providers.tsx` - 接入全局主题上下文
5. `web/src/app/globals.css` - 增加全局主题 CSS 变量
6. `web/src/app/(dashboard)/themes/page.tsx` - 主题中心页改为全局切换入口
7. `web/src/components/shared/Header.tsx` - 顶部导航接入主题变量
8. `web/src/components/shared/Sidebar.tsx` - 侧边导航接入主题变量
9. `web/src/app/(dashboard)/layout.tsx` - Dashboard 外壳接入主题变量
10. `web/src/features/dashboard/components/themes/DefaultDashboard.tsx` - 总览页接入共享主题组件
11. `web/src/features/assets/components/themes/DefaultAssets.tsx` - 资产页接入共享主题组件
12. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` - 消费页接入共享主题组件
13. `web/src/features/savings/components/themes/DefaultSavings.tsx` - 储蓄页接入共享主题组件
14. `web/src/features/loans/components/themes/DefaultLoans.tsx` - 贷款页接入共享主题组件
15. `web/src/app/(dashboard)/settings/page.tsx` - 设置页主题统一
16. `web/src/app/(dashboard)/data/page.tsx` - 数据管理页主题统一
17. `web/src/app/(dashboard)/admin/page.tsx` - 后台管理页主题统一
18. `web/src/app/(dashboard)/about/page.tsx` - 关于页主题统一与内容重构
19. `web/src/app/(dashboard)/ai/page.tsx` - AI 模型配置页主题统一
20. `web/src/app/(dashboard)/connections/page.tsx` - 连接页沿用共享主题体系

## 2.3.6 - 2026-03-23

### Added

- **新增 APP 交易同步接口与开发文档**:
  - 新增 `GET /api/sync/transactions/pull`，支持 App 按游标增量拉取交易
  - 新增 `POST /api/sync/transactions/push`，支持 App 批量上行交易并按 `orderId` 做第一版幂等
  - 新增 `docs/APP交易同步接口开发文档.md`，整理同步请求、响应、限制与后续扩展方向

- **新增数据库结构核对报告**:
  - 新增 `docs/数据库结构核对报告.md`
  - 记录当前实际数据库与 Prisma 模型的核对结果，确认现阶段不缺表、不缺字段、不缺外键

### Modified

- **连接验证码改为哈希保存**:
  - `appconnection.otpCode` 不再保存明文验证码，改为保存带密钥的 SHA-256 哈希值
  - Web 端生成连接码时只向前端返回一次明文 OTP，数据库内不再落明文
  - App 提交验证码时，服务端对输入值做同样哈希后再校验，提升连接绑定安全性
  - 验证逻辑兼容旧的明文 OTP 记录，避免升级后已有未过期验证码直接失效

### Modified Files

1. `src/server/src/main.ts` - 交易同步接口与连接验证码哈希保存
2. `docs/APP连接功能开发文档.md` - 更新 OTP 存储与校验说明
3. `docs/APP交易同步接口开发文档.md` - APP 同步接口说明
4. `docs/数据库结构核对报告.md` - 数据库结构核对结论

## 2.3.5 - 2026-03-23

### Added

- **新增 APP 连接功能开发文档**:
  - 新增 `docs/APP连接功能开发文档.md`
  - 梳理 Web 端生成连接码、App 端 OTP 验证、设备令牌与后续联调清单
  - 明确 `generate / verify / devices / revoke` 四个连接接口的请求与返回结构

### Modified

- **连接页重构为可联调的设备绑定工作台**:
  - 连接页补齐中文界面、验证码展示、服务器地址、验证路径、倒计时与复制操作
  - 增加 App 对接说明区，直接展示 `POST /api/connect/verify` 的请求体示例
  - 增加连接状态轮询，当前验证码被 App 成功验证后，页面会自动切换为“已完成绑定”
  - 已授权设备列表支持刷新与撤销，撤销后设备令牌立即失效

- **连接后端接口补齐用于 App 开发的返回结构**:
  - `POST /api/connect/generate` 新增返回 `connectionId`、`verifyPath`、`expiresInSeconds`
  - `POST /api/connect/verify` 新增返回 `tokenType`、`verifiedAt`
  - 连接记录改为按 `accountId` 隔离，避免多账户模式下设备串号
  - 设备令牌 `dev-<connectionId>` 接入认证流程，便于 App 后续直接携带令牌访问接口
  - `PUBLIC_IP` 未配置时自动从当前请求推导可展示的服务器地址

### Modified Files

1. `docs/APP连接功能开发文档.md` - APP 连接开发说明
2. `web/src/app/(dashboard)/connections/page.tsx` - 连接页重构
3. `web/src/components/shared/navigation.ts` - 页面标题与导航元信息
4. `web/src/components/shared/Header.tsx` - 顶部页头与用户菜单
5. `web/src/components/shared/MobileSidebar.tsx` - 移动端导航
6. `src/server/src/main.ts` - 连接接口与设备令牌认证

## 2.3.4 - 2026-03-23

### Modified

- **项目名称统一更新为 `openstar-StarAccounting`**:
  - 更新所有配置文件中的项目名称引用（package.json、layout.tsx、manifest.json、docker-compose.yml等）
  - 更新前端 UI 中的项目标题（Sidebar、About页面、设置页面等）
  - 更新文档中的项目名称引用（README.md、开发进度文档、V2高级功能文档等）
  - 更新测试文件中的默认用户名
  - 更新 Docker 容器名称为 `openstar-StarAccounting-*`
  - 更新 PWA manifest 和 Service Worker 缓存名称
  - 更新所有 GitHub 链接引用

### Modified Files

1. `package.json` - 项目名称
2. `web/package.json` - 前端项目名称
3. `src/server/package.json` - 后端项目名称
4. `web/src/app/layout.tsx` - 元数据和标题
5. `web/src/components/shared/Sidebar.tsx` - 侧边栏标题
6. `web/src/components/shared/PWARegister.tsx` - PWA 安装提示
7. `web/public/manifest.json` - PWA manifest
8. `web/public/sw.js` - Service Worker 缓存名称
9. `docker-compose.yml` - Docker 容器名称
10. `README.md` - 项目文档标题
11. `docs/V2高级功能开发文档.md` - 文档标题
12. `docs/数据库配置.md` - 数据库配置
13. `docs/开发进度.md` - 管理员邮箱
14. `web/src/app/(dashboard)/about/page.tsx` - 关于页面标题
15. `web/src/app/(dashboard)/settings/page.tsx` - 设置页面底部
16. `web/public/test-api.html` - 测试页面默认邮箱
17. `web/public/offline.html` - 离线页面标题
18. `web/tests/budget.spec.ts` - 测试文件默认邮箱

## 2.3.3 - 2026-03-22

### Bug Fixes

- **账单导入数据统计修复**:
  - 修复了导入支付宝/微信账单时，因全局唯一订单号（`orderId`）约束导致的静默跳过问题。
  - 修正了重复数据（`duplicateCount`）的计算逻辑：现在能正确统计并展示因数据库约束而被跳过的重复条目数。
  - 提升了导入提示的准确性，解决了导入相同文件时出现“成功 0 条，重复 0 条，无效 0 条”的误导性提示。

## 2.3.2 - 2026-03-21

### Features

- **账单导入优化**:
  - 后端动态识别CSV列名行（前80行扫描）
  - 微信/支付宝分别识别特征列
  - 统一分类：18种标准分类
  - 统一状态：SUCCESS / FAILED / REFUND
  - 微信交易类型自动映射到统一分类

### Modified Files

1. `src/server/src/etl/importCsv.ts` - 改进列名识别算法
2. `src/server/src/etl/mapTransaction.ts` - 添加分类/状态映射

### New Files

1. `docs/账单导入优化.md` - 设计文档

## 2.3.1 - 2026-03-21

### Features

- **数据管理页面**:
  - 新增 `/data` 路由，侧边栏添加"数据管理"入口
  - 支持批量选择、删除、修改交易记录

- **账户管理功能**:
  - 设置页面新增"账户管理"模块（三列布局）
  - 支持创建新账户、查看账户列表、设置默认账户

### API

- `POST /api/accounts` - 创建账户
- `GET /api/accounts` - 获取账户列表
- `PUT /api/accounts/:id/default` - 设置默认账户

### New Files

1. `web/src/app/(dashboard)/data/page.tsx` - 数据管理页面

### Modified Files

1. `web/src/components/shared/Sidebar.tsx` - 添加数据管理入口
2. `web/src/app/(dashboard)/settings/page.tsx` - 添加账户管理模块
3. `src/server/src/main.ts` - 新增账户管理 API

## 2.3.0 - 2026-03-21

### Features

- **多账户权限系统**:
  - 新增 `account` 表 - 账户信息
  - 新增 `account_member` 表 - 成员关系与权限（支持 OWNER/ADMIN/MEMBER 三种角色）
  - 所有业务表新增 `accountId` 字段，实现数据隔离
  - 用户 `defaultAccountId` 字段关联默认账户
  - `canViewOwn`/`canManageOwn`/`canViewAll`/`canManageAll` 细粒度权限控制

### Database Changes

- 新增表：`account`, `account_member`
- 修改表：所有业务表新增 `accountId` 字段
- 新增 `npm run db:create` 一键创建数据表

### New Files

1. `docs/多账户权限系统设计.md` - 设计文档
2. `docs/完整数据库结构.sql` - 数据库结构 SQL
3. `src/server/scripts/create-tables.ts` - 一键建表脚本

### Modified Files

1. `src/server/prisma/schema.prisma` - 新增 account 和 account_member 模型
2. `src/server/src/main.ts` - 新增 `requireAccountId` 函数，导入逻辑使用 accountId
3. `src/server/package.json` - 新增 `db:create` 脚本

## 2.2.6 - 2026-03-20

### Fixes

- **基于 Next.js 最佳实践彻底解决刷新滚动问题**:
  - 移除了前一版本使用 `min-h-screen` 的 hack 写法。
  - 将消费页面的骨架屏组件从 `page.tsx` 内部抽离，创建了符合 Next.js App Router 约定的 `app/(dashboard)/consumption/loading.tsx`。
  - 通过服务端的原生 React Suspense 注入，确保浏览器在收到初始 HTML 的第一帧就拥有完整的骨架屏高度，从而让原生 Scroll Restoration（滚动恢复）完美生效。

### Modified Files

1. `web/src/app/(dashboard)/consumption/page.tsx`
2. `web/src/app/(dashboard)/consumption/loading.tsx` (新增)
3. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`

## 2.2.5 - 2026-03-20

### Fixes

- **彻底解决消费页面刷新滚动位置丢失问题**:
  - 为 `page.tsx`、`SkeletonLoading` 以及 `ConsumptionDefaultTheme` 的最外层容器添加了 `min-h-screen` 样式。
  - 解决了在 `next/dynamic` 异步加载期间 DOM 瞬间高度坍塌，导致浏览器 Scroll Restoration（滚动恢复）机制失效，被强制弹回顶部的问题。

### Modified Files

1. `web/src/app/(dashboard)/consumption/page.tsx`
2. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`

## 2.2.4 - 2026-03-20

### Fixes

- **修复滑动刷新时骨架屏位置丢失问题**:
  - 补全了 `consumption/page.tsx` 中缺失的底层图表骨架屏占位（包括帕累托图、消费日历、热力图、桑基图、散点图等）。
  - 解决了因骨架屏总高度不足导致浏览器刷新时无法正确恢复滚动位置的问题。
  - 现在骨架屏高度与真实页面完全对齐，用户即使在页面底部刷新也能平滑过渡。

### Modified Files

1. `web/src/app/(dashboard)/consumption/page.tsx`

## 2.2.3 - 2026-03-20

### UI/UX Improvements

- **骨架屏视觉体验深度还原**:
  - 彻底重构了图表骨架屏组件，新增 `PieChartSkeleton` 用于饼图区域占位。
  - 原有的 `ChartSkeleton` 改为包含随机高度柱状条的通用矩形图表占位，完美适配条形图、折线图和堆积图区域。
  - 精简了顶部四个核心数据卡片 (`StatsCardSkeleton`) 的内部结构与高度，使其不再显得臃肿，贴近真实卡片的单行紧凑布局。
  - 为顶部 AI 相关功能按钮占位符添加了匹配其真实状态的浅蓝色微光效果。
  - 微调了所有图表区域的 `min-h` 参数，达到像素级占位对齐。

### Modified Files

1. `web/src/app/(dashboard)/consumption/page.tsx`
2. `web/src/components/shared/Skeletons.tsx`

## 2.2.2 - 2026-03-20

### Fixes

- **修复消费页面布局偏移 (Layout Shift)**:
  - 修复了 `consumption/page.tsx` 中骨架屏与真实组件不一致导致的布局跳动问题。
  - 骨架屏新增了顶部标题、AI 智能分析卡片占位以及筛选栏占位。
  - 调整了图表区域骨架屏的网格布局（1, 1, 2 col-spans），与真实页面的瀑布流完全对齐。
  - 修复 `AIAnalysisCard.tsx` 中 `compact` 属性在初始状态失效导致的高度突变 Bug。

### Modified Files

1. `web/src/app/(dashboard)/consumption/page.tsx`
2. `web/src/components/shared/Skeletons.tsx`
3. `web/src/features/consumption/components/AIAnalysisCard.tsx`

## 2.2.1 - 2026-03-20

### UI/UX Improvements

- **前端加载体验统一优化**:
  - 移除了所有页面（首页、消费、资产、贷款、后台管理）在组件懒加载期间的生硬转圈 Loading 图标。
  - 将所有懒加载占位统一替换为与对应页面布局1:1匹配的 **骨架屏 (Skeleton)** 动画。
  - 现在用户刷新页面时，只需看到一次居中的"正在验证登录状态"，随后页面会立刻以骨架屏形式展现基础结构并平滑过渡到真实数据，彻底消除了多次不同 Loading 样式带来的视觉割裂感。

### Modified Files

1. `web/src/app/(dashboard)/page.tsx`
2. `web/src/app/(dashboard)/assets/page.tsx`
3. `web/src/app/(dashboard)/consumption/page.tsx`
4. `web/src/app/(dashboard)/loans/page.tsx`
5. `web/src/app/(dashboard)/admin/page.tsx`

## 2.2.0 - 2026-03-20

### Features

- **AI 智能分析功能上线**:
  - 新增 `POST /api/ai/analyze-consumption` 后端接口
  - AI 分析服务自动分析用户消费数据，生成个性化洞察
  - 消费页面顶部新增 AI 分析卡片，展示：
    - 总支出、日均消费、主要类别等统计
    - 消费总结文本
    - 关键洞察（info/warning/success 类型）
    - 可执行的优化建议（按优先级高/中/低排列）
  - 支持展开/收起详情
  - 支持重新分析

- **AI 分析交互效果优化**:
  - 骨架屏动态加载效果：Stats 数据格、图表区、洞察卡片均有独立骨架动画
  - 分析报告打字机效果：Summary 文字逐字显示，带闪烁光标
  - 洞察和建议逐条弹出：每 300ms 逐条显示一条，带 slide-in 动画
  - Loading 时显示旋转 Loader 图标，实时反馈分析进度

- **消费页面移动端图表优化**:
  - 「每日平均消费 (按周)」图表在移动端支持 X 轴标签 45 度旋转显示
  - PC 端保持正常角度显示，根据 `isMobile` 状态动态切换

### Fixes

- **构建错误全面修复**:
  - 修复 `ConsumptionDefaultTheme.tsx` 中 `<DelayedRender>` 标签未正确闭合导致 JSX 解析失败
  - 修复 `ai/page.tsx` 中 Button 组件使用不存在的 `asChild` prop（base-ui 版本已移除）
  - 修复 `page.tsx` 中 Transaction 类型缺少 `description` 字段导致 TypeScript 报错
  - 修复 `notifications.ts` 中 `actions` 和 `vibrate` 属性不存在于 `NotificationOptions` 的类型错误
  - 修复 `echarts-for-react` v3.x 移除 `ref` prop 导致的所有图表引用报错
  - 安装 `@playwright/test` 依赖解决 Playwright 配置报错

- **AI 分析阶段转换 bug 修复**:
  - 修复打字阶段转换逻辑，Summary 完成后正确进入 insights 和 suggestions 阶段

### Modified Files

**New Files:**
1. `web/src/features/consumption/components/AIAnalysisCard.tsx` (新增 AI 分析卡片组件)
2. `docs/AI账单智能分析功能开发文档.md` (新增开发文档)
3. `src/server/src/services/doubaoAi.ts` (新增 `analyzeConsumption` 函数)

**Modified Files:**
4. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` (集成 AI 分析卡片，优化移动端图表旋转)
5. `web/src/app/(dashboard)/ai/page.tsx` (移除 asChild prop，改用原生锚点样式)
6. `web/src/app/(dashboard)/page.tsx` (修复 Transaction 类型)
7. `web/src/lib/notifications.ts` (移除无效的 Notification 选项)
8. `web/package.json` (新增 @playwright/test 依赖)
9. `src/server/src/main.ts` (新增 `/api/ai/analyze-consumption` 路由)

## 2.1.8 - 2026-03-19

### Features

- **AI 识别平台选择功能上线**:
  - 在消费页 AI 记账功能中新增平台选择下拉框，支持切换三个支付平台：**支付宝**、**微信支付**、**云闪付**。
  - 切换平台后，识别结果表单会动态显示该平台特有的字段。

- **平台特定 AI 识别优化**:
  - **支付宝 (Alipay)**: 提取商户名称、消费日期、账单分类、付款方式、收款方全称、支付时间、备注等字段。
  - **微信支付 (WeChat)**: 提取商户名称、商品描述、支付时间、商户全称等字段。
  - **云闪付 (UnionPay)**: 提取消费名称、卡号（尾号）、交易时间（精确到秒）、交易类别、分类等字段。
  - 为每个平台定制了独立的 AI Prompt 提示词，确保模型能准确识别不同平台账单小票的格式和字段位置。

### Modified Files

1. `src/server/src/services/doubaoAi.ts` (Added platform-specific prompts and new field types)
2. `src/server/src/main.ts` (Updated `/api/ai/scan-receipt` to accept platform parameter)
3. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` (Added platform selector and dynamic form fields)

## 2.1.7 - 2026-03-19

### Features

- **AI 记账时间提取与展示优化**:
  - 优化了前端 AI 拍照记账弹窗的时间展示逻辑，移除了单独的「支付时间」输入框，避免时间字段重复。
  - 将原本顶部的「日期」字段升级为「支付时间」，并支持显示精确到秒的完整时间格式 (`YYYY-MM-DDThh:mm:ss`)。
  - 智能合并 AI 提取结果：当 AI 成功提取到完整的支付时间时，会自动格式化并填充到主时间输入框中；在最终保存时，会自动截取所需的日期部分 (`YYYY-MM-DD`) 提交给后端。

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` (Refactored date/time inputs and state merging logic)

## 2.1.6 - 2026-03-19

### Features

- **AI 记账功能数据维度扩充**:
  - 增强了豆包视觉模型的 Prompt 提示词，使其能从账单截图中提取更多详细信息。
  - 新增支持提取：**账单分类** (如: 爱车养车)、**付款方式** (如: 储蓄卡/零钱)、**支付时间** (精确到秒)、**收款方全称** (如: **秋(个人)) 以及 **备注** 信息。
  - 优化了前端 AI 拍照记账弹窗的表单，支持展示和编辑这些新增字段。
  - 在保存交易时，自动将这些额外信息拼接到交易描述 (Description) 中，确保信息不丢失。

### Modified Files

1. `src/server/src/services/doubaoAi.ts` (Updated prompt and return types for more fields)
2. `src/server/src/main.ts` (Updated API response to include new fields)
3. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` (Added new fields to form and logic)

## 2.1.5 - 2026-03-19

### Fixes

- **AI 模型配置表单提示二次优化**:
  - 根据火山引擎最新的「快捷接入预置推理服务」规范，修改了前端的模型 ID 填写提示。
  - 明确告知用户：不需要强制使用 `ep-` 开头，而是直接复制控制台代码示例中自动生成的模型 ID（如 `doubao-seed-2-0-mini-260215` 或 `ep-xxx`）。
  - 避免用户误将下拉框的中文或大写显示名称（如 `Doubao-Seed-2.0-mini`）直接填入。

### Modified Files

1. `web/src/app/(dashboard)/ai/page.tsx` (Updated Volcengine model ID hint)

## 2.1.4 - 2026-03-19

### Fixes

- **AI 模型配置表单提示优化**:
  - 针对使用火山引擎（豆包）模型时，测试连接报错 `NotFoundError: 404 The model or endpoint ... does not exist` 的问题。
  - 在大模型配置页面的「模型 ID」输入框下方新增了针对火山引擎的动态提示信息。
  - 明确告知用户：当提供商为火山引擎或 API 端点包含 volces 时，必须填写以 `ep-` 开头的「接入点 ID」，而不能直接填写模型名称。
  - 优化了模型 ID 输入框的 placeholder。

### Modified Files

1. `web/src/app/(dashboard)/ai/page.tsx` (Added endpoint ID hint for Volcengine)

## 2.1.3 - 2026-03-19

### Fixes

- **API 端口配置修复**:
  - 前端 API 请求端口从错误的 3006 修正为正确的 3004
  - 创建 `web/.env.local` 文件持久化配置
  - 解决了 AI 记账功能无法调用后端 API 的问题

### Features

- **设为默认模型功能**:
  - 大模型管理页面支持"设为默认"选项
  - 默认模型在卡片上显示蓝色"默认"标签
  - AI 记账时优先使用默认模型
  - 设为默认后会取消其他模型的默认状态

- **AI 识别交互优化**:
  - 上传图片后不再自动识别，改为显示"开始识别"按钮
  - 用户主动点击识别按钮后才触发 AI 识别
  - 识别过程中显示 loading 状态
  - 识别完成后显示结果供用户确认或修改

- **AI 识别错误提示优化**:
  - 改进消费页面 AI 识别的错误处理
  - 未配置 API Key 时提示用户前往大模型页面配置
  - 未登录时提示用户先登录
  - 提供更友好的错误文案，而非笼统的"识别失败"

### Modified Files

1. `web/.env.local` (New file - API port configuration)
2. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` (Added manual scan button, better error handling)
3. `web/src/app/(dashboard)/ai/page.tsx` (Added set default model feature)

## 2.1.2 - 2026-03-18

### Fixes

- **顶部导航栏用户信息显示修复**:
  - 修复了 `Header` 组件在无数据库或请求延迟时一直显示静态 "User" 和 "加载中..." 的问题。
  - 增加了对用户获取状态的 Loading 提示，以及失败时的"未登录"兜底显示。
  - 修复了被错误注释掉的 `AuthGate` 组件，重新启用了鉴权失败时自动重定向登录页的逻辑。
  - 后端 `/api/auth/me`、`/api/auth/login` 和 `/api/auth/register` 接口现已全面支持在无数据库配置环境下的降级内存模式，提升了离线单机体验的健壮性。

- **登录页面自动填充与状态清空修复**:
  - 修复了浏览器（或密码管理器）自动填充账号密码时，未触发 React `onChange` 事件导致提交空数据（提示账号或密码错误）的问题，现改为通过 `FormData` 直接获取 DOM 实际值。
  - 将受控输入框（`value`）修改为非受控组件（`defaultValue`），解决了登录失败后状态被意外重置导致输入框被清空的问题，让用户可以继续修改而无需重新输入。

### Modified Files

1. `web/src/components/shared/Header.tsx` (Fixed user display logic)
2. `web/src/components/shared/AuthGate.tsx` (Restored auth routing)
3. `src/server/src/main.ts` (Added memory mode support for auth APIs)
4. `web/src/app/auth/login/page.tsx` (Fixed form autofill & state clear issues)

## 2.1.1 - 2026-03-18

### Features

- **大模型管理页面上线**:
  - 新增侧边栏"大模型"菜单入口
  - 创建 `web/src/app/(dashboard)/ai/page.tsx` 页面
  - 支持添加、编辑、删除自定义大模型配置
  - 支持配置 API Key、提供商、端点、模型 ID
  - 已配置/未配置模型分组展示，状态一目了然

- **AI 拍照记账功能上线**:
  - 消费分析页面新增"AI 记账"按钮（渐变色设计）
  - 点击弹出 BottomSheet，可上传小票/账单照片
  - 调用 AI 视觉模型自动识别金额、商户、日期、分类
  - 用户可微调识别结果后一键确认记账
  - 记账成功后自动创建交易记录

- **统一页面背景装饰**:
  - 简化 `GridDecoration` 组件，只保留底部一根曲线
  - 将背景装饰移至 dashboard layout 层
  - 所有页面统一展示固定底部的线条背景
  - 使用 `fixed` 定位，滚动时背景保持静止

### Modified Files

1. `web/src/components/shared/Sidebar.tsx` (Added AI menu)
2. `web/src/app/(dashboard)/ai/page.tsx` (New)
3. `web/src/app/(dashboard)/layout.tsx` (Added GridDecoration)
4. `web/src/components/shared/GridDecoration.tsx` (Simplified to single line)
5. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` (Added AI scan)
6. `src/server/src/main.ts` (Added `/api/ai/scan-receipt`)

## 2.1.0 - 2026-03-18

### Features

- **AI 智能视觉记账后端基础设施上线**:
  - **AI 引擎接入**: 集成 `openai` SDK，成功对接字节跳动火山引擎（Volcengine）的 **Doubao-vision-pro** 视觉大模型。
  - **服务封装**: 创建了 `doubaoAi.ts` 服务模块，封装了图片 Base64 转换、Prompt 构造、JSON 严格解析与错误回退机制。
  - **API 接口**: 新增 `POST /api/ai/scan-receipt` 接口，支持图片流上传，并返回结构化消费数据（金额/商户/日期/分类/描述）。
  - **隐私保护**: 采用内存流式处理 (`multer.memoryStorage`)，图片数据即用即焚，不在服务器磁盘留存。

### Fixes

- **版本日志接口修复**:
  - 修复了后端 `/api/changelog` 读取 `CHANGELOG.md` 时的路径计算错误（`path.join` 层级修正）。
  - 优化了 Markdown 解析正则表达式，增强了对多段式版本号（如 `1.8.36`）和加粗文本的兼容性，确保前端“关于”页面能正确展示所有历史记录。

### Modified Files

1. `src/server/package.json` (Added `openai`)
2. `src/server/src/services/doubaoAi.ts` (New)
3. `src/server/src/main.ts` (Added `/api/ai/scan-receipt` & Fixed `/api/changelog`)
4. `docs/AI智能记账开发文档.md` (New)

## 2.0.6 - 2026-03-18

### Features & Refactoring

- **Dashboard 架构重构与视觉风格升级**:
  - **移除网格背景**: 废弃了原本规整的网格线条 (`repeating-linear-gradient`)。
  - **极简线条装饰**: 重构了 `GridDecoration` 组件，改为使用 `SVG` 绘制的 3-4 条具有抽象感、交叉感的不规则细线背景。这种风格更加现代、轻盈，且具备呼吸感。
  - **货币格式化工具**: 封装了通用的 `formatCurrency` 函数。
  - **收支趋势对比**: 在首页统计卡片中引入了微型趋势指示器。
  - **消费占比环形图**: 新增消费分类占比图表。
  - **预算预警交互**: 增加了“暂时忽略”按钮。

### Modified Files

1. `web/src/components/shared/GridDecoration.tsx`
2. `web/src/lib/utils.ts`
3. `web/src/features/dashboard/components/themes/DefaultDashboard.tsx`

## 2.0.5 - 2026-03-18

### Fixes

- **精准匹配骨架屏高度以消除最终的轻微跳变**:
  - 发现储蓄页面存取记录的真实组件头部边距（`p-6`）和内容边距与通用的 `CardListSkeleton` 存在几像素的误差，这几像素的差异在数据渲染瞬间仍会引发轻微的高度拉伸。
  - 精确调整了 `Skeletons.tsx` 中 `CardListSkeleton` 的 `padding` 参数和 `div` 结构，并同步对齐了真实卡片的 `CardHeader` 边距（改为 `p-6 pb-4`）。
  - 使得骨架屏状态和真实数据状态在 DOM 盒子模型上达到 1:1 像素级匹配，真正实现了无感过渡。

### Modified Files

1. `web/src/components/shared/Skeletons.tsx`
   - 更新了 `CardListSkeleton` 的内部 `padding` 和 `margin`。
2. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 对齐了存取记录 `CardHeader` 的内边距。

## 2.0.4 - 2026-03-18

### Fixes

- **修复储蓄页面存取记录模块高度跳变**:
  - 发现底部“存取记录”模块丢失了 `DelayedRender` 的包裹，导致在数据加载完成瞬间直接渲染真实数据卡片，引起局部高度的突然改变和滚动条的瞬间闪现。
  - 重新为该模块添加了 `<DelayedRender delay={200} fallback={<CardListSkeleton count={2} />}>`，确保加载期间有正确高度的骨架屏占位，加载完成后平滑过渡，不再引起任何高度突变。

### Modified Files

1. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 恢复了存取记录 `Card` 组件外层的 `DelayedRender` 包装。

## 2.0.3 - 2026-03-18

### Fixes

- **终极修复储蓄页面布局抖动与滚动条闪现**:
  - 针对页面刷新时因异步数据加载导致内容高度变化，从而引发滚动条突然出现（导致页面整体水平偏移和视觉闪烁）的问题，为 `DefaultSavings.tsx` 的根容器重新添加了 `min-h-[101vh]`。
  - 该改动强制页面始终保留垂直滚动条轨道，确保了从骨架屏切换到真实数据时页面布局的绝对稳定，配合之前的渐入动画，实现了完美的加载体验。

### Modified Files

1. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 为根容器 `div` 添加了 `min-h-[101vh]` 类。

## 2.0.2 - 2026-03-18

### Fixes & Improvements

- **修复储蓄页面加载时的视觉闪烁问题并统一架构**:
  - 移除了 `DefaultSavings.tsx` 中的冗余自定义骨架屏组件，全面引入了 `Skeletons.tsx` 中标准的 `ChartSkeleton`、`ListTableSkeleton` 和 `CardListSkeleton`。
  - 为存取记录的骨架屏（`CardListSkeleton`）指定了匹配真实数据的项数和高度，消除了由此导致的滚动条闪烁和页面跳动。
  - 学习了消费页面的加载架构，为储蓄页面的图表和表格统一引入了 `DelayedRender` 组件，并配置了阶梯式的延迟加载时间（50ms, 100ms, 150ms），实现了平滑的渐次入场动画效果。

### Modified Files

1. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 移除了 `StatsCardSkeleton`、`DistributionChartSkeleton`、`GoalsTableSkeleton`、`TransactionsSkeleton`。
   - 引入并使用了 `@/components/shared/Skeletons` 中的通用组件。
   - 在主网格布局中为图表和表格添加了 `DelayedRender` 组件包裹。
   - 更新了存取记录的 `fallback` 为 `<CardListSkeleton count={2} />`。

## 2.0.1 - 2026-03-18

### Fixes

- **修复全局滚动条白边问题**:
  - 移除了 `globals.css` 中 `html` 元素的 `scrollbar-gutter: stable` 全局样式。
  - 保留了 `.scrollbar-stable` 类的定义，仅在需要防止布局抖动的特定滚动容器（如 `<main>`）上局部应用，从而消除了浏览器窗口最右侧不必要的空白滚动条占位。

### Modified Files

1. `web/src/app/globals.css`
   - 移除了 `html` 选择器中的 `scrollbar-gutter` 样式。

## 2.0.0 - 2026-03-17

### Features

- **预算系统与预警增强**:
  - Budget 模型新增 `scopeType` 字段，支持三种预算作用域：
    - `GLOBAL`: 全局预算（默认）
    - `CATEGORY`: 分类预算
    - `PLATFORM`: 平台预算
  - Budget 模型新增 `platform` 字段，支持按平台设置预算
  - Budget 模型新增 `alertPercent` 字段（默认 80%），支持自定义预警阈值
  - 新增 `BudgetScope` 枚举类型
  - 更新唯一约束为 `[userId, category, period, scopeType, platform]`

- **后端接口增强**:
  - 扩展 `/api/budgets` 接口，返回预算健康状态（normal/warning/overdue）
  - 新增 `/api/budgets/alerts` 接口，获取所有预警/超支的预算列表
  - 更新 `budget.ts` 逻辑层，新增 `calculateBudgetHealth` 函数

- **前端预算管理页重构**:
  - 支持选择预算作用域（全局/分类/平台）
  - 预算进度条根据健康状态变色：
    - < 80%: 绿色（正常）
    - 80% - 100%: 黄色（预警）
    - > 100%: 红色（超支）
  - 预算卡片显示状态标签（正常/预警/超支）
  - 支持自定义预警阈值设置
  - 新增常用分类和平台选择列表

- **Dashboard 首页预算预警**:
  - 新增预算预警提示卡片，显示所有预警/超支的预算
  - 预警卡片支持跳转到预算管理页
  - 快捷入口新增"预算管理"入口

### Modified Files

1. `src/server/prisma/schema.prisma`
   - Budget 模型新增 `scopeType`, `platform`, `alertPercent` 字段
   - 新增 `BudgetScope` 枚举
   - 更新唯一约束

2. `src/server/src/logic/budget.ts`
   - 新增 `BudgetStatus` 类型
   - 新增 `BudgetHealthResult` 类型
   - 新增 `calculateBudgetHealth` 函数
   - 更新 `calculateBudgetUsage` 支持 scopeType

3. `src/server/src/main.ts`
   - 更新 GET `/api/budgets` 返回健康状态
   - 更新 POST `/api/budgets` 支持新字段
   - 更新 PUT `/api/budgets/:id` 支持修改 alertPercent
   - 新增 GET `/api/budgets/alerts` 接口

4. `web/src/app/(dashboard)/budgets/page.tsx`
   - 完全重构预算管理页
   - 新增作用域选择
   - 新增预警阈值设置
   - 状态标签和颜色变化

5. `web/src/app/(dashboard)/page.tsx`
   - 新增 `BudgetAlert` 类型
   - 加载预算预警数据
   - 传递给 Dashboard 组件

6. `web/src/features/dashboard/components/themes/DefaultDashboard.tsx`
   - 新增预算预警卡片组件
   - 快捷入口新增预算管理

## 1.8.36 - 2026-03-17

### Fixes
- **修复储蓄页面布局抖动**:
  - 为 `DefaultSavings.tsx` 页面添加了 `min-h-[101vh]` 最小高度限制。
  - 强制页面始终显示垂直滚动条，解决了因异步内容加载（Skeleton -> 真实内容）导致滚动条突然出现而引发的页面水平偏移和布局跳动问题。

### Modified Files
1. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 添加 `min-h-[101vh]` 类到根容器。

## 1.8.35 - 2026-03-17

### UI/UX Improvements
- **设置页面布局优化**:
  - 将设置页面模块从靠左显示改为居中显示
  - 容器最大宽度限制为 2xl (约 672px)，避免过宽影响阅读
  - 标题和模块标题统一居中对齐
- **连接页面布局优化**:
  - 将连接页面模块从全屏宽度改为居中显示
  - 容器最大宽度限制为 2xl (约 672px)
  - 标题居中显示

### Modified Files
1. `web/src/app/(dashboard)/settings/page.tsx`
   - 添加 `mx-auto` 类使容器居中
   - 为标题和模块添加 `text-center` 类
2. `web/src/app/(dashboard)/connections/page.tsx`
   - 添加 `max-w-2xl mx-auto` 类限制宽度并居中
   - 为标题添加 `text-center` 类

## 1.8.34 - 2026-03-17

### Performance Improvements
- **修复滚动吸顶导致的严重卡顿**:
  - 发现使用 `isStickyVisible` 状态实现吸顶效果时，再次犯了"状态提升"的性能陷阱：由于状态定义在庞大的父组件 `ConsumptionDefaultTheme` 中，每次滚动切换吸顶状态时，都会导致页面上所有复杂的 ECharts 图表和数据列表被强制重新渲染，引发严重的掉帧和卡顿。
  - 进行了深度重构：将吸顶筛选栏及其滚动监听状态（`isStickyVisible`）完全抽离为一个独立的纯净子组件 `FixedStickyHeader`。
  - 优化后，滚动状态的改变被严格限制在 `FixedStickyHeader` 内部，只有该导航栏会执行轻量级的 CSS 类名切换，父组件和图表彻底免疫滚动更新，实现了绝对丝滑的滚动体验。

### Modified Files
1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 提取 `FixedStickyHeader` 组件。
   - 移除 `ConsumptionDefaultTheme` 中的滚动监听和 `isStickyVisible` 状态。

## 1.8.33 - 2026-03-17

### Fixes & Improvements
- **彻底解决吸顶失效问题**:
  - 发现原有的 `sticky` 方案由于受到更高层级祖先元素的 `overflow` 或布局限制，在某些情况下无法正常工作。
  - 重构了吸顶逻辑：采用监听滚动状态配合 `fixed` 定位的方案。
  - 新增了一个独立于正常文档流的 `Fixed` 导航栏，当页面向下滚动超过 150px 时，该导航栏会平滑地从顶部滑出，彻底摆脱了父容器布局的限制。
  - 吸顶导航栏增加了 "消费分析" 标题，使其在滚动后依然保持良好的上下文提示。

### Modified Files
1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 增加 `isStickyVisible` 状态和滚动监听逻辑。
   - 使用 `fixed` 元素实现自定义吸顶效果。

## 1.8.32 - 2026-03-17

### UI/UX Improvements
- **顶部筛选栏样式升级**:
  - 修复了因为父容器存在 `relative` 属性可能导致的 `sticky` 布局失效问题。
  - 优化了筛选栏吸顶时的视觉效果，移除了粗糙的底边框，增加了柔和的阴影 (`shadow-sm`)。
  - 增加了内边距 (`py-3 px-4`) 和圆角 (`rounded-xl`)，使其在吸顶时看起来像一个悬浮的独立控制面板。
  - 搜索框、下拉菜单的背景色调整为淡灰色 (`bg-gray-50/50`)，并添加了 `hover` 和 `focus` 状态下的过渡动画，提升交互质感。

### Modified Files
1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 移除外层容器的 `relative` 类。
   - 更新 `sticky` 容器及其子组件的 Tailwind 类名。

## 1.8.31 - 2026-03-17

### UI/UX Improvements
- **消费页筛选交互重构**:
  - 移除了右下角的悬浮筛选按钮（`FloatingFilterButton`）。
  - 将页面顶部的搜索框、平台筛选和时间筛选模块改为**吸顶 (Sticky) 效果**。
  - 在向下滚动页面时，筛选模块会固定在页面顶部并带有毛玻璃 (Backdrop Blur) 背景，方便用户随时进行数据筛选，交互更加直观自然。

### Modified Files
1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 删除 `FloatingFilterButton` 组件及其相关逻辑。
   - 为顶部的筛选容器添加 `sticky top-0 z-40 bg-gray-50/95 backdrop-blur` 等样式类。

## 1.8.30 - 2026-03-17

### Performance Improvements
- **悬浮筛选按钮彻底解决卡顿**:
  - 发现悬浮按钮之前的卡顿是由于 `showFloatingFilter` 状态的改变触发了整个 `ConsumptionDefaultTheme` 组件（包含所有图表）的重渲染。
  - 将悬浮按钮及其状态（`showFloatingFilter`, `filterOpen`）和滚动监听逻辑抽离成了独立的子组件 `FloatingFilterButton`。
  - 现在滚动页面时，状态更新只会在 `FloatingFilterButton` 组件内部发生，不会再引起复杂图表组件的无效重渲染，彻底解决了滚动卡顿问题。

### Modified Files
1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 新增 `FloatingFilterButton` 组件。
   - 移除 `ConsumptionDefaultTheme` 中的滚动监听和悬浮按钮相关状态。

## 1.8.29 - 2026-03-17

### Performance Improvements
- **悬浮筛选按钮渲染优化**:
  - 修复了向下滚动时悬浮筛选按钮出现导致页面卡顿的问题。
  - 为滚动事件监听器添加了 `{ passive: true }` 选项，提升滚动性能。
  - 优化了悬浮按钮的动画逻辑，使用 `willChange: 'transform, opacity'` 提示浏览器进行硬件加速 (GPU 渲染)。
  - 缩短了悬浮按钮的垂直移动距离（从 `translate-y-20` 优化为 `translate-y-10`），减少重绘负担。
  - 使用 `PopoverTrigger asChild` 替换了手动 onClick 绑定，使组件层级更符合 Shadcn/UI 规范，避免多余的事件处理开销。

### Modified Files
1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 优化 `handleScroll`，添加 `passive: true`。
   - 优化浮动按钮的 `className` 和 `style`。

## 1.8.28 - 2026-03-17

### Fixes
- **消费页图表主题色修复**:
  - 修复了将 Recharts 替换为 ECharts 后导致的图表主题色丢失问题。
  - 将所有图表的颜色统一为日历图的蓝色色阶（`#1d4ed8`, `#3b82f6`, `#60a5fa`, `#93c5fd`, `#dbeafe`）。
  - 更新了 `mockData.ts` 中的硬编码 CSS 变量为对应的 Hex 颜色值。

### Modified Files
1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 更新堆叠柱状图、散点图等图表的硬编码颜色。
2. `web/src/features/consumption/mockData.ts`
   - 将 `var(--color-chart-X)` 替换为蓝色色阶。

## 1.8.27 - 2026-03-17

### Features
- **消费页图表引擎全面升级**:
  - 将消费页面 (`ConsumptionDefaultTheme.tsx`) 中的所有 Recharts 图表（Pie, Bar, Line, Scatter, Composed）全部替换为 ECharts (Canvas 渲染)。
  - 解决了由于 Recharts (SVG) 节点过多导致的页面滚动严重卡顿问题，实现了丝滑的滚动体验。
  - 为所有 ECharts 图表实现了统一的防抖 (200ms) resize 监听，禁用了默认的 `autoResize`，进一步优化了窗口拖拽时的性能。
  - 优化了滚动事件监听器，使用 `requestAnimationFrame` 进行节流处理，减少主线程占用。

### Modified Files
1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 移除 Recharts 相关依赖。
   - 使用 `ReactECharts` 替换所有图表组件。
   - 实现了统一的 `chartsRef` 管理和 resize 逻辑。
   - 优化 `handleScroll` 为 RAF 节流模式。

## 1.8.26 - 2026-03-17

### Features
- **消费页面性能优化**:
  - 修复了拖拽调整窗口大小时页面严重卡顿的问题。
  - 为所有 Recharts 图表容器 (`ChartContainer`) 添加了默认的防抖 (debounce) 处理 (200ms)，避免频繁重绘。
  - 为 ECharts 图表添加了手动防抖 resize 监听，并禁用了自动 resize，显著降低了 resize 时的计算负载。
  - 优化了移动端检测 (`isMobile`) 的 resize 监听器，添加了防抖处理。

### Modified Files
1. `web/src/components/ui/chart.tsx`
   - `ChartContainer` 新增 `debounce` 属性，默认值为 200ms。
   - 将 `debounce` 属性传递给 `RechartsPrimitive.ResponsiveContainer`。
2. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 优化 `checkMobile` 函数，添加 resize 防抖。
   - 优化 ECharts 桑基图，禁用 `autoResize`，使用自定义的防抖 resize 逻辑。

## 1.8.25 - 2026-03-17

### Features
- **新增关于页面**:
  - 侧边栏新增"关于"入口
  - 项目介绍模块：展示项目名称、版本、技术栈和主要功能
  - 版本更新记录模块：可展开/收起的版本历史列表，支持全部展开/收起
  - 更新版本模块：显示当前版本信息，提供 GitHub Releases 下载链接
  - 贡献者模块：展示核心开发团队和社区贡献者
  - 网站模块：提供 GitHub 仓库、问题反馈、功能建议等链接

### Modified Files
1. `web/src/app/(dashboard)/about/page.tsx` (新建)
   - 创建关于页面组件
   - 实现五个功能模块
2. `web/src/components/shared/Sidebar.tsx`
   - 添加 Info 图标导入
   - 在导航菜单中添加"关于"入口

## 1.8.24 - 2026-03-14

### Features
- **桑基图升级为 ECharts**:
  - 从 Recharts 替换为 ECharts 桑基图组件
  - 支持 4 级分支数据流展示
  - 添加第 4 级节点：餐饮（星巴克、麦当劳、瑞幸咖啡、美团外卖）、购物（京东商城、淘宝、拼多多）、交通（滴滴出行、地铁、公交）、娱乐（爱奇艺、腾讯视频）、生活（话费充值、水电费）
  - 节点颜色统一为绿色系 + 深蓝色，简洁美观
  - 连接线使用渐变色，交互更流畅
- **消费页布局优化**:
  - 桑基图容器高度调整（300px → 500px）
  - 移动端桑基图支持横向滚动查看
- **修复 hydration 警告问题**:
  - 在 layout.tsx 添加 suppressHydrationWarning 属性
- **桑基图布局修复**:
  - 将 ECharts 桑基图 `layout` 从 `none` 调整为 `sankey`，恢复自动布局算法
  - 修复图形仅占顶部区域的问题，使节点与连线按容器高度正常分布
  - 修复 `DelayedRender` 过渡层未设置 `h-full w-full` 导致子图表 `height: 100%` 失效
- **储蓄弹窗交互修复**:
  - 修复移动端"确认关闭"在取消后再次反复弹出的问题
  - 修复 BottomSheet 底部滑出/收回动画不连贯（闪烁）的问题，统一动画曲线与执行方式
  - 为关闭确认流程增加一次性放行标记，避免 `onOpenChange(false)` 二次触发时重复进入未保存确认
  - 增加关闭确认状态锁与取消后一次性忽略机制，消除事件连发导致的再次弹窗
- **页面切换性能优化**:
  - 对总览、资产、消费、储蓄、贷款页面的核心图表视图（如 `ConsumptionDefaultTheme`）应用了 `next/dynamic` 异步加载 (ssr: false)。
  - 彻底解决了通过侧边栏切换页面时（尤其是切换到消费页面时）由于同步加载大量图表组件（ECharts/Recharts）导致的主线程阻塞和页面卡顿问题。
  - 实现了页面切换的瞬间响应，提升了全站导航的流畅度。

### Modified Files
1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 桑基图替换为 ECharts 实现
   - 浮窗筛选按钮修复按钮嵌套问题
2. `web/src/features/consumption/mockData.ts`
   - 桑基图数据扩展为 4 级分支
3. `web/src/app/layout.tsx`
   - 添加 suppressHydrationWarning 属性

### Dependencies
- 新增：echarts
- 新增：echarts-for-react

## 1.8.23 - 2026-03-14

### Features
- **消费页移动端图表优化**:
  - 支出趋势图表：移动端可见区域显示 8 个数据点，支持横向滑动查看完整数据
  - 消费分类堆积图表：移动端可见区域显示 6 根柱子，支持横向滑动查看完整数据
  - 桑基图：PC 端占满容器宽度，移动端支持横向滚动，右边距调整 (80 → 120)

### Modified Files
1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 支出趋势图表宽度调整 (w-[2000px] → w-[1200px])
   - 消费分类堆积图表宽度调整 (w-[1500px] → w-[750px])
   - 桑基图 PC 端宽度修复和右边距调整

## 1.8.22 - 2026-03-14

### Features
- **消费页移动端优化**:
  - 调整支付平台分布和收支分析图表尺寸 (160px → 100px)
  - 优化图表内部间距，减少 padding 和 margin
  - 圆环图线宽响应式调整 (PC: 4px, 移动端：12px)
  - 图表居中对齐优化
- **图表横向滚动支持**:
  - 支出趋势图表支持横向滑动，移动端固定 500px 宽度
  - 消费分类堆积图表支持横向滑动，最多显示 10 根柱子
  - PC 端自动占满容器宽度，移动端保留滚动功能
- **图表布局优化**:
  - 帕累托分析图表减少左右边距，柱子宽度增加 (30 → 60)
  - 热门商家图表移除右侧边距，条形图紧贴边缘
  - 桑基图右边距优化 (150 → 80)
- **每日平均消费图表增强**:
  - 新增周数选择按钮 (第 1 周 - 第 5 周)
  - X 轴显示周几和具体日期 (如：周一 3 月 2 日)
  - 根据真实日历计算日期，支持显示上个月/下个月日期
  - 第一周从 3 月 1 号 (周日) 开始，周一到六显示 2 月日期

### Modified Files
1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 移动端图表尺寸和间距优化
   - 响应式圆环图线宽
   - 图表横向滚动功能
   - 周数选择和日期显示
   - 日历计算逻辑

## 1.8.21 - 2026-03-14

### Bug Fixes
- **数据库 transaction 表结构修复**:
  - 修复 `createdAt` 和 `updatedAt` 字段缺少默认值的问题
  - 添加 `DEFAULT CURRENT_TIMESTAMP(3)` 默认值
  - 添加 `ON UPDATE CURRENT_TIMESTAMP(3)` 自动更新
  - 解决后端创建交易时报错 "Field doesn't have a default value"

### 问题根源
1. 后端缺少 POST `/api/transactions` 接口（已在 v1.8.20 修复）
2. 数据库 `transaction` 表的 `createdAt` 和 `updatedAt` 字段没有默认值
3. 导致 Prisma 创建交易记录时失败

### Modified Files
1. 数据库修复
   - `ALTER TABLE transaction MODIFY COLUMN updatedAt datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`
   - `ALTER TABLE transaction MODIFY COLUMN createdAt datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)`

## 1.8.20 - 2026-03-14

### Features
- **后端交易创建接口**:
  - 新增 POST `/api/transactions` 接口
  - 支持创建单条交易记录（取款、打卡等）
  - 必填字段：amount, type, category, platform, date
  - 可选字段：merchant, description
  - 自动关联当前登录用户的 userId

### Bug Fixes
- **取款和打卡记录不显示问题**:
  - 之前只有导入接口，没有单条创建接口
  - 导致取款和打卡时创建交易失败
  - 现在可以正常创建并显示交易记录

### Modified Files
1. `src/server/src/main.ts`
   - 添加 POST /api/transactions 路由
   - 实现单条交易创建逻辑
   - 验证必填字段
   - 自动注入 userId

## 1.8.19 - 2026-03-14

### Features
- **存取记录列表显示优化**:
  - 打卡存款时自动创建交易记录（类别：储蓄存款）
  - 优化存取记录过滤逻辑，同时检查 category 和 description 字段
  - 确保打卡和取款记录都能在存取记录列表中显示
  - 支持关键词：储蓄、存款、理财、基金、股票、定投等

### Modified Files
1. `web/src/features/savings/components/SavingsPlanDialog.tsx`
   - 在 `handleUpdatePlan` 函数中添加交易创建逻辑
   - 当打卡状态变为 COMPLETED 时创建 INCOME 类型交易
   - 交易描述包含月份信息

2. `web/src/app/(dashboard)/savings/page.tsx`
   - 优化过滤逻辑，同时检查 category 和 description
   - 扩大匹配范围，确保所有储蓄相关交易都能显示

## 1.8.18 - 2026-03-14

### Features
- **打卡和取款日期显示**:
  - 在储蓄打卡弹窗中显示打卡日期时间
  - 已完成的打卡记录显示 "打卡：YYYY-MM-DD HH:mm"
  - 取款交易自动记录当前时间
  - 存取记录列表显示交易日期

### Modified Files
1. `web/src/features/savings/components/SavingsPlanDialog.tsx`
   - 添加 `createdAt` 和 `updatedAt` 字段到类型定义
   - 在打卡状态按钮下方显示打卡时间
   - 仅对已完成状态显示打卡日期

## 1.8.17 - 2026-03-14

### Features
- **Savings 页面取款功能**:
  - 新增取款弹窗组件 `SavingsWithdrawalDialog`
  - 在目标列表中添加"取款"按钮，支持从储蓄目标取款
  - 自动创建取款交易记录（分类：储蓄取款）
  - 实时更新储蓄目标的当前存款金额
  - 取款金额验证：不能超过当前存款
  - 支持备注说明，记录取款用途

### Modified Files
1. `web/src/features/savings/components/SavingsWithdrawalDialog.tsx` (新建)
   - 创建取款弹窗组件
   - 实现取款表单和验证逻辑
   - 调用 API 创建交易记录和更新储蓄目标

2. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 添加 `onOpenWithdrawal` 回调函数
   - 在目标列表操作栏添加"取款"按钮
   - 按钮在存款为 0 时禁用

3. `web/src/app/(dashboard)/savings/page.tsx`
   - 导入 `SavingsWithdrawalDialog` 组件
   - 添加取款状态管理
   - 实现 `openWithdrawal` 函数
   - 传递回调到 `SavingsDefaultTheme`

## 1.8.16 - 2026-03-14

### Features
- **Dashboard 页面集成储蓄数据**:
  - Dashboard 的总资产现在包含储蓄目标的当前存款
  - 从 `/api/savings` 获取储蓄目标数据
  - 总资产 = 常规资产 + 储蓄目标存款总和

### Bug Fixes
- **Savings 页面布局偏移问题**:
  - 修复了刷新页面时骨架屏高度随机导致的布局跳动
  - 移除了随机高度计算，使用固定的 Tailwind CSS 高度类

### Improvements
- **Savings 页面骨架屏加载体验**:
  - 新增专用骨架屏组件：
    - `StatsCardSkeleton()` - 统计卡片骨架屏
    - `DistributionChartSkeleton()` - 分布图表骨架屏
    - `GoalsTableSkeleton()` - 目标列表表格骨架屏
    - `TransactionsSkeleton()` - 交易记录骨架屏
  - 所有骨架屏使用固定尺寸，确保加载时布局稳定
  - 添加 `loading` 参数支持，根据加载状态显示骨架屏或真实数据
  - 平滑的加载动画，提升用户体验

### Modified Files
1. `web/src/app/(dashboard)/page.tsx`
   - 添加储蓄目标 API 调用
   - 修改总资产计算逻辑，包含储蓄存款

2. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 创建 4 个专用骨架屏组件
   - 更新 `DelayedRender` 组件支持自定义骨架屏
   - 添加 `loading` 参数到组件 props
   - 为所有区域添加骨架屏支持

3. `web/src/app/(dashboard)/savings/page.tsx`
   - 传递 `loading` 参数到 `SavingsDefaultTheme` 组件

## 1.8.15 - 2026-03-14

### Features
- **移动端适配**:
  - 新增移动端导航菜单 (Hamburger Menu)，位于 Header 左侧。
  - 集成侧滑抽屉 (Side Drawer)，在移动端提供完整的侧边栏导航功能。
  - 优化 Header 布局，在移动端自动适配标题与菜单按钮。
- **仪表盘体验优化**:
  - 移动端首页布局重构：采用更紧凑的网格布局 (Grid Layout)。
  - 缩小移动端卡片尺寸与内边距，提升屏幕空间利用率。
  - 优化字体大小与图标尺寸，适配小屏设备阅读体验。
  - **字体调整**:
    - 增大"净资产"数值字体 (text-3xl -> text-4xl)。
    - 增大"总资产/负债"辅助信息字体 (text-[10px] -> text-xs/sm)，提升可读性。
  - **组件响应式优化**:
    - "最近交易"列表项增加弹性布局与文本截断，防止长文本破坏布局。
    - "快捷入口"组件在移动端缩小图标与内边距，适配小屏点击区域。
  - **布局溢出修复**:
    - 全局容器增加 `overflow-x-hidden`，防止水平滚动。
    - 仪表盘 Grid 子项增加 `min-w-0`，防止图表等宽内容撑开网格。
    - 修复"帮助"卡片装饰圆圈的绝对定位溢出问题。
  - **视觉优化**:
    - 全局加深卡片边框颜色 (border-gray-100 -> border-gray-200)，解决在部分屏幕上边框不可见的问题。
  - **统一边距**:
    - 移除资产、消费、储蓄、贷款页面的额外内边距 (`p-6`)，统一使用全局 Layout 提供的标准边距，解决移动端"边框过厚"问题。

## 1.8.14 - 2026-03-14

### Features
- **消费页体验优化**:
  - 新增底部悬浮筛选按钮 (Floating Filter Button)，下滑滚动时自动显现。
  - 支持快捷筛选面板 (Popover)，集成搜索、平台过滤与月份切换功能，与顶部筛选栏实时同步。
  - 优化滚动监听逻辑，修复 `h-screen` 布局下 `window.scrollY` 失效问题，改为监听 `main` 容器滚动。

## 1.8.13 - 2026-03-14

### Features
- **储蓄打卡流程统一**:
  - 统一"新建目标/每月打卡/指定计划"到同一弹窗与同一计划表界面。
  - 目标列表入口可直接进入计划表步骤，减少跨弹窗切换。
- **打卡识别与提醒增强**:
  - 打卡表仅展示"计划存款 > 0"的应存款月份，并同步高亮当前月份。
  - 新增右下角提醒：若上一个应存款月未打卡则提示；月底最后一天若本月未打卡则提示。
- **打卡凭证支持**:
  - 每月打卡新增图片上传与预览能力（本地持久化）。

### Fixed
- **储蓄计划接口调用修复**:
  - 修复打卡弹窗请求落到前端端口导致的 404 与 JSON 解析失败问题，统一改为 API 基础封装调用。
- **可访问性修复**:
  - 为储蓄相关弹窗补齐 `DialogDescription`，消除 `DialogContent` 描述缺失告警。
- **消费页构建错误修复**:
  - 移除消费主题组件中的冗余闭合标签，修复 JSX 解析失败导致的构建报错。

## 1.8.12 - 2026-03-14

### Features
- **消费页深度分析图表上线**:
  - 新增 **资金流向桑基图** (Sankey Diagram)：直观展示"收入来源 ➔ 支付账户 ➔ 支出去向"的资金流动全景。
  - 新增 **消费时段散点图** (Scatter Plot)：24小时气泡分布图，可视化分析消费习惯（如午餐/深夜时段）。
  - 新增 **单笔金额直方图** (Histogram)：统计消费金额区间分布，勾勒"细水长流"或"大额低频"消费画像。

### Fixed
- **图表标签渲染修复**:
  - 重写桑基图节点渲染逻辑，自定义 Label 组件，修复节点名称不显示的问题。
  - 优化桑基图右侧布局间距，防止长文本标签（如"餐饮美食"）被容器截断。

## 1.8.11 - 2026-03-14

### Performance
- **消费页图表方向性动效重做**:
  - 移除图表容器的位移过渡，仅保留透明度渐显，修复"整体偏移"观感。
  - 柱状图统一启用纵向生长动画参数，折线图启用左到右绘制动画参数。
  - 消费日历改为按日期单元格依次显现，恢复"一个个方块加载"的动态效果。
  - 保留分批懒加载策略，兼顾加载丝滑度与主线程压力控制。

## 1.8.10 - 2026-03-14

### Performance
- **消费页加载动效与懒加载修复**:
  - 移除生硬的全局步进串行方案，恢复按区块分批懒加载策略。
  - 图表卡片改为平滑过渡（透明度 + 轻微位移动画），提升加载丝滑感。
  - 重新校准首屏与滚动区延迟节奏，保留动态加载观感并降低并发渲染压力。

## 1.8.9 - 2026-03-14

### Performance
- **消费页图表串行加载**:
  - 新增渲染步进控制，图表按步骤逐个加载，避免同屏并发渲染导致卡顿。
  - `DelayedRender` 新增 `enabled` 开关，仅在命中当前步骤时启动渲染调度。
  - 首屏图表改为严格串行触发，滚动区图表保持懒加载前提下按步骤依次解锁。

## 1.8.8 - 2026-03-14

### Performance
- **消费页刷新卡顿优化**:
  - 优化 `DelayedRender` 调度策略：懒加载场景加入 `requestIdleCallback`，并完善定时器/空闲回调清理。
  - 分散图表挂载延迟，避免刷新后多个图表同一时刻集中渲染造成主线程尖峰。
  - 对图表配置与筛选数据做记忆化，减少交互期重复渲染与重复计算。
  - 热力图查值由循环内 `.find` 改为 `Map` 预索引，降低表格渲染开销。
  - 交易明细改为渲染筛选结果，移除无效过滤计算。

## 1.8.7 - 2026-03-14

### Fixed
- **消费页品牌图标修正**:
  - 微信与支付宝卡片图标改为基于 `simple-icons` 的官方品牌矢量路径。
  - 统一品牌底色与白色主标，修复"图标不像官方"的识别偏差。

## 1.8.6 - 2026-03-14

### Fixed
- **消费页图表刷新位移修复**:
  - 重构 `DelayedRender` 渲染结构，加载前后统一使用同一外层容器，避免布局重排。
  - 移除图表载入时的纵向位移动画，仅保留淡入效果，消除"上下跳动"观感。
  - 饼图模块容器固定为 `200x200`，骨架与真实图表尺寸完全一致，刷新时位置保持不变。

## 1.8.5 - 2026-03-14

### UI/UX Improvements
- **消费页体验优化**:
  - 重构图表加载状态，移除整体占位符，改为卡片内骨架屏 (Skeleton) 加载。
  - 修复图表加载时的高度跳变问题，确保加载前后布局稳定。
  - 为不同类型的图表（饼图、列表、文本）定制了专属的骨架屏样式。

## 1.8.4 - 2026-03-14

### UI/UX Improvements
- **消费页图表与布局细化**:
  - 修复第 4 行网格等高拉伸导致的帕累托卡片底部空白（`items-start`）。
  - 优化帕累托图内边距与坐标轴线，进一步压缩无效留白。
  - 消费日历改为扁平化全展示布局，移除滚动并调整方块长宽比。
  - 顶部四张概览卡片图标放大，并统一微信/支付宝官方配色与边框样式。

## 1.8.3 - 2026-03-14

### UI/UX Improvements
- **储蓄页增强**:
  - 新增 "指定计划" 功能，支持为每个目标设定分月存款计划。
  - 增加 "隔月存" 模式的悬浮说明卡片 (Tooltip)。
  - 优化目标卡片操作栏，增加快捷计划入口。
  - 新增目标类型：每月存、隔月存(单/双)。
  - 新增存款类型：现金、死期、他人帮存。
  - 优化新建/编辑表单，支持更多配置项。
  - **弹窗重构**:
    - "新建/编辑目标" 弹窗采用 Shadcn UI 组件重构，界面更加现代化。
    - 优化表单布局，增加图标辅助，提升输入体验。
- **储蓄页重构**: 
  - 对齐消费页 (Consumption) 主题风格，采用统一的卡片设计与配色。
  - 新增 "储蓄分布" 饼图 (按类型统计)。
  - 优化 "总存款/目标总额/总体进度" 概览卡片样式。
  - 引入 `DelayedRender` 实现交错动画与懒加载。
  - 新增储蓄目标搜索功能。

## 1.8.2 - 2026-03-13

### UI/UX Improvements
- **侧边栏优化**: 修复侧边栏跟随滚动问题，调整为固定布局 (`h-screen`)，并新增 `Theme` (主题) 页面入口。
- **消费页重构**:
  - 新增骨架屏加载动画 (Skeleton Loading)
  - 顶部卡片新增图标 (Icons)
  - 饼图标签优化 (移至底部右侧)
  - 日历组件样式优化 (字体与格子大小调整)
  - 新增过滤器：全局搜索 (关键词)、平台筛选、日期筛选
  - 优化 "工作日 vs 周末" 图表为按周 (周一至周日) 每日平均消费统计
- **全站风格统一**: 重构资产 (Assets)、储蓄 (Savings)、贷款 (Loans) 页面，应用统一的卡片设计、图标体系与配色方案。

## 1.8.1 - 2026-03-13

### Performance
- **消费页性能优化**: 
  - 引入 `IntersectionObserver` 实现图表懒加载，仅在滚动可见时渲染。
  - 优化首屏加载策略，分批次渲染首屏图表，彻底解决多图表并发渲染导致的页面卡顿问题。

## 1.8.0 - 2026-03-13

### Architecture
- **前端架构重构**: 迁移至 Feature-based 架构 (`src/features/*`)，分离 UI/Theme 与数据逻辑。
- **模块化**: 拆分 `dashboard`, `assets`, `consumption`, `savings`, `loans` 为独立特性模块。

### UI/UX
- **组件库升级**: 集成 `shadcn/ui` 与 `recharts`。
- **图表增强**: 
  - 消费页：新增平台分布饼图、收支环形图、商家排行柱状图、热力图等。
  - 资产页：新增资产估值卡片。
  - 贷款页：新增还款计划表与进度图。
  - 储蓄页：新增目标进度可视化。
- **主题支持**: 实现了基于组件的主题切换架构。

### Changed
- **端口变更**: 后端 API 端口调整为 `3006`。

## 1.7.0 - 2026-03-13

### Added

- 预算管理模块上线：
  - 后端新增预算 CRUD 接口，支持按月/年设定分类或总预算，并自动统计进度
  - 前端新增预算管理页，支持展示进度条（颜色区分预警状态）与增删改操作

## 1.6.0 - 2026-03-13

### Added

- 交易管理增强：
  - 后端新增交易编辑与删除接口（`PUT/DELETE`）
  - 前端消费流水列表支持悬停显示操作按钮，可编辑金额/分类/商家/时间或删除记录

## 1.5.0 - 2026-03-13

### Added

- 消费分析增强：
  - 趋势图支持"按日/按月"时间粒度切换
  - 分类排行支持"Top 5/10/20"筛选
  - 后端接口增强 `groupBy` 与 `limit` 参数支持

## 1.4.0 - 2026-03-13

### Added

- 设置模块上线：
  - 后端新增用户信息修改与密码重置接口
  - 前端新增设置页，支持修改昵称与重置密码
- 基础设施优化：
  - 根目录 `npm run dev` 可一键同时启动前后端（Concurrently）

## 1.3.0 - 2026-03-13

### Added

- 仪表盘首页（Dashboard Home）上线：
  - 聚合展示净资产、总资产、总负债
  - 展示本月支出、收入与结余
  - 展示最近 5 笔交易记录与快捷功能入口

## 1.2.0 - 2026-03-13

### Added

- 后端新增资产（Asset）模块，支持记录现金/银行卡/支付宝/微信/投资等资产（CRUD）
- 前端新增资产管理页，支持展示总资产估值、资产卡片与增删改操作

## 1.1.0 - 2026-03-13

### Added

- 前端贷款页新增"还款计划"功能（基于剩余金额与月供自动推算）
- 前端消费页新增交易记录 CSV 导出功能（支持当前筛选条件）

## 1.0.0 - 2026-03-13

### Added

- 后端新增贷款（Loan）模块，支持记录贷款总额、还款期数与剩余金额（CRUD）
- 前端新增贷款管理页，支持展示还款进度条、每月还款信息与增删改操作

## 0.9.0 - 2026-03-13

### Added

- 后端新增储蓄目标（SavingsGoal）模块，支持 CRUD 接口（内存/Prisma 双模式）
- 前端新增储蓄目标管理页，支持展示目标卡片、进度条与增删改操作

## 0.8.0 - 2026-03-13

### Added

- 消费页新增日期范围筛选（快捷按钮/自定义）与收支类型切换
- 后端消费聚合接口支持按收支类型（EXPENSE/INCOME）与平台筛选

## 0.7.0 - 2026-03-13

### Added

- 前端新增注册页，完善登录/退出流程与 Header 用户展示
- 鉴权守卫升级为校验 /api/auth/me，Token 无效自动清除并跳转登录

## 0.6.0 - 2026-03-13

### Added

- 消费页新增按日趋势折线图与分类 Top10 分布展示

## 0.5.0 - 2026-03-13

### Added

- 后端新增 JWT 登录/注册与鉴权中间逻辑，并将核心数据接口纳入鉴权保护
- 前端接入登录页与 Token 存储，Dashboard 路由组增加未登录跳转
- 前端请求改为统一封装，自动携带 Authorization Bearer Token

## 0.4.0 - 2026-03-13

### Added

- 新增 PostgreSQL + Prisma 数据库配置文档，并补齐后端 Prisma Studio 脚本
- 后端新增消费分析聚合指标接口（汇总/按平台/按分类/按日趋势）
- 前端消费页新增汇总卡片与按平台分布展示，并支持导入后自动刷新

## 0.3.0 - 2026-03-13

### Added

- 后端新增交易导入与查询接口（支持微信/支付宝 CSV 解析、去重与统计）
- 前端消费页新增账单导入与支出流水列表（分页展示）

## 0.2.0 - 2026-03-13

### Added

- 后端接入 Prisma，新增核心数据模型与示例环境变量
- 连接域增强：OTP 生成/校验/撤销支持数据库模式，并提供设备列表接口
- 前端连接管理页：生成连接码与倒计时、设备列表与撤销授权

## 0.1.0 - 2026-03-13

### Added

- 初始化前端 Next.js 工程（web/），建立 Dashboard 路由组与基础布局
- 增加 TanStack Query Provider 作为前端数据请求基础设施
- 初始化后端 Express 工程（src/server），提供健康检查与连接码 API 骨架
