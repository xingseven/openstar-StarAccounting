# openstar-StarAccounting Flutter 第一阶段初始化执行清单

## 1. 文档目的

这份文档不是路线说明，而是**真正开工时的第一阶段执行清单**。

它解决的问题只有一个：

**如果现在就开始做 Flutter Web + App 统一前端，第一步到底先做什么，按什么顺序做，做到什么程度才算第一阶段完成。**

这份文档默认基于当前仓库执行：

- 仓库根目录：`f:\1python\xiangmu\openstar-StarAccounting`
- 旧前端：`web/`
- 后端：`src/server/`
- 新前端目标目录：`app_flutter/`

---

## 2. 第一阶段目标

第一阶段不要追求做完整个 Flutter 项目。

第一阶段只做 5 件事：

1. 本机 Flutter 开发环境可用
2. 仓库里成功创建 `app_flutter/`
3. Flutter Web 和 Android 调试环境能跑起来
4. 登录态、路由守卫、应用壳层跑通
5. 至少接通一组真实后端接口并显示到页面

一句话理解：

**第一阶段的目标不是“把 App 做完”，而是“把统一前端的地基打稳”。**

---

## 3. 第一阶段完成标准

下面这些都满足，才算第一阶段完成：

- 可以在 `Chrome` 中启动 Flutter Web
- 可以在 Android 模拟器或真机中启动 Flutter App
- 项目中已有 `app_flutter/` 目录和基础模块结构
- 登录页能请求真实后端接口
- 登录后能进入主壳层页面
- 有路由守卫，未登录不能直接进入业务页
- 能成功请求 `GET /api/auth/me`
- 至少有一个真实业务页可以显示基础数据
- 基础错误态、空态、加载态已经建立

如果还做不到这些，就不要急着去做消费图表、动画和高级 UI。

---

## 4. 第一阶段边界

第一阶段明确**不做**这些：

- 不迁消费分析复杂图表
- 不迁 AI 上传能力
- 不迁连接管理
- 不做全量主题系统
- 不做复杂离线缓存
- 不做 Flutter Web 替换现网
- 不做 iOS 打包上线
- 不做管理员后台迁移

第一阶段要做的是：

- 工程
- 路由
- 登录
- 壳层
- 网络层
- 状态管理
- 一页真实数据

---

## 5. 开工前先准备什么

## 5.1 本机环境

至少确认这些工具已经安装：

- Flutter SDK
- Dart SDK
- Git
- Chrome
- Android Studio
- Android SDK
- JDK

建议先执行：

```powershell
flutter doctor
```

目标是：

- 没有 Flutter SDK 丢失
- Chrome 可用
- Android toolchain 可用
- 至少能启动一个 Android 模拟器

如果 `flutter doctor` 没过，不要继续后面的步骤。

## 5.2 当前仓库状态

执行前先确认当前仓库还有旧前端和后端能正常跑。

建议至少知道：

- 旧前端启动方式：`npm run dev`
- 后端启动方式：`cd src/server && npm run dev`
- 后端 API 基础地址
- 当前登录账号和测试数据

因为 Flutter 第一阶段需要用真实接口联调。

## 5.3 先准备测试账号

建议至少准备这 2 个账号：

1. 普通用户
2. 管理员用户

虽然第一阶段不做后台，但后面权限守卫很快会用到。

---

## 6. 第一天先做什么

如果你今天正式开工，建议按下面顺序。

## 6.1 第一步：检查 Flutter 环境

```powershell
flutter doctor -v
flutter config --enable-web
flutter devices
```

确认点：

- 能看到 `Chrome`
- 能看到至少一个 Android 设备或模拟器

## 6.2 第二步：在仓库根目录创建 Flutter 工程

进入仓库根目录：

```powershell
cd f:\1python\xiangmu\openstar-StarAccounting
flutter create app_flutter
```

创建完成后先不要急着加页面，先确保空工程能跑。

## 6.3 第三步：先跑通 Web

```powershell
cd app_flutter
flutter run -d chrome
```

验收标准：

- 浏览器能打开 Flutter 默认计数器页面
- 没有初始化报错

## 6.4 第四步：再跑通 Android

```powershell
flutter emulators
flutter emulators --launch <你的模拟器ID>
flutter run -d android
```

或者直接真机调试。

验收标准：

- Android 能安装并成功启动空工程

## 6.5 第五步：提交一个纯初始化基线

如果你准备正式开工，建议这一步单独提交一次：

- 创建 `app_flutter/`
- 空工程可运行

这样后面即使结构搭坏了，也有一个很干净的初始点。

---

## 7. 推荐依赖安装顺序

不要一上来装一大堆库。

建议按“刚需优先”顺序安装。

## 7.1 第一批必须依赖

```powershell
flutter pub add go_router
flutter pub add flutter_riverpod
flutter pub add dio
flutter pub add freezed_annotation
flutter pub add json_annotation
flutter pub add shared_preferences
flutter pub add flutter_secure_storage
flutter pub add --dev build_runner
flutter pub add --dev freezed
flutter pub add --dev json_serializable
flutter pub add --dev flutter_lints
```

这批依赖对应：

- 路由
- 状态管理
- 网络层
- 数据模型
- 本地持久化

## 7.2 第一阶段先不要装的依赖

这些先别急：

- 大型图表库
- 数据库缓存库
- 动画特效库
- 状态管理替代方案
- 大量 UI 套件

第一阶段先把系统架子搭稳，再补这些。

---

## 8. 推荐目录结构

创建完 `app_flutter/` 后，不要把所有代码都塞进 `lib/main.dart`。

第一阶段就把结构拉开。

推荐结构：

```text
app_flutter/
├── lib/
│   ├── bootstrap/
│   │   ├── app.dart
│   │   ├── app_env.dart
│   │   └── bootstrap.dart
│   ├── core/
│   │   ├── api/
│   │   │   ├── api_client.dart
│   │   │   ├── api_constants.dart
│   │   │   ├── api_error.dart
│   │   │   └── auth_interceptor.dart
│   │   ├── auth/
│   │   │   ├── auth_repository.dart
│   │   │   ├── auth_state.dart
│   │   │   ├── token_store.dart
│   │   │   └── current_user_provider.dart
│   │   ├── config/
│   │   ├── error/
│   │   ├── storage/
│   │   ├── theme/
│   │   └── utils/
│   ├── shared/
│   │   ├── layout/
│   │   │   ├── app_shell.dart
│   │   │   ├── desktop_shell.dart
│   │   │   ├── mobile_shell.dart
│   │   │   └── responsive_scaffold.dart
│   │   ├── widgets/
│   │   │   ├── app_loading.dart
│   │   │   ├── app_empty.dart
│   │   │   ├── app_error.dart
│   │   │   └── primary_button.dart
│   │   └── navigation/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   ├── dashboard/
│   │   ├── assets/
│   │   └── data_management/
│   ├── routing/
│   │   ├── app_router.dart
│   │   └── route_guard.dart
│   └── main.dart
├── test/
└── integration_test/
```

第一阶段只需要先建空目录和关键文件，不用每个文件都马上写满。

---

## 9. 第一阶段必须先做的基础文件

下面这些文件建议优先建立。

## 9.1 启动相关

- `lib/main.dart`
- `lib/bootstrap/bootstrap.dart`
- `lib/bootstrap/app.dart`
- `lib/bootstrap/app_env.dart`

职责：

- 应用启动
- 环境注入
- 全局 ProviderScope
- 根 MaterialApp

## 9.2 路由相关

- `lib/routing/app_router.dart`
- `lib/routing/route_guard.dart`

职责：

- 页面注册
- 登录态判断
- 未登录重定向

## 9.3 网络相关

- `lib/core/api/api_client.dart`
- `lib/core/api/api_constants.dart`
- `lib/core/api/api_error.dart`
- `lib/core/api/auth_interceptor.dart`

职责：

- Base URL
- 请求封装
- Token 注入
- 错误统一映射

## 9.4 认证相关

- `lib/core/auth/token_store.dart`
- `lib/core/auth/auth_repository.dart`
- `lib/core/auth/auth_state.dart`
- `lib/core/auth/current_user_provider.dart`

职责：

- Token 读写
- 登录
- 获取当前用户
- 维护登录态

## 9.5 共享 UI

- `lib/shared/layout/app_shell.dart`
- `lib/shared/layout/responsive_scaffold.dart`
- `lib/shared/widgets/app_loading.dart`
- `lib/shared/widgets/app_empty.dart`
- `lib/shared/widgets/app_error.dart`

职责：

- 统一壳层
- 统一加载态
- 统一空态
- 统一错误态

---

## 10. 第一个要接的接口

第一阶段不要先接业务大接口，先接认证相关。

建议顺序：

1. `POST /api/auth/login`
2. `GET /api/auth/me`
3. 选择一个简单的业务接口

推荐第一个业务接口优先级：

1. 资产列表接口
2. Dashboard 概览接口
3. 数据页统计接口

为什么不先接消费分析：

- 数据结构更复杂
- 图表依赖更多
- 首阶段没有必要

---

## 11. API 契约检查清单

在 Flutter 开工前，先把这些问题确认掉。

## 11.1 登录接口

至少确认：

- 请求字段名是什么
- 返回的 Token 字段名是什么
- 是否有 refresh token
- 失败时错误码是什么
- 账号密码错误时 message 是什么

## 11.2 当前用户接口

至少确认：

- 是否必须带 Bearer Token
- 返回 user 结构是否稳定
- 用户角色字段名称是什么
- 是否包含默认账户信息

## 11.3 业务列表接口

至少确认：

- 分页参数名称
- 返回列表字段名称
- 是否返回 total
- 排序参数名称
- 时间字段格式

## 11.4 上传下载接口

至少确认：

- 上传是否 `multipart/form-data`
- 下载是否返回文件流
- 文件名是否从 header 读取

如果这些不明确，Flutter 前端很容易反复改。

---

## 12. 第一周执行顺序

下面是建议节奏。

## Day 1：环境和工程

- [ ] 跑通 `flutter doctor`
- [ ] 创建 `app_flutter/`
- [ ] 跑通 Flutter Web
- [ ] 跑通 Android 调试
- [ ] 建立基础目录

当天结束标准：

- 空工程在 Web 和 Android 都能启动

## Day 2：依赖和壳层

- [ ] 安装 `go_router`
- [ ] 安装 `flutter_riverpod`
- [ ] 安装 `dio`
- [ ] 安装模型生成依赖
- [ ] 建立 `bootstrap/ core/ shared/ routing/ features/`
- [ ] 建立 `app.dart`
- [ ] 建立 `app_router.dart`

当天结束标准：

- 能看到基础壳层页面

## Day 3：登录态

- [ ] 封装 `ApiClient`
- [ ] 封装 `TokenStore`
- [ ] 建立登录页
- [ ] 接通 `POST /api/auth/login`
- [ ] 存储 Token
- [ ] 建立路由守卫

当天结束标准：

- 登录成功后能跳转到主页

## Day 4：当前用户与守卫

- [ ] 接通 `GET /api/auth/me`
- [ ] 初始化用户状态
- [ ] 刷新页面时恢复登录态
- [ ] 未登录时自动跳到登录页

当天结束标准：

- 刷新页面后仍能识别登录态

## Day 5：第一个真实业务页

- [ ] 接一个简单业务接口
- [ ] 做 Repository
- [ ] 做 Provider
- [ ] 做列表页或概览页
- [ ] 补加载态、空态、错误态

当天结束标准：

- 至少有一个真实业务页显示真实数据

---

## 13. 推荐先迁哪个页面

第一阶段推荐只挑这几个：

### 13.1 首页壳层

目的：

- 验证导航结构
- 验证布局切换

### 13.2 资产页

原因：

- 数据结构清晰
- 表单和列表并存
- 难度比消费页低很多

### 13.3 Dashboard 页

原因：

- 能快速验证概览卡片模式
- 适合做首屏性能控制

### 13.4 数据管理页

原因：

- 能提前暴露分页、筛选、导入等接口问题

不推荐第一阶段先迁：

- 消费分析
- AI 页面
- 连接管理

---

## 14. 路由建议

第一阶段先保持路由简单，不要过度设计。

建议先有这些路径：

```text
/login
/dashboard
/assets
/data
```

后面再逐步扩展：

```text
/consumption
/budgets
/savings
/loans
/ai
/connections
/settings
```

---

## 15. 壳层建议

第一阶段壳层只要解决“能用”和“结构清楚”。

推荐：

- Web：左侧导航 + 顶部栏 + 内容区
- 手机：底部导航 + 页面标题栏

不要第一阶段就做：

- 复杂动效导航
- 主题花活
- 多层折叠菜单

只要做到：

- 切页面稳定
- 导航清晰
- 登录态正确

就够了。

---

## 16. 第一阶段建议的状态管理划分

不要所有状态都混在一个 Provider 里。

建议先分成：

- 认证状态
- 当前用户状态
- 全局壳层状态
- 页面级查询状态

第一阶段先不要做：

- 全局万能 Store
- 巨型状态对象
- 页面和接口完全不分层

---

## 17. 第一阶段的页面实现原则

每个页面都按同一顺序写：

1. 先建路由
2. 再建空页面
3. 再接 Repository
4. 再接 Provider
5. 再接真实接口
6. 最后补加载态、空态、错误态

不要反过来：

- 先写半天 UI
- 然后发现接口没定
- 再回来重写页面结构

---

## 18. 建议先做的 3 个通用组件

第一阶段最先落地这 3 个就够用了：

1. `AppLoading`
2. `AppEmpty`
3. `AppError`

为什么先做这三个：

- 所有页面都会用
- 能快速统一体验
- 后面不容易返工

然后再补：

- `PrimaryButton`
- `AppTextField`
- `SectionCard`

---

## 19. 第一阶段建议保留的 UI 取舍

为了速度和稳定性，第一阶段建议：

- 少做阴影
- 少做复杂渐变
- 少做高频动画
- 少做玻璃态效果
- 多用简单、清晰、可维护的卡片结构

目标是：

- 页面清楚
- 数据可读
- 结构统一

不是：

- 第一周就做出最终视觉稿

---

## 20. 生成代码建议

如果使用 `freezed` 和 `json_serializable`，推荐统一用下面命令：

```powershell
flutter pub run build_runner build --delete-conflicting-outputs
```

如果开发过程中频繁改模型，可以用：

```powershell
flutter pub run build_runner watch --delete-conflicting-outputs
```

建议：

- 生成文件不要手改
- DTO 和领域模型尽量分开

---

## 21. 本地环境配置建议

第一阶段建议准备至少两个环境：

- `dev`
- `prod`

即使先不做复杂环境切换，也建议先预留：

- API Base URL
- 是否开启日志
- 是否使用 mock

建议把这些配置放进：

- `app_env.dart`

不要把地址硬写死在页面里。

---

## 22. 验收时要检查什么

第一阶段完成前，建议按下面清单验收。

### 环境

- [ ] Flutter Web 能启动
- [ ] Android 调试包能启动

### 登录

- [ ] 登录成功
- [ ] 登录失败有提示
- [ ] 刷新页面后登录态仍在
- [ ] 退出登录可回到登录页

### 路由

- [ ] 未登录访问业务页会跳转到登录页
- [ ] 登录后不能再误跳回登录页

### 网络层

- [ ] Bearer Token 会自动注入
- [ ] 接口错误能被统一捕获
- [ ] 401 有统一处理

### 页面

- [ ] 至少一个业务页接了真实数据
- [ ] 有加载态
- [ ] 有空态
- [ ] 有错误态

---

## 23. 第一阶段最常见的错误

### 错误 1：先写 UI，不先定接口

结果：

- 页面写很快
- 联调时大面积返工

### 错误 2：把所有逻辑都塞进页面

结果：

- 页面越来越大
- 后面很难复用和测试

### 错误 3：第一周就想做图表和动画

结果：

- 核心登录和路由都还没稳
- 时间都花在次优先级内容上

### 错误 4：不做统一错误处理

结果：

- 每个页面各写一套错误分支
- 后面很难维护

### 错误 5：先做视觉细节，不做数据流

结果：

- 看起来像做了很多
- 实际主流程还没跑通

---

## 24. 第一阶段建议的 git 提交节奏

推荐按小步提交：

1. `init: 创建app_flutter空工程`
2. `build: 接入Flutter基础依赖`
3. `feat: 建立路由与应用壳层`
4. `feat: 接入登录与用户态`
5. `feat: 接通第一个真实业务页`

每一步都尽量保证：

- 能运行
- 不破坏前一步
- 遇到问题容易回退

---

## 25. 实际开工命令清单

下面给一套可直接执行的 PowerShell 顺序。

```powershell
cd f:\1python\xiangmu\openstar-StarAccounting
flutter doctor -v
flutter config --enable-web
flutter create app_flutter
cd app_flutter
flutter run -d chrome
flutter pub add go_router
flutter pub add flutter_riverpod
flutter pub add dio
flutter pub add freezed_annotation
flutter pub add json_annotation
flutter pub add shared_preferences
flutter pub add flutter_secure_storage
flutter pub add --dev build_runner
flutter pub add --dev freezed
flutter pub add --dev json_serializable
flutter pub add --dev flutter_lints
```

后面开始建目录和文件。

---

## 26. 第一阶段结束后下一步做什么

第一阶段完成后，再进入第二阶段：

1. Dashboard
2. 资产
3. 数据管理
4. 消费分析

也就是说：

**第一阶段只负责让 Flutter 前端“站起来”，第二阶段才开始真正迁业务。**

---

## 27. 本文档结论

如果你现在就开始做，不要想得太大。

先完成这件事：

**把 `app_flutter/` 建起来，把登录、路由、壳层、网络层和一个真实业务页跑通。**

这一步做稳了，后面的 Flutter Web + App 迁移才不会乱。
