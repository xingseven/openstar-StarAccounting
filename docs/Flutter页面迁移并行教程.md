# openstar-StarAccounting Flutter 页面迁移并行教程

## 1. 这份文档是干什么的

这份文档不是讲方向，而是讲**怎么在别的窗口直接并行迁页面**。

目标很明确：

- 你不用等我一个页面一个页面做
- 你可以自己在别的窗口同步迁资产页、数据页、消费页等页面
- 所有人按同一套套路做，避免新旧页面混乱、目录乱放、预览路由互相覆盖

这份文档默认基于当前仓库结构：

```text
F:\1python\xiangmu\openstar-StarAccounting\
├── web\            # 旧 TS/Next.js 前端
├── flutter\        # 新 Flutter 统一前端
├── src\server\     # 后端
└── docs\
```

---

## 2. 先记住一句话

以后迁新页面时，遵守这一句就不会乱：

**旧页面继续留在 `web/`，新页面只写到 `flutter/`，预览入口只是桥，不是新业务代码主场。**

也就是说：

- 旧 TS 页面：继续放在 `web/`
- 新 Flutter 页面：只写在 `flutter/lib/features/`
- `web/src/app/flutter-xxx-preview/`：只是预览入口，不要把新业务逻辑写进去

---

## 3. 新旧目录职责

### 3.1 `web/` 是什么

`web/` 是旧版前端。

它负责：

- 当前正式可用页面
- 旧样式参照
- 迁移期预览入口

它不应该继续承担：

- 新 Flutter 业务页面逻辑
- 新版页面的核心状态管理
- 新版页面的数据层

### 3.2 `flutter/` 是什么

`flutter/` 是新的统一前端主工程。

它以后负责：

- Flutter Web
- Android
- iOS

真正的新页面开发都在：

```text
flutter/lib/
```

### 3.3 `src/server/` 是什么

`src/server/` 继续是后端。

迁页面时：

- 页面 UI 在 `flutter/`
- 接口复用 `src/server/`

除非接口真的不够，不然不要为了迁页面顺手大改后端。

---

## 4. 每迁一个页面，你到底要改哪些地方

迁一个页面，一般只会动这 5 个区域：

1. `flutter/lib/features/<feature>/`
2. `flutter/lib/routing/app_router.dart`
3. `web/src/app/flutter/[[...slug]]/`
4. `web/src/components/shared/navigation.ts`
5. 文档和版本记录

如果你发现自己开始大面积改：

- `web/src/features/`
- 旧页面核心逻辑
- 整个后端结构
- 全局主题系统

那通常说明范围已经跑偏了。

---

## 5. 迁页面的统一套路

下面是推荐的标准流程。

## 第 0 步：先选一个页面，不要多选

一次只迁一个页面。

建议优先级：

1. 资产页
2. 数据页
3. 消费页
4. 贷款页
5. 储蓄页

不建议并行时一开始就碰：

- 登录
- 全局壳层
- 路由守卫
- 全局主题

因为这些是所有人都可能碰到的共享区域，容易冲突。

---

## 第 1 步：先找旧页面的 3 个位置

迁任何页面前，先把旧版的 3 个位置找全。

以资产页为例：

1. 路由页  
   ```text
   web/src/app/(dashboard)/assets/page.tsx
   ```

2. 旧页面核心组件  
   例如：
   ```text
   web/src/features/assets/components/themes/DefaultAssets.tsx
   ```

3. 数据来源  
   例如：
   ```text
   web/src/features/assets/data-loader.ts
   ```
   或旧页面里直接请求接口的逻辑

先把这三处看完，再开始写 Flutter。

---

## 第 2 步：整理旧页面依赖的接口

不要直接先画 UI。

先列清楚这个页面依赖哪些接口。

建议做一个小清单：

```text
页面：资产页

接口：
- GET /api/assets
- POST /api/assets
- PUT /api/assets/:id
- DELETE /api/assets/:id
```

同时确认：

- 返回字段名
- 分页有没有
- 时间字段是什么格式
- 金额字段是字符串还是数字
- 是否需要 token

---

## 第 3 步：在 `flutter/lib/features/` 下建页面目录

目录模板统一按这个来：

```text
flutter/lib/features/<feature>/
├── data/
│   ├── <feature>_repository.dart
│   ├── <feature>_models.dart
│   └── ...
├── presentation/
│   ├── <feature>_page.dart
│   ├── widgets/
│   └── ...
└── domain/            # 当前简单页面可以先不建
```

例如资产页：

```text
flutter/lib/features/assets/
├── data/
│   ├── assets_repository.dart
│   └── assets_models.dart
└── presentation/
    ├── assets_page.dart
    └── widgets/
```

原则：

- 页面代码放 `presentation/`
- 接口和解析放 `data/`
- 不要把接口解析、状态、UI 全塞在一个文件

---

## 第 4 步：先写 Flutter 数据层，再写页面

推荐顺序：

1. Model
2. Repository
3. Provider
4. Page

不要反过来先写一大堆 UI。

### 4.1 Model 示例思路

```dart
class AssetItem {
  const AssetItem({
    required this.id,
    required this.name,
    required this.balance,
  });
}
```

### 4.2 Repository 示例思路

```dart
final assetsRepositoryProvider = Provider<AssetsRepository>((ref) {
  return AssetsRepository(ref.read(apiClientProvider));
});
```

### 4.3 Provider 示例思路

```dart
final assetsListProvider = FutureProvider<List<AssetItem>>((ref) async {
  return ref.watch(assetsRepositoryProvider).fetchAssets();
});
```

### 4.4 页面示例思路

```dart
class AssetsPage extends ConsumerWidget {
  const AssetsPage({super.key});
}
```

先跑通真实数据，再补细节。

---

## 第 5 步：把页面接进 Flutter 路由

统一改这里：

```text
flutter/lib/routing/app_router.dart
```

一般要加两类路由：

### 5.1 Flutter 内部业务路由

例如：

```dart
GoRoute(
  path: '/assets',
  builder: (context, state) => const AssetsPage(),
),
```

### 5.2 Flutter 内部页面路由

例如：

```dart
GoRoute(
  path: '/assets',
  builder: (context, state) => const AssetsPage(),
),
```

注意：

- 现在短地址预览直接走 Flutter 自己的业务路由
- 不需要再额外维护 `embed/<feature>` 这一层

---

## 第 6 步：在 `web/` 里新增一个预览入口

新页面不要直接替换旧路由。

先统一采用“短地址 + 明确本地入口文件”的方案：

```text
web/src/app/flutter/dashboard/page.tsx
web/src/app/flutter/assets/page.tsx
web/src/app/flutter/data/page.tsx
web/public/flutter-runtime/
```

### 6.1 为什么放顶层

因为这样本地路径最好找：

- 一眼就知道是 Flutter 预览页
- 不和旧 `(dashboard)` 混在一起
- 后面想删也容易

### 6.2 入口怎么工作

它现在的工作方式是：

1. Flutter Web 构建到：
   ```text
   web/public/flutter-runtime/
   ```
2. Next 在 `web/src/app/flutter/<feature>/page.tsx` 下提供明确的短地址入口文件
3. 每个入口文件内部用 iframe 加载：
   ```text
   /flutter-runtime/index.html#/<feature>
   ```

预览时统一使用短地址：

- `/flutter/dashboard`
- `/flutter/assets`
- `/flutter/data`

---

## 第 7 步：给旧站导航和标题补一条预览入口

一般只需要补：

```text
web/src/components/shared/navigation.ts
```

至少补 `PAGE_META`：

```ts
"/flutter/assets": {
  title: "新资产页预览",
  subtitle: "查看 Flutter 版资产页，对照旧版继续迭代。",
}
```

是否把它加进正式侧边栏导航，要看你自己要不要暴露给日常使用。

建议：

- 开发期可以不放进主导航
- 手动输入路由访问即可

这样不会把正式用户视图弄乱。

---

## 第 8 步：重新构建 Flutter 静态包

当前项目的预览静态资源挂载目录是：

```text
web/public/flutter-runtime/
```

所以每次迁完新页面后，都要重新构建 Flutter Web：

```powershell
cd F:\1python\xiangmu\openstar-StarAccounting\flutter
flutter analyze
flutter build web --base-href /flutter-runtime/
```

然后把构建结果同步到：

```text
F:\1python\xiangmu\openstar-StarAccounting\web\public\flutter-runtime\
```

这样新的预览路由才能看到最新页面。

---

## 第 9 步：验证新旧并行是否正常

每次迁一个页面，至少检查这 4 件事：

1. 旧页面还在不在
2. 新预览页能不能打开
3. Flutter 页面真实数据是否加载成功
4. 构建是否通过

最小验证命令：

```powershell
cd F:\1python\xiangmu\openstar-StarAccounting\flutter
flutter analyze

cd F:\1python\xiangmu\openstar-StarAccounting\web
npm run build
```

如果页面改动比较大，再补：

- `flutter build web --base-href /flutter-runtime/`

---

## 10. 并行开发时怎么避免互相打架

如果你在别的窗口同步迁页面，最容易冲突的是共享文件。

### 6.1 尽量不要多人同时改这些文件

- `flutter/lib/routing/app_router.dart`
- `web/src/components/shared/navigation.ts`
- `CHANGELOG.md`
- `docs/开发进度.md`

这些建议：

- 页面主体先各自做
- 路由和文档最后合并时再处理

### 6.2 最适合并行拆分的写法

一个窗口一个页面：

- 窗口 A：资产页
- 窗口 B：数据页
- 窗口 C：贷款页

每个窗口主要改自己页面目录：

```text
flutter/lib/features/assets/
flutter/lib/features/data_management/
flutter/lib/features/loans/
```

这样冲突最少。

### 6.3 提交顺序建议

建议每个页面都拆成两段提交：

1. 页面主体和数据层
2. 路由、预览入口、文档

这样即使合并冲突，也更容易处理。

---

## 11. 资产页迁移模板

下面用资产页举例。

### 7.1 旧页面位置

```text
web/src/app/(dashboard)/assets/page.tsx
web/src/features/assets/components/themes/DefaultAssets.tsx
```

### 7.2 Flutter 新页面位置

```text
flutter/lib/features/assets/data/assets_repository.dart
flutter/lib/features/assets/presentation/assets_page.dart
```

### 7.3 Flutter 路由

```text
flutter/lib/routing/app_router.dart
```

新增：

- `/assets`

### 7.4 Web 预览入口

```text
web/src/app/flutter/[[...slug]]/page.tsx
```

### 7.5 预览访问路径

```text
/flutter/assets
```

### 7.6 旧页面处理原则

- 旧资产页先不删
- 旧资产页先不替换
- 新资产页先通过预览路由对照开发

---

## 12. 数据页迁移模板

数据页也是同一套套路。

### 8.1 旧页面位置

```text
web/src/app/(dashboard)/data/page.tsx
```

### 8.2 Flutter 新页面位置

```text
flutter/lib/features/data_management/
```

### 8.3 预览入口

```text
web/src/app/flutter/[[...slug]]/page.tsx
```

### 8.4 预览访问路径

```text
/flutter/data
```

---

## 13. 消费页迁移模板

消费页是最难的，建议放在后面。

### 9.1 旧页面位置

```text
web/src/app/(dashboard)/consumption/page.tsx
web/src/features/consumption/
```

### 9.2 Flutter 新页面位置

```text
flutter/lib/features/consumption/
```

### 9.3 预览入口

```text
web/src/app/flutter/[[...slug]]/page.tsx
```

### 9.4 特别注意

消费页迁移不要一口气做完：

1. 先做筛选和列表
2. 再做统计卡
3. 再做简单图表
4. 最后做复杂图表

---

## 14. 哪些事现在绝对不要做

迁页面时，下面这些先别碰：

- 不要删旧页面
- 不要直接替换旧路由
- 不要重写全局主题系统
- 不要顺手大改后端
- 不要为了一个页面改整个导航体系
- 不要一上来追求 100% 像素级还原

---

## 15. 完成一个页面后，要给我什么结果

如果你在别的窗口迁了一个页面，最后至少给我这几个结果：

1. 旧页面路径
2. 新 Flutter 页面路径
3. 新预览路由
4. 涉及的接口列表
5. 是否已通过：
   - `flutter analyze`
   - `npm run build`

这样我后面帮你收口和正式替换时会快很多。

---

## 16. 最后一句建议

如果你要并行迁页面，就把每个页面都当成一个独立小项目：

- 先找旧页
- 再写 Flutter 页
- 再加 embed 路由
- 再加 web 预览入口
- 最后验证新旧并行

按这套模板走，速度会比“想到哪改到哪”快很多，也不容易把目录改乱。
