# openstar-StarAccounting Flutter 总览页启动开发文档

## 1. 文档目的

这份文档记录本次 Flutter 统一前端正式开工时，为什么先做总览页、已经落了哪些基础设施、当前实现边界在哪里，以及接下来怎么继续往下推进。

它对应当前仓库中的新目录：

```text
flutter/
```

---

## 2. 为什么第一批先做总览页

在 Flutter 迁移阶段，总览页是最适合第一批落地的页面，原因有 4 个：

1. 它能覆盖登录后主壳层、导航、卡片布局、列表布局这些基础能力。
2. 它虽然依赖多个接口，但图表复杂度远低于消费页，适合先验证真实数据聚合链路。
3. 它是整个系统的主入口，最适合作为 Flutter 版第一印象页面。
4. 做完总览页后，资产页和数据页可以沿用同一套路由、网络层和壳层继续扩展。

所以这次没有直接上消费页，而是先做：

- 登录
- 路由守卫
- 应用壳层
- 总览页真实数据

---

## 3. 本次目标

本次目标不是做完整 Flutter 版，而是把 Flutter 统一前端真正“启动起来”。

这次目标拆成 5 件事：

1. 在仓库内创建 `flutter/`
2. 接入 Flutter 基础依赖
3. 建立登录与认证状态
4. 建立可扩展的 Web / App 壳层
5. 优先做总览页真实数据版

---

## 4. 当前已完成内容

## 4.1 工程初始化

已完成：

- 使用 `flutter create --project-name app_flutter flutter` 生成 Flutter 工程
- 保留 `android/ ios/ web/ windows/ macos/ linux/` 多端目录
- 调整 `pubspec.yaml`，接入当前阶段需要的最小依赖

当前依赖：

- `go_router`
- `flutter_riverpod`
- `dio`
- `intl`

说明：

- 第一版有意不接 `shared_preferences`、`flutter_secure_storage` 等插件依赖，先优先保证 Web 构建可用。
- 当前登录态在 Web 端使用浏览器本地存储，在非 Web 端先退化为内存态，后续再补正式持久化方案。

## 4.2 基础架构

当前已建立：

- `bootstrap/`：应用启动入口
- `core/config/`：环境配置
- `core/api/`：Dio 网络层与统一错误映射
- `core/auth/`：Token 存储和认证状态
- `routing/`：路由和守卫
- `shared/layout/`：应用壳层
- `shared/widgets/`：加载态、空态、错误态

当前核心能力：

- App 启动会自动尝试恢复登录态
- 未登录会重定向到 `/login`
- 登录成功后会自动进入 `/dashboard`
- 侧边栏和移动端底部导航已具备基础切换能力

## 4.3 总览页

已完成：

- 建立 Flutter 版总览页 `DashboardPage`
- 复用现有后端接口聚合方式，而不是等待后端新增 `/api/dashboard`
- 当前总览页已接入真实接口：
  - `/api/assets`
  - `/api/loans`
  - `/api/savings`
  - `/api/metrics/consumption/summary`
  - `/api/transactions`
  - `/api/budgets/alerts`

当前总览页展示：

- 总资产
- 总负债
- 本月收入
- 本月支出
- 本月储蓄流入
- 本月储蓄流出
- 预算提醒
- 最近 5 条流水

总览页已经具备：

- 加载态
- 空态
- 错误态
- 下拉刷新

---

## 5. 当前实现边界

这次虽然已经真正开始做 Flutter 代码，但范围是刻意收住的。

当前**没有做**这些：

- 资产页真实列表
- 数据页真实功能
- 消费页复杂图表
- AI 页面
- 连接管理
- iOS 真机联调
- Android 真机联调
- 正式持久化安全存储
- 完整主题系统

当前保留占位的页面：

- `/assets`
- `/data`

这样做是为了保证迁移第一批先跑通主流程，而不是一开始就把范围做散。

---

## 6. 环境现状与阻塞

本机当前环境检查结果：

- Flutter：可用
- Dart：可用
- Edge Web：可用
- Android SDK：缺失
- Chrome：缺失

这意味着：

- 当前已经可以构建 Flutter Web
- 当前也可以维护 Android 工程目录
- 但这台机器暂时不能直接完成 Android 真机或模拟器联调

因此本次实际验证方式选择为：

1. `flutter analyze`
2. `flutter build web`

当前结果：

- `flutter analyze` 已通过
- `flutter build web` 已通过

说明：

- `flutter test` 当前在本机环境下未稳定通过，报错为 `flutter_tester` WebSocket 启动异常，不属于本次代码的语法或类型问题。

---

## 7. 本次实现中的重要取舍

## 7.1 暂不新增后端总览聚合接口

虽然从长期看，后端单独补一个 `/api/dashboard` 会更合理，但本次故意没有先改后端。

原因：

- 当前目标是先让 Flutter 版能尽快起步
- 现有 Web 已经有成熟的总览数据拼装逻辑
- 直接复用现有接口链路，风险更低

后续当 Flutter 页面继续增多时，再考虑把前端聚合逻辑下沉到后端。

## 7.2 暂不引入正式本地存储插件

原因：

- 当前 Windows 环境缺少 Developer Mode，带插件的本地构建容易增加额外环境阻塞
- 第一阶段更重要的是让 Web 可运行、总览页可展示

因此当前策略是：

- Web 端 token 先存本地存储
- 非 Web 端先用内存态过渡

后续等 Android 环境补齐后，再接正式持久化方案。

## 7.3 暂不做复杂 UI 还原

当前总览页的视觉目标不是像素级复刻 Next.js 版，而是：

- 层级清楚
- 数据可读
- 布局稳定
- 后续可扩展

这是一次“架构起步版”，不是最终设计稿。

---

## 8. 下一步建议顺序

在这次基础上，推荐继续按下面顺序推进：

1. 把资产页从占位页升级为真实列表页
2. 把数据页从占位页升级为真实列表和统计页
3. 再进入消费页
4. 再补正式持久化与 Android 联调

也就是说：

- 第一批：总览、资产、数据
- 第二批：消费、预算、储蓄、贷款
- 第三批：AI、连接、设置

---

## 9. 开工结果总结

到当前为止，Flutter 统一前端已经不再停留在“只写文档”的阶段，而是已经正式有了第一套可运行代码基础。

当前可以明确确认：

- `flutter/` 已创建
- 登录与路由守卫已存在
- 总览页已接入真实数据
- Flutter Web 已可构建

因此后续可以直接在这个基础上继续做资产页，不需要重新起步。

---

## 10. 当前总览页实际使用方式

本轮调整后，项目采用的是：

**旧总览页保留原路由，新 Flutter 总览页走独立预览路由**

具体做法是：

1. 保留原有 `web/` 的登录体系、主布局、侧边栏、Header 和旧总览页
2. 给 Flutter 新增一个无壳层的嵌入路由：`/embed/dashboard`
3. 在 Next.js 中新增独立预览路由：
   ```text
   /flutter-dashboard-preview
   ```
4. 使用 `flutter build web --base-href /flutter-dashboard/` 生成 Flutter Web 静态包
5. 将构建产物同步到：
   ```text
   web/public/flutter-dashboard/
   ```
6. 让更直观的本地路径：
   ```text
   web/src/app/flutter-dashboard-preview/page.tsx
   ```
   加载新的 Flutter 总览页

这样处理后的结果是：

- 旧 TS 文件保留，不删除
- 旧总览页仍然保留在原路由 `/`
- 新 Flutter 总览页可以通过 `/flutter-dashboard-preview` 单独查看
- 其余页面仍继续使用原有 TS 页面

这样更适合当前阶段，因为它同时满足：

- 新页面已经能独立预览
- 旧页面仍然能作为样式和交互参照
- 等新页面对齐到位后，再替换旧路由即可

---

## 11. 当前切换边界

当前真正新增到 Flutter 的只有：

- Flutter 总览页预览入口 `/flutter-dashboard-preview`

仍保留 TS 的部分包括：

- 旧总览页 `/`
- Dashboard 外层布局
- 侧边栏
- Header
- 移动端底部导航
- 资产页
- 数据页
- 消费页
- AI、连接、设置等其余页面

所以当前不是“总览页已经正式替换”，而是：

**先让新旧总览并行存在，先对照开发，再做正式替换。**

---

## 12. 本次调整后验证结果

本次切换完成后，已验证：

- `flutter analyze` 通过
- `flutter build web --base-href /flutter-dashboard/` 通过
- `web/` 的 `npm run build` 通过

这说明：

- Flutter 总览页构建链路正常
- Flutter 静态资源可以被当前站点挂载
- Next.js 新增预览路由后，没有破坏旧总览页的构建链路

---

## 13. 后续建议

既然当前已经改成“新旧并行”，后续建议按这个顺序继续：

1. 资产页
2. 数据页
3. 消费页

原因：

- 资产页和数据页更适合延续当前“旧页保留 + 新页单独预览”的策略
- 消费页最复杂，放在第三步更稳

等新总览页你确认已经足够接近旧页后，再把旧路由正式切过去会更稳。
