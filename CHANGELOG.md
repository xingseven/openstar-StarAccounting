# Changelog

## 2.3.79 - 2026-04-05

### Changed

- **总览页正式改为 Dashboard 文件名路由**:
  - 新增 `web/src/app/(dashboard)/[dashboardEntry]/page.tsx`，使总览页可直接通过 `/<Dashboard文件名>` 访问，例如 `/DefaultDashboard`。
  - `web/src/app/(dashboard)/page.tsx` 改为根入口页，加载后会按当前主题自动跳转到对应的 Dashboard 文件名路由。
  - 侧边栏、移动端底部导航、页内搜索和路由预热同步适配新的总览路由，不再依赖页面提示条。

### Docs

- **主题开发文档同步更新**:
  - `docs/主题开发框架文档.md` 小版本升级到 `v2.1.5`。
  - 补充说明总览页现已直接使用 `/<Dashboard文件名>` 路由，`/` 只作为自动跳转入口。

### Verified

- `npm.cmd run typecheck`

## 2.3.78 - 2026-04-05

### Changed

- **总览页文件名提示改为路由内联展示**:
  - `web/src/app/(dashboard)/page.tsx` 将右下角悬浮提示改为页面顶部的内联提示条，避免遮挡总览页筛选按钮。
  - 继续保留当前 `themeId` 和实际命中的 Dashboard 文件名，方便直接从路由页定位对应总览文件。

### Docs

- **主题开发文档同步更新**:
  - `docs/主题开发框架文档.md` 小版本升级到 `v2.1.4`。
  - 说明当前提示已改为路由顶部内联展示，不再使用右下角浮层。

### Verified

- `npm.cmd run typecheck`

## 2.3.77 - 2026-04-05

### Changed

- **总览页改为页面可见显示当前 Dashboard 文件名**:
  - `web/src/app/(dashboard)/page.tsx` 新增开发态右下角 `Dashboard Source` 浮层，直接显示当前主题命中的总览文件名。
  - 浮层同时显示当前 `themeId`，方便确认“当前主题 -> 实际总览文件”的映射关系。

### Docs

- **主题开发文档同步更新**:
  - `docs/主题开发框架文档.md` 小版本升级到 `v2.1.3`。
  - 补充说明当前总览文件名现在会在开发环境中直接显示在页面右下角。

### Verified

- `npm.cmd run typecheck`

## 2.3.76 - 2026-04-05

### Changed

- **web 前端并回主仓库统一追踪**:
  - 将根仓库中的 `web` 从 gitlink 目录调整为普通受管目录，后续前端改动可直接随主仓库提交和推送。
  - 补齐根仓库对 `web/.next`、`web/playwright-report` 等前端产物的忽略规则，避免并仓后误提交构建输出。

### Docs

- **主题文档与版本记录同步**:
  - `docs/主题开发框架文档.md` 小版本升级到 `v2.1.2`，补充 `web/` 已并回主仓库统一管理的说明。
  - `docs/开发进度.md`、`CHANGELOG.md` 同步记录本次仓库结构调整。

### Verified

- `npm.cmd run typecheck`

## 2.3.75 - 2026-04-05

### Changed

- **总览路由补充当前 Dashboard 文件定位信息**:
  - `web/src/app/(dashboard)/page.tsx` 新增 `data-dashboard-entry-file`，可直接看到当前主题实际命中的总览文件名。
  - 路由入口同时引入 `getDashboardEntryFileName(themeId)`，让“当前主题 -> 实际总览文件”的定位链路更直接。

### Docs

- **主题开发文档补充总览文件反查说明**:
  - `docs/主题开发框架文档.md` 升级到 `v2.1 / v2.1.1`。
  - 补充 `page.tsx -> getDashboardEntryFileName(themeId) -> DASHBOARD_ENTRY_FILES -> [ThemeName]Dashboard.tsx` 的查找路径。

### Verified

- `npm.cmd run typecheck`
- `npm.cmd run build` 失败：Next.js 在预渲染 `/_global-error` 时抛出 `Expected workUnitAsyncStorage to have a store`

## 2.3.74 - 2026-04-05

### Changed

- **主题系统改为三层分发架构**:
  - 新增 `web/src/themes/theme-manifest.ts`，将 Dashboard 变体、Header、Sidebar、移动端导航和主题预览风格统一收口到接线层。
  - 新增 `web/src/themes/dashboard-registry.tsx`，集中管理 Dashboard 动态加载注册表，移除总览页入口中的长串主题条件分支。
  - `web/src/components/shared/Header.tsx`、`web/src/components/shared/Sidebar.tsx`、`web/src/components/shared/MobileBottomNav.tsx` 与 `web/src/app/(dashboard)/themes/page.tsx` 改为优先读取 manifest，而不是继续直接判断主题名。

### Docs

- **主题开发文档同步升级**:
  - 重写 `docs/主题开发框架文档.md`，正式切换为 `token -> manifest -> registry -> shared pages / dedicated overrides` 的说明方式。
  - 补充新增主题步骤、共享页拆分边界、Dashboard 注册规则和反模式清单。

### Verified

- `npm.cmd run typecheck`
- `npm.cmd run build`

## 2.3.73 - 2026-04-04

### Fixed

- **修复DustyBlueDashboard构建错误**:
  - 修复 `web/src/features/dashboard/components/themes/DustyBlueDashboard.tsx` 中的语法错误。
  - 修复 categories useMemo 中未闭合的 if 语句，添加缺失的 return 语句和依赖数组。
  - 解决 "Expected ',', got '<eof>'" 构建错误。

### Verified

- TypeScript类型检查通过，无错误

## 2.3.72 - 2026-04-04

### Modified

- **默认主题总览页面"近期收支"模块改为交易明细表**:
  - 更新 `src/features/dashboard/components/themes/DefaultDashboard.tsx`，将IncomeExpenseCard组件从收支概览改为交易明细表。
  - 显示最近5条交易记录，包含交易类型、分类、时间、商户、金额和平台信息。
  - 使用卡片式布局，每条记录显示收入/支出图标、分类标签、时间戳和金额。
  - 支持空状态展示，当没有交易记录时显示友好的提示信息。
  - 添加"查看全部"按钮，方便用户跳转到消费页面查看完整记录。
  - 删除不再使用的getMonthOverMonthMeta函数和MOM_BADGE_CLASS常量。

### Verified

- TypeScript类型检查通过，无错误

## 2.3.71 - 2026-04-04

### Modified

- **默认主题总览页面图表功能完善**:
  - 更新 `src/features/dashboard/components/themes/DefaultDashboard.tsx`，将原本为空壳展示的图表进一步开发为具有实际功能的可视化模块。
  - 改进消费构成图表的模拟数据为中文，提升用户体验。
  - 新增月度收支趋势图表，展示近6个月的收入、支出和结余变化趋势，使用折线图实现。
  - 新增资产负债比例可视化，使用饼图展示资产与负债的对比，并显示负债率指标。
  - 新增储蓄进度可视化，显示本月储蓄率评估，包括进度条和储蓄流入流出情况。
  - 优化预算执行情况展示，添加BudgetFocusPanel组件，展示需要优先处理的预算项。
  - 所有图表均支持响应式设计，在移动端和桌面端都有良好的展示效果。

### Verified

- TypeScript类型检查通过，无错误

## 2.3.70 - 2026-04-04

### Modified

- **高级分析总览页补全真实图表内容**:
  - 更新 `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`，将原本为空壳/乱码的“重复消费”分析卡片改为“重复商户与集中度总览”。
  - 新增 4 个总览指标卡，展示重复商户占比、头部商户占比、前三商户占比、头部分类占比。
  - 将原单一镜像图扩展为双图联动布局，左侧展示高频重复商户，右侧展示消费集中度拆解，形成更完整的高级分析总览视图。
  - 空数据场景改为统一空状态组件，提升无数据时的可理解性与页面完成度。

### Verified

- `npm run typecheck`

## 2.3.69 - 2026-04-04

### Modified

- **默认主题侧边栏改为参考图风格**:
  - 调整 `web/src/components/shared/Sidebar.tsx`，将默认侧边栏改为更窄的悬浮白色圆角面板，顶部加入独立返回圆钮，整体贴近参考图的层次与比例。
  - 重做导航项激活态与悬停态，激活项改为蓝色渐变胶囊高亮，普通项改为轻量留白样式，并将末尾两个功能项下沉到底部形成分组布局。

### Verified

- `npm run typecheck`
- `npm run build`
## 2.3.68 - 2026-04-04

### Modified

- **?????????????**:
  - ? `web/src/features/dashboard/components/themes/DefaultDashboard.tsx` ???????????????????????????????????????????
  - ???????????????????????????????????????????????????

### Verified

- ????????????????????

## 2.3.67 - 2026-04-04

### Modified

- **姒傝鍗″彸渚ц秼鍔垮浘杩涗竴姝ョ畝鍖?*:
  - 鍘绘帀 `web/src/features/dashboard/components/themes/DefaultDashboard.tsx` 涓瑙堝崱鍙充晶瓒嬪娍鍥剧殑鍦嗙偣涓庢湀浠芥枃瀛椼€?
  - 浠呬繚鐣欑嚎鏉′笌闈㈢Н灞傦紝璁╁崱鐗囧彸鍗婅竟鏇存帴杩戠函瑁呴グ鍨嬭秼鍔垮浘銆?

### Verified

- `npm run typecheck`
- `npm run build`

## 2.3.66 - 2026-04-04

### Modified

- **姒傝鍗℃敼涓哄乏鏂囧彸鍥剧粨鏋?*:
  - 璋冩暣 `web/src/features/dashboard/components/themes/DefaultDashboard.tsx` 涓瑙堝崱甯冨眬锛屽皢鍥炬爣绉诲姩鍒板乏涓婅锛屾枃妗堥泦涓湪宸︿晶銆?
  - 灏嗗崱鐗囧唴閮ㄨ秼鍔垮浘浠庡簳閮ㄦ暣琛屽竷灞€鏀逛负鍙冲崐杈瑰睍绀猴紝鏁翠綋鏇存帴杩戞渶鏂板弬鑰冨浘鐨勬瀯鍥炬柟寮忋€?

### Verified

- `npm run typecheck`
- `npm run build`

## 2.3.65 - 2026-04-04

### Modified

- **璧勯噾璧板娍鏀逛负绾櫧鍙傝€冨崱鐗囬鏍?*:
  - 灏?`web/src/features/dashboard/components/themes/DefaultDashboard.tsx` 涓€滆祫閲戣蛋鍔库€濆浘琛ㄥ鍣ㄤ粠钃濈豢姘涘洿搴曞垏鎹负绾櫧鍗＄墖鏍峰紡锛屽苟澧炲姞鍙充笂瑙掕交閲忕瓫閫夎兌鍥娿€?
  - 鍥捐〃鍐呴儴閲嶅仛涓烘祬钃濄€佹繁钃濄€佺豢鑹蹭笁灞傛煍鍜岄潰绉姌绾垮彔鍔狅紝鏁翠綋鏇存帴杩戞渶鏂板弬鑰冨浘鐨勭畝娲佷华琛ㄧ洏琛ㄧ幇銆?

### Verified

- `npm run typecheck`
- `npm run build`

## 2.3.64 - 2026-04-04

### Modified

- **璧勯噾璧板娍鎶樼嚎鍥炬敼涓哄弬鑰冨浘椋庢牸**:
  - 閲嶅仛 `web/src/features/dashboard/components/themes/DefaultDashboard.tsx` 涓€滆祫閲戣蛋鍔库€濆浘琛ㄥ鍣紝鍔犲叆钃濈豢娓愬彉鑳屾櫙銆侀珮鍏夊眰涓庢洿鏌斿拰鐨勫浘琛ㄦ壙杞藉尯銆?
  - 鏀跺叆涓庢敮鍑轰袱鏉￠潰绉姌绾挎敼涓烘洿鎺ヨ繎鍙傝€冨浘鐨勫灞傛尝宄版晥鏋滐紝骞跺悓姝ヨ皟鏁村潗鏍囪酱銆佺綉鏍肩嚎涓?tooltip 鐨勬祬鑹叉偓娴牱寮忋€?

### Verified

- `npm run typecheck`
- `npm run build`

## 2.3.63 - 2026-04-04

### Modified

- **姒傝鍗¤秼鍔垮浘绉婚櫎鏌辩姸鍧楄〃杈?*:
  - 鍘绘帀 `web/src/features/dashboard/components/themes/DefaultDashboard.tsx` 涓崱鐗囪秼鍔垮浘閲岀殑鏌辩姸鍧椾笌杩炴帴鍧楋紝浠呬繚鐣欐姌绾裤€佽妭鐐广€侀潰绉眰鍜屾湀浠芥爣绛俱€?
  - 璁╁噣璧勪骇銆佸偍钃勩€佽礋鍊哄拰棰勭畻棰勮鍗＄墖缁熶竴鏀逛负鏇寸函绮圭殑瓒嬪娍绾垮睍绀猴紝閬垮厤缁х画鍑虹幇鏌辩姸鍥捐鎰熴€?

### Verified

- `npm run typecheck`
- `npm run build`

## 2.3.62 - 2026-04-04

### Modified

- **姒傝鍗￠珮搴︽彁鍗囧苟鍒囨崲涓烘渶杩?3 涓湀瓒嬪娍鍥?*:
  - 鎻愰珮 `web/src/features/dashboard/components/themes/DefaultDashboard.tsx` 涓洓寮犳瑙堝崱鐨勯珮搴︼紝缁欏唴閮ㄨ秼鍔垮浘鐣欏嚭鏇村畬鏁寸殑灞曠ず鍖哄煙銆?
  - 灏嗗崱鐗囧唴鐨勫井鍥捐〃鏀逛负鏈€杩?3 涓湀鐨勬姌绾跨€戝竷瓒嬪娍锛屽苟鍦ㄥ簳閮ㄨˉ鍏呮湀浠芥爣绛俱€?
- **鍗＄墖寰浘琛ㄧ粨鏋勫崌绾?*:
  - 鍘熷厛浠呮帴鍙楀綊涓€鍖栨暟鍒楃殑寰浘琛紝鏀逛负鎺ユ敹鈥滄湀浠?+ 鏁板€?+ 褰掍竴鍖栧€尖€濈殑瓒嬪娍鏁版嵁缁撴瀯銆?
  - SVG 娓叉煋鍚屾澧炲姞鎶樼嚎鑺傜偣銆侀潰绉眰鍜屾洿娓呮櫚鐨勭€戝竷鍧楄繛鎺ワ紝璁╄蛋鍔胯〃杈炬洿鐩磋銆?

### Verified

- `npm run typecheck`
- `npm run build`

## 2.3.61 - 2026-04-04

### Modified

- **鎬昏姒傝鍗″姞鍏ョ€戝竷鎰熷井鍨嬪浘琛?*:
  - 鍦?`web/src/features/dashboard/components/themes/DefaultDashboard.tsx` 鐨勫洓寮犳瑙堝崱鍐呴儴鍔犲叆鐎戝竷鍧?+ 瓒嬪娍绾垮彔鍔犵殑寰瀷鍥捐〃銆?
  - 鍥捐〃璺熼殢褰撳墠钃濈豢涓婚鍗＄墖閰嶈壊锛岀櫧鑹插崱鐗囧垯浣跨敤鏇磋交鐨勯潚鐏拌壊绾挎潯锛屼繚鎸佹暣浣撻鏍间竴鑷淬€?
- **鍗＄墖淇℃伅瀵嗗害杩涗竴姝ユ彁鍗?*:
  - 鏂板姒傝鍗″井鍥捐〃鏁版嵁鐢熸垚閫昏緫锛岃鍑€璧勪骇銆佸偍钃勩€佽礋鍊哄拰棰勭畻棰勮鍗＄墖鍦ㄤ笉澧炲姞澶ч噺鏂囧瓧鐨勫墠鎻愪笅鎻愪緵瓒嬪娍鎰熴€?

### Verified

- `npm run typecheck`
- `npm run build`

## 2.3.60 - 2026-04-04

### Modified

- **鎬昏椤甸噸鍋氫负钃濈豢鑹茶交閲忓伐浣滃彴**:
  - 灏嗘闈㈢鍚庡彴甯冨眬璋冩暣涓虹函鐧戒晶杈规爮銆佹祬鐏颁富宸ヤ綔鍖哄拰鍙充笂瑙掕交閲忛《鏍忥紝鍘绘帀鍘熷厛鍖呰９寮忛《閮ㄦ浣撱€?
  - 閲嶅仛 `web/src/features/dashboard/components/themes/DefaultDashboard.tsx`锛屾妸棣栭〉鏀逛负瓒嬪娍鍥俱€佺粨鏋勫浘銆佹瑙堝崱鍜屼氦鏄撹〃缁勫悎鐨勪华琛ㄧ洏甯冨眬銆?
- **鍚庡彴璇存槑鏂囨鏁翠綋鏀跺彛**:
  - `ThemeSectionHeader` 涓嶅啀娓叉煋澶ф鎻忚堪鏂囨湰锛屼粎淇濈暀鏍囬鍜屾搷浣滃叆鍙ｃ€?
  - 渚ц竟鏍忚彍鍗曞幓鎺夐€愰」璇存槑 caption锛屽噺灏戞瘡涓〉闈㈤《閮ㄥ拰瀵艰埅鍖虹殑鍐椾綑浠嬬粛鏂囧瓧銆?
- **榛樿涓婚鏀逛负鏇存竻鐖界殑钃濈豢涓昏壊**:
  - 榛樿涓婚銆佸叏灞€鍥為€€鍙橀噺涓?dashboard 妯″潡寮鸿皟鑹插悓姝ヨ皟鏁翠负钃濈豢缁勫悎锛岀粺涓€娴呰壊宸ヤ綔鍙板眰娆°€?

### Verified

- `npm run typecheck`
- `npm run build`

## 2.3.59 - 2026-04-03

### Fixed

- **淇娑堣垂椤佃祫閲戞祦鍚戜笌浜ゆ槗鏄庣粏鍖虹殑鎹熷潖 JSX 鏂囨湰**:
  - 淇 `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` 涓祫閲戞祦鍚戙€?4 灏忔椂鏁ｇ偣鍥俱€侀噾棰濆垎甯冦€佷氦鏄撴槑缁嗙瓑鍖哄潡鐨勪贡鐮佹枃妗堛€?
  - 淇琚薄鏌撶殑鏍囬涓庤鏄庢枃鏈紝閬垮厤闂悎鏍囩缁х画琚牬鍧忓苟瑙﹀彂 `Unexpected token`銆?

### Verified

- `npm run build`

## 2.3.58 - 2026-04-03

### Fixed

- **淇娑堣垂椤靛晢鎴烽泦涓笌鍒嗘瀽鍗＄墖鍖虹殑鎹熷潖 JSX 鏂囨湰**:
  - 淇 `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` 涓晢鎴烽泦涓€佸钩鍙扮儹鍔涘垎甯冦€佸垎鏋愬崱鐗囪鍥剧瓑鍖哄煙鐨勪贡鐮佹枃妗堛€?
  - 鍚屾淇缁撴瀯鍥捐氨銆佺┖鐘舵€佽鏄庡拰鍒嗙粍鏍囬锛岄伩鍏嶆崯鍧忔枃鏈户缁牬鍧?JSX 鏍囩缁撴瀯骞惰Е鍙?`Unexpected token`銆?

### Verified

- `npm run build`

## 2.3.57 - 2026-04-03

### Fixed

- **淇娑堣垂椤靛浘琛ㄥ垎鏋愬尯鐨勬崯鍧忔ā鏉垮瓧绗︿覆涓?JSX 鏂囨**:
  - 淇 `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` 涓祿搴﹂暅鍍忓浘銆侀绠楀垎鏋愩€佸娉ㄦ礊瀵熴€佺儹鍔涙棩鍘嗙瓑鍖哄潡鐨勬崯鍧忓瓧绗︿覆銆?
  - 琛ュ叏浼氱洿鎺ョ牬鍧忚娉曠殑鏍囬銆佽鏄庛€佹暟缁勬爣绛句笌鏉′欢鏂囨锛屾秷闄?`Unterminated string constant` 绛夎繛缁瀯寤洪敊璇€?

### Verified

- `npm run build`

## 2.3.56 - 2026-04-03

### Fixed

- **淇娑堣垂椤电瓫閫夋诞灞備腑鐨勬崯鍧?JSX 鏂囨湰**:
  - 淇 `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` 涓瓫閫夊脊灞傛爣棰樸€佸壇鏍囬銆佸钩鍙?鏃堕棿鏂囨鐨勪贡鐮佹枃鏈€?
  - 娑堥櫎鎹熷潖鏂囨湰鐮村潖 JSX 缁撴瀯鍚庤Е鍙戠殑 `Unexpected token` 鏋勫缓閿欒銆?

### Verified

- `npm run build`

## 2.3.55 - 2026-04-03

### Fixed

- **淇娑堣垂椤佃嚜瀹氫箟鏃堕棿绛涢€夊尯鐨勬湭闂悎瀛楃涓?*:
  - 淇 `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` 涓嚜瀹氫箟鏃堕棿绛涢€夊尯鍩熺殑鎹熷潖鏂囨湰銆?
  - 琛ュ叏骞翠唤鍗犱綅鏂囨銆佹湀浠介€夐」涓庡勾鏈堝垏鎹㈡寜閽枃鏈紝娑堥櫎 `Unterminated string constant` 鏋勫缓閿欒銆?

### Verified

- `npm run build`

## 2.3.54 - 2026-04-03

### Fixed

- **淇娑堣垂椤垫噿鍔犺浇鍥捐〃缁勪欢娈嬬暀浠ｇ爜瀵艰嚧鐨勮娉曢敊璇?*:
  - 娓呯悊 `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` 涓?`LazyChart` 鍚庢柟娈嬬暀鐨勯噸澶?`return` 浠ｇ爜鍧椼€?
  - 绉婚櫎鏈畬鎴愮殑 `motion.div` 鍖呰娈嬬墖锛屾秷闄?`Return statement is not allowed here` 鏋勫缓閿欒銆?

### Verified

- `npm run build`

## 2.3.53 - 2026-04-03

### Fixed

- **淇娑堣垂椤典富棰樼粍浠朵腑鐨勯潪娉?import 婧愮爜**:
  - 淇 `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` 椤堕儴 import 琛岃璇啓鍏ョ殑杞箟寮曞彿涓?`` `n `` 瀛楃涓层€?
  - 娑堥櫎 Turbopack 鍦ㄨВ鏋愭秷璐归〉缁勪欢鏃剁殑 `Expected unicode escape` 鏋勫缓閿欒锛屾仮澶嶆秷璐归〉璺敱鐨勬甯哥紪璇戙€?

### Verified

- `npm run build`

## 2.3.52 - 2026-04-03

### Fixed

- **淇 3000 绔彛椤甸潰鍥犳簮鐮佺紪鐮佹崯鍧忓鑷寸殑杩愯鏃跺紓甯?*:
  - 淇 `web/src/app/globals.css` 涓崯鍧忕殑娉ㄩ噴瀛楃锛屾秷闄?Turbopack 鍦ㄨВ鏋愬叏灞€鏍峰紡鏃剁殑 UTF-8 鎶ラ敊銆?
  - 淇 `web/src/components/shared/Header.tsx`銆乣web/src/features/dashboard/components/themes/DefaultDashboard.tsx`銆乣web/src/app/(dashboard)/layout.tsx` 涓殑鎹熷潖瀛楃涓庡紓甯?JSX 鏂囨湰锛屾仮澶嶉椤典笌鐧诲綍椤电殑姝ｅ父缂栬瘧銆?
  - 娓呯悊 3000 绔彛娈嬬暀鐨勬棫 Next 杩涚▼骞堕噸鏂板惎鍔?`web` 鍓嶇锛岀‘璁ゅ綋鍓嶈闂殑灏辨槸 3000 绔彛瀹炰緥銆?

### Verified

- `http://localhost:3000` 璁块棶鎭㈠姝ｅ父锛屽苟閲嶅畾鍚戝埌鐧诲綍椤?
- 娴忚鍣ㄩ獙璇?3000 绔彛椤甸潰宸蹭笉鍐嶅嚭鐜?`useInsertionEffect` 鎶ラ敊

## 2.3.51 - 2026-04-03

### Fixed

- **淇鏍圭洰褰曟棫鐗?dashboard 妯℃澘瑙﹀彂 useInsertionEffect 杩愯鏃跺紓甯?*:
  - 绉婚櫎 [src/app/(dashboard)/template.tsx](file:///f:/1python/xiangmu/openstar-StarAccounting/src/app/\(dashboard\)/template.tsx) 涓 `framer-motion` 鐨勪緷璧栵紝閬垮厤鍦ㄦ棫鍏ュ彛琚惎鍔ㄦ椂瑙﹀彂 `Cannot read properties of null (reading 'useInsertionEffect')`銆?
  - 淇濈暀璇ユā鏉跨殑瀹瑰櫒鑱岃矗锛屼笉鍐嶈鏃х増鏍圭洰褰曞墠绔洜涓哄姩鐢诲寘瑁呰€屾彁鍓嶅湪瀹㈡埛绔繍琛屾椂宕╂簝銆?

### Verified

- `npx next build`
- 鏍圭洰褰?`npx next dev -p 3010` 鍚姩鎴愬姛锛屾祻瑙堝櫒鎵撳紑棣栭〉鍚庢湭鍐嶅嚭鐜?`useInsertionEffect` 鎶ラ敊

## 2.3.50 - 2026-04-03

### Modified

- **榛樿涓婚浠庢殩鐧藉鍙ゆ劅璋冩暣涓虹幇浠ｅ喎鐧介**:
  - 榛樿涓婚涓昏壊浠庣背妫曘€佸湡榛勩€佸鍙ゆ殩鐧藉垏鎹负鍐风櫧銆佹祬闆剧伆銆侀潧钃濈偣缂€锛屾暣浣撴洿娓呯埥銆佹洿骞磋交銆?
  - 涓婚娉ㄥ唽琛ㄣ€佸叏灞€ CSS 鍙橀噺涓庡叡浜富棰樺師璇悓姝ユ敼鑹诧紝淇濈暀绠€绾︾粨鏋勪絾绉婚櫎鈥滃亸鏃р€濈殑瑙嗚姘旇川銆?
- **棣栭〉閰嶈壊杩涗竴姝ュ勾杞诲寲**:
  - 棣栭〉鎬昏鍗°€佹敹鏀瑙堛€佸浘琛ㄥ拰浜ゆ槗鍒楄〃鏀圭敤闈涜摑銆佽杽鑽风豢銆佺強鐟氭銆佹祬绱仛浣庨ケ鍜屽己璋冭壊銆?
  - 淇濈暀娴呰壊鑳屾櫙鍜屾竻鐖藉眰娆★紝鍚屾椂閬垮厤榛戣壊銆佹瘺鐜荤拑銆侀潚鑹蹭笌澶嶅彜鍦熻壊銆?

### Verified

- `npm run typecheck`
- `npm run build`

## 2.3.49 - 2026-04-03

### Modified

- **榛樿涓婚閲嶅仛涓烘殩鐧界畝绾﹂**:
  - 榛樿涓婚涓庡叏灞€鏍峰紡鍙橀噺鏁翠綋浠庡喎钃濈鎶€椋庡垏鎹负鏆栫櫧銆佺背鐏般€佽摑鐏扮偣缂€鐨勭畝绾︽柟妗堬紝鍘绘帀澶ч潰绉潚钃濊鎰熴€?
  - 鍏变韩涓婚鍘熻鍚屾鏀剁揣鍦嗚銆佸幓闄よ楗版€ф瘺鐜荤拑鍜岃繃寮烘偓娴劅锛屾敼涓烘洿杞荤殑杈规銆侀槾褰卞拰鍒嗗眰鐣欑櫧銆?
- **棣栭〉鎬昏妯″潡瑙嗚閲嶆帓**:
  - 鎬昏 Hero銆佺粺璁″崱銆佹敹鏀崱銆佸浘琛ㄦ彁绀鸿壊鍜屾渶杩戜氦鏄撳尯鏀逛负浣庨ケ鍜岄厤鑹诧紝淇濈暀灞傛浣嗗噺灏戞ā鏉挎劅銆?
  - 渚ц竟鏍忋€侀《閮ㄦ爮鍜岀Щ鍔ㄥ簳閮ㄥ鑸悓姝ユ崲鎴愭洿瀹夐潤鐨勬祬搴曞鑸瑷€锛屽己鍖栤€滅畝绾︿絾涓嶅崟璋冣€濈殑鏁翠綋缁熶竴鎰熴€?

### Verified

- `npm run typecheck`
- `npm run build`

## 2.3.48 - 2026-04-01

### Fixed

- **鏍圭洰褰?npm 鑴氭湰鎭㈠鎸囧悜鏃х増 web 椤圭洰**:
  - package.json 涓殑 dev:web 鏀逛负鏄惧紡杩涘叆 web 鐩綍鍐嶅惎鍔?next dev锛岄伩鍏嶆牴鐩綍鎵ц鏃惰璺戝埌浠撳簱鏍规湰韬€?
  - build銆乻tart銆乴int銆乼ypecheck銆乼est:e2e 涓?test:e2e:ui 涔熷悓姝ユ敼涓轰唬鐞嗗埌 web锛岃鏍圭洰褰?npm 鍛戒护閲嶆柊瀵瑰簲鏃х増鍓嶇銆?
  - dev:legacy 鍚屾澶嶇敤淇鍚庣殑 dev:web锛岄伩鍏嶇户缁繚鐣欓敊璇惎鍔ㄨ矾寰勩€?

### Verified

- 鏍圭洰褰曟墽琛?npm run typecheck 宸叉仮澶嶄负璋冪敤 web 鐨?TypeScript 鏍￠獙閾捐矾銆?

## 2.3.47 - 2026-04-01

### Modified

- **娓呯悊宸插簾寮冨墠绔縼绉昏褰曚笌涓存椂杩滅鍒嗘敮**:
  - 鍒犻櫎浠撳簱鍐呭凡搴熷純鐨勪笓椤瑰紑鍙戞枃妗ｄ笌瀵瑰簲鍘嗗彶鐗堟湰璁板綍锛岄伩鍏嶅悗缁户缁弬鑰冩棤鏁堣縼绉绘柟妗堛€?
  - 浠庝富鐗堟湰璁板綍涓庡紑鍙戣繘搴︿腑绉婚櫎瀵瑰簲闃舵鏉＄洰锛屼繚鐣欏綋鍓嶄粛鏈夋晥鐨勭増鏈紨杩涗俊鎭€?
  - 娓呯悊瀵瑰簲鐨勮繙绔复鏃跺垎鏀紝閬垮厤 GitHub 涓婄户缁繚鐣欏凡搴熷純鐨勮瘯楠屾€ф彁浜ゅ叆鍙ｃ€?

## 2.3.29 - 2026-03-31

### Modified

- **椤甸潰鍒囨崲棰勭儹涓庤矾鐢辨彁閫?*:
  - 鏂板 `DashboardRouteWarmup`锛岀櫥褰曞悗鎸変紭鍏堢骇绌洪棽棰勫彇鎬昏銆佹秷璐广€佽祫浜с€佸偍钃勩€佽捶娆惧拰鏁版嵁椤佃矾鐢憋紝鍑忓皯鐐瑰嚮鍚庣殑绛夊緟鏃堕棿銆?
  - 棰勭儹浼氭牴鎹綉缁滅姸鍐佃嚜鍔ㄦ敹鏁涳紝寮辩綉鐜鍙繚鐣欓珮浼樺厛绾ч槦鍒楋紝閬垮厤鏃犲樊鍒姠鍗犲甫瀹姐€?
- **涓婚〉闈㈡暣椤靛姞杞介摼璺敹绐?*:
  - 鎬昏銆佽祫浜с€佸偍钃勩€佽捶娆鹃〉闈㈠彇娑堟暣椤典富棰樼骇 `dynamic(..., { ssr: false })`锛屾妸涓婚〉闈?UI 浠ｇ爜鎻愬墠绾冲叆璺敱璧勬簮銆?
  - 娑堣垂涓庤捶娆鹃〉闈㈢户缁繚鐣欏浘琛ㄥ簱鎸夐渶鍧楋紝閬垮厤涓轰簡鍒囬〉浼樺寲鎶婃墍鏈夐噸鍥捐〃渚濊禆涓€娆℃€у鍥炰富鍖呫€?
- **椤甸潰鏁版嵁鐑紦瀛樻帴鍏?*:
  - 鏂板閫氱敤 `warm-cache` 鍜岄〉闈㈢骇 data loader锛屼负鎬昏銆佹秷璐广€佽祫浜с€佸偍钃勩€佽捶娆炬彁渚涚煭鏃剁儹缂撳瓨涓庣┖闂查鍙栵紝鍑忓皯閲嶅 loading 澹冲拰鎺ュ彛寰€杩斻€?
  - `npm run typecheck` 涓?`npm run build` 宸查€氳繃锛岀‘璁ゆ湰杞紭鍖栧彲姝ｅ父鏋勫缓銆?

## 2.3.23 - 2026-03-31

### Modified

- **鏁版嵁椤靛伐浣滃尯閲嶆帓**:
  - 椤堕儴鏀逛负鈥滄€昏褰曟暟 + 璐﹀崟瀵煎叆鈥濆悓鎺掑睍绀猴紝鍑忓皯閲嶅淇℃伅鍧椼€?
  - PC 绔繘涓€姝ユ暣鐞嗕负鍙屽垪宸ヤ綔鍖猴紝宸︿晶鏀炬€昏褰曟暟涓庢墜鍔ㄨˉ褰曪紝鍙充晶鏀捐处鍗曞鍏ヤ笌鑷姩褰掔被锛屾暣浣撻槄璇昏矾寰勬洿娓呮櫚銆?
- **AI 椤甸潰浜や簰鏀跺彛**:
  - 椤堕儴瀵艰埅鏍忔敼涓虹洿鎺ユ樉绀衡€淎I 妯″瀷閰嶇疆鈥濓紝鍒犻櫎椤甸潰鍐呴儴閲嶅鐨勫ぇ鏍囬妯″潡銆?
  - 宸查厤缃ā鍨嬩腑鐨勯娇杞彍鍗曚慨澶嶈鍒囬棶棰橈紝鑿滃崟椤逛繚鎸佸崟琛屾樉绀猴紝閰嶇疆寮瑰眰鍐呭鍖烘敮鎸佹粴鍔ㄣ€?
- **寮瑰眰涓庡垎鏋愮粨鏋滃姩鏁堜紭鍖?*:
  - 搴曢儴婊戝嚭椤垫敼涓烘洿椤烘粦鐨勪笂婊戣繘鍏ヤ笌涓嬫粦閫€鍑猴紝閬僵涓庨潰鏉胯繃娓¤妭濂忕粺涓€銆?
  - 娑堣垂椤?AI 鍒嗘瀽鍗″湪鍒濆鎬併€佸姞杞芥€併€侀敊璇€佸拰缁撴灉鎬佷箣闂磋ˉ榻愭笎鍏ユ笎鍑鸿繃娓★紝鍑忓皯纭垏鎹㈡劅銆?

## 2.3.22 - 2026-03-30

### Modified

- **娑堣垂椤佃鍒欏娉ㄥ垎鏋愭敹鍙?*:
  - 灏嗘秷璐归〉鈥滆鍒欏娉ㄢ€濈粺璁℃暣鍚堜负鍗曞紶鍒嗘瀽鍗★紝缁熶竴灞曠ず瑕嗙洊缁熻銆佸娉ㄩ噾棰濆垎甯冧笌 Top 澶囨敞鎺掕銆?
  - 瑙勫垯澶囨敞鍥捐〃鏀逛负浼樺厛鎸夎嚜鍔ㄥ綊绫昏鍒欓噷鐨勫娉ㄦ垨瑙勫垯鍚嶈仛鍚堬紝涓嶅啀鐩存帴娣峰叆鍘熷璁㈠崟鎻忚堪銆?
- **璺ㄩ〉闈氦鏄撴槑缁嗘牱寮忕粺涓€**:
  - 鎶界鍏变韩鐨勭揣鍑戝瀷鍗曡娴佹按琛岀粍浠讹紝骞剁粺涓€搴旂敤鍒版秷璐广€佹€昏銆佸偍钃勪笌鏁版嵁椤甸潰鐨勬槑缁嗗尯銆?
  - 娑堣垂椤靛簳閮ㄦ祦姘存敼涓轰粎灞曠ず鏈€杩?5 鏉★紝鏁翠綋鍒楄〃鍘嬬缉涓哄垎鍓茬嚎鏍峰紡锛屽噺灏戦〉闈㈢旱鍚戝崰鐢ㄣ€?
- **娑堣垂椤电粏鑺備慨姝?*:
  - 淇娑堣垂鏃ュ巻鎸夋湀瑙嗗浘涓湀浠藉悗缂€涔辩爜闂銆?
  - 娑堣垂椤靛簳閮ㄦ祦姘存椂闂存敼涓烘洿鏄撹鐨勬湰鍦扮煭鏍煎紡鏄剧ず銆?

## 2.3.21 - 2026-03-30

### Added

- **闈?Docker 鑷姩閮ㄧ讲閾捐矾**:
  - 鏂板 `.github/workflows/deploy-non-docker.yml`锛屽湪 `main` 鍒嗘敮鎺ㄩ€佸悗鍙嚜鍔ㄦ牎楠屽苟閫氳繃 SSH 鎵ц杩滅▼閮ㄧ讲銆?
  - 鏂板 `src/server/scripts/deploy-linux.sh` 涓?`src/server/scripts/deploy-windows.ps1`锛岀粺涓€ Linux / Windows 鏈嶅姟鍣ㄤ笂鐨勬媺鍙栥€佹瀯寤恒€丳M2 閲嶅惎涓庡仴搴锋鏌ユ祦绋嬨€?
  - 鏂板 `docs/闈濪ocker鑷姩閮ㄧ讲寮€鍙戞枃妗?md`锛屾暣鐞嗙洰鏍囥€佸墠缃潯浠躲€丼ecrets 瑙勫垝涓庤剼鏈亴璐ｈ竟鐣屻€?

### Modified

- **璐﹀崟瀵煎叆鎸夎鍗曞彿寮虹害鏉熷幓閲?*:
  - 寰俊璐﹀崟鎸夆€滀氦鏄撳崟鍙封€濄€佹敮浠樺疂璐﹀崟鎸夆€滀氦鏄撹鍗曞彿鈥濇槧灏?`orderId`锛屽鍏ユ椂缂哄皯璁㈠崟鍙风殑璁板綍鐩存帴璁颁负鏃犳晥琛屻€?
  - 瀵煎叆闃舵缁х画鎸?`orderId` 璺宠繃鏁版嵁搴撳凡瀛樺湪璁板綍涓庡悓鎵规枃浠跺唴閲嶅璁板綍锛岀‘淇濆悓涓€璁㈠崟涓嶄細閲嶅鍏ュ簱銆?
- **鏁版嵁椤靛垎绫荤洰褰曚笌褰曞叆寤鸿鑱斿姩**:
  - 鏂板 `web/src/lib/transaction-categories.ts`锛岀粺涓€缁存姢鏀跺叆/鏀嚭鍒嗙被鐩綍骞跺鐢ㄥ埌鏁版嵁椤典笌娑堣垂椤点€?
  - 鏁版嵁椤垫墜鍔ㄨˉ褰曘€佹壒閲忔敼鍒嗙被銆佽嚜鍔ㄥ綊绫昏鍒欏垱寤轰笌瀵煎叆瀹屾垚鍚庝細鍚屾鍒锋柊鍒嗙被鐩綍锛岃緭鍏ユ鏀寔鐩存帴鑱旀兂鏈€杩戠湡瀹炲垎绫汇€?
- **娑堣垂椤佃鍒欏娉ㄥ垎鏋愬寮?*:
  - 娑堣垂鍒嗘瀽鏂板鈥滆鍒欏娉ㄢ€濈粺璁°€乀op 澶囨敞涓庨噾棰濆垎甯冿紝浼樺厛灞曠ず鑷姩褰掔被瑙勫垯娌夋穩涓嬫潵鐨勫浐瀹氬満鏅敮鍑恒€?
  - 浜ゆ槗鏄庣粏鏀寔鎼滅储澶囨敞锛屽苟鏂板鈥滃彧鐪嬫湁澶囨敞鈥濈瓫閫夛紝渚夸簬蹇€熷鏌ュ凡鏍囨敞娴佹按銆?
  - 浜ゆ槗鏄庣粏鏃堕棿鏀逛负 `MM-DD HH:mm` 鐨勭煭鏍煎紡鏄剧ず锛屽噺灏戦暱鏃堕棿涓插绐勫睆鍒楄〃鐨勬尋鍘嬨€?
- **AI 妯″瀷閰嶇疆鍐呭瓨妯″紡琛ラ綈**:
  - `/api/ai/models` 鍦ㄦ棤鏁版嵁搴撴椂琛ラ綈鍐呭瓨鎬佺殑澧炲垹鏀规煡涓庨粯璁ゆā鍨嬭鍙栭€昏緫锛屼笉鍐嶅嚭鐜板垪琛ㄥ彲鎵撳紑浣嗗垱寤虹洿鎺?500 鐨勬儏鍐点€?

### Fixed

- **鎬昏璧勪骇缁熻閬垮厤閲嶅璁＄畻鍌ㄨ搫**:
  - 鎬昏椤垫眹鎬绘€昏祫浜ф椂锛屽凡鍚屾鍒拌祫浜ц处鎴风殑鍌ㄨ搫鐩爣涓嶅啀閲嶅鍙犲姞鍒拌祫浜у悎璁°€?
- **璧勪骇椤典笌鍌ㄨ搫椤电┖鏁版嵁鍥為€€淇**:
  - 璧勪骇椤点€佸偍钃勯〉鍦ㄧ湡瀹炵┖鏁版嵁鎴栨帴鍙ｅ姞杞藉け璐ユ椂涓嶅啀寮鸿鍥為€€ mock 鏁版嵁锛屾敼涓鸿繑鍥炵┖鍒楄〃骞跺睍绀虹湡瀹炵┖鎬併€?

## 2.3.20 - 2026-03-29

### Fixed

- **鍓嶇鏋勫缓鎭㈠**:
  - 娓呴櫎 `web/package.json` 鐨?BOM 骞叉壈骞剁‘璁ゆ枃浠跺彲姝ｅ父瑙ｆ瀽銆?
  - 淇 `SavingsGoalDialog` 涓?`SavingsPlanDialog` 涓洜涔辩爜涓庡潖瀛楃涓插鑷寸殑璇硶鎹熷潖锛屾仮澶?`web/` 鏋勫缓閾捐矾銆?

## 2.3.19 - 2026-03-29

### Modified

- **澶嶈喘涓庨泦涓害鍥炬爣绛捐鍒囦慨姝?*:
  - 缁х画璋冩暣娑堣垂椤碘€滃璐笌闆嗕腑鈥濇ā鍧椾腑闆嗕腑搴︽潯褰㈠浘鐨勫彸渚х暀鐧戒笌 X 杞磋寖鍥达紝纭繚鍙充晶鐧惧垎姣旀爣绛惧畬鏁存樉绀恒€?

## 2.3.18 - 2026-03-29

### Modified

- **娑堣垂鍥捐〃绉诲姩绔竷灞€瀵归綈 PC**:
  - 灏嗏€滄敮浠樻笭閬撳崰姣斺€濆拰鈥滄湰鏈熸敹鍏ヤ笌鏀嚭鈥濅袱寮犲崱鐗囧湪绉诲姩绔篃鏀逛负鍥捐〃鍦ㄥ乏銆佽鏄庡湪鍙崇殑鍙屽垪甯冨眬銆?
  - 绉诲姩绔浘琛ㄥ昂瀵稿悓姝ユ敹绐勫埌 `84px`锛屽湪淇濈暀鍙充晶鏂囧瓧鍙鎬х殑鍓嶆彁涓嬪敖閲忚创杩?PC 鐗堥槄璇绘柟寮忋€?
- **娑堣垂骞冲彴 Logo 澶栧湀杈规绉婚櫎**:
  - 鍘绘帀鏀粯瀹濄€佸井淇″強榛樿骞冲彴鍥炬爣澶栧眰鐨?`ring` 鎻忚竟锛屼繚鐣欐贰鑹插簳鎵橈紝鍑忓皯寰芥爣鍖哄煙鐨勮瑙夊共鎵般€?
- **娑堣垂骞冲彴 Logo 搴曟墭绉婚櫎**:
  - 杩涗竴姝ュ幓鎺夋敮浠樺疂銆佸井淇″強榛樿骞冲彴鍥炬爣澶栧眰鐨勬祬鑹插渾瑙掑簳鎵橈紝浠呬繚鐣?logo 鏈綋涓庡崰浣嶅昂瀵搞€?
- **娑堣垂鐑尯鐭╅樀楂樺害鍘嬬缉**:
  - 鍘嬬缉鈥滃钩鍙?脳 鍒嗙被鈥濈儹鍖虹煩闃电殑鏍囩鍒楀銆佽闂磋窛鍜屽崟鍏冩牸楂樺害锛屽噺灏戣妯″潡鍦ㄩ〉闈腑鐨勭旱鍚戝崰鐢ㄣ€?
- **娑堣垂鍥捐〃鍙充笂瑙掑厓绱犳竻鐞?*:
  - 鍘绘帀娑堣垂椤靛悇鍥捐〃鍗＄墖鍙充笂瑙掔殑鍥炬爣銆佺粺璁¤兌鍥婂拰鏃堕棿鑳跺泭锛岀粺涓€鏀舵暃鍥捐〃鏍囬鍖恒€?
- **娑堣垂鐑尯鐭╅樀涓庢棩鍘嗗渾瑙掓敹鏁?*:
  - 鏀剁揣鈥滃钩鍙?脳 鍒嗙被鈥濆拰鈥滄秷璐规棩鍘嗏€濆崟鍏冩牸鍦嗚锛岄伩鍏嶅湪绉诲姩绔帇缂╁搴﹀悗鍑虹幇鑳跺泭鍜屾き鍦嗚鎰熴€?
- **娑堣垂鍥捐〃鍒楄〃鏍峰紡鍚戞€昏椤靛榻?*:
  - 灏嗘秷璐归〉鈥滃钩鍙板垎甯冣€濆拰鈥滄敹鏀姣斺€濅袱寮犲浘琛ㄦ敼鎴愪笌鎬昏椤碘€滆繎鏈熸秷璐规瀯鎴愨€濅竴鑷寸殑宸﹀浘鍙充晶鍦嗚淇℃伅琛屽竷灞€銆?
  - 鍘绘帀鏀舵敮瀵规瘮涓殑妯悜杩涘害鏉★紝缁熶竴涓烘洿绠€娲佺殑鏁板€煎垪琛ㄥ紡琛ㄨ揪銆?
- **娑堣垂鏃ュ巻 PC 绔瓧浣撳寮?*:
  - 鎻愰珮娑堣垂鏃ュ巻鍦?PC 绔殑鏃ユ湡鍜岄噾棰濆瓧鍙凤紝澧炲己鏂瑰潡鍐呮暟鍊肩殑鍙鎬с€?
- **娑堣垂浜ゆ槗鏄庣粏涔辩爜淇**:
  - 淇娑堣垂椤靛簳閮ㄤ氦鏄撴槑缁嗗崱鐗囦腑鈥滄敹鍏?/ 鏀嚭鈥濈姸鎬佹枃妗堢殑涔辩爜鏄剧ず闂銆?
- **娑堣垂鍒嗘瀽缁村害鎵归噺鎵╁睍**:
  - 涓烘秷璐归〉鏂板娑堣垂灞炴€с€佸繀瑕?鍙€夈€佽祫閲戞€ц川銆侀珮棰戝晢鎴?璁㈤槄銆侀绠楀亸宸€侀珮宄板満鏅€佸懆鏈亸濂姐€佸ぇ棰濋璀﹀拰娑堣垂闆嗕腑搴︾瓑澶氱粍鍒嗘瀽缁村害銆?
  - 鎵╁睍 `/api/consumption/dashboard` 鑱氬悎缁撴灉涓?mock 鏁版嵁锛屼娇鏂板鍒嗘瀽妯″潡鍦ㄧ湡瀹炴暟鎹拰婕旂ず鏁版嵁涓嬮兘鑳藉睍绀恒€?
- **娑堣垂鍒嗘瀽缁村害鍥捐〃鍖栨敹鏁?*:
  - 灏嗏€滄洿澶氬垎鏋愮淮搴︹€濅粠淇℃伅鍗″垪琛ㄦ敼涓哄皯閲忓浘琛ㄥ崱锛岀粺涓€鏀舵垚缁撴瀯瑙嗗浘銆佸璐笌闆嗕腑搴︺€侀绠椾笌椋庨櫓銆佸満鏅亸濂藉洓缁勫浘琛ㄩ潰鏉裤€?
- **娑堣垂鍒嗘瀽鏉″舰鍥炬爣绛鹃槻瑁佸垏**:
  - 璋冩暣棰勭畻鍋忓樊銆佸ぇ棰濋璀︺€佹椂娈电儹鐐广€佸懆鏈亸濂界瓑鏉″舰鍥剧殑鍙充晶鐣欑櫧鍜?X 杞磋寖鍥达紝閬垮厤鏁板€兼爣绛捐秴鍑哄鍣ㄣ€?

## 2.3.17 - 2026-03-28

### Modified

- **涓婚棰滆壊灞傜骇澧炲己**:
  - 鍏变韩涓婚鍘熻鏂板妯″潡鑹叉澘鍙橀噺锛屾敮鎸佹寜妯″潡瑕嗙洊 Hero銆丼urface銆丮etric Card 鐨勬祬鑹插彔灞備笌杈规寮鸿皟銆?
  - 浠〃鐩樸€佹秷璐广€佽祫浜с€佽捶娆俱€佸偍钃勫垎鍒紩鍏ュ喎钃濄€侀潚缁裤€侀潧绱€佹殩閾溿€佺俊缈犱簲缁勬ā鍧椾富鑹诧紝寮卞寲鈥滄暣绔欎竴寮犲簳鏉库€濈殑瑙傛劅銆?
  - 鍚屾璋冩暣鍏抽敭涓绘寜閽€佽繘搴︽潯銆佸窘鏍囧拰灞€閮ㄩ珮浜紝璁╀笉鍚屼笟鍔℃ā鍧楀湪棣栧睆灏辫兘鎷夊紑瑙嗚鍙嶅樊銆?
- **涓婚鍘绘瘺鐜荤拑鍖栨敹鏁?*:
  - 榛樿涓婚鍜屼富棰樻敞鍐岃〃鏁翠綋鍒囨崲涓烘洿鎵庡疄鐨勫疄鑹插鍣紝闄嶄綆鍗婇€忔槑鑳屾櫙銆佹ā绯婂彔灞傚拰鐜荤拑鎰熻〃闈€?
  - 鍏变韩 `ThemeHero / ThemeSurface / ThemeMetricCard` 鏀逛负浼樺厛浣跨敤绾壊搴曞拰娓呮櫚杈规锛屾ā鍧楄壊浠呬繚鐣欏湪杈规銆佹寜閽笌寮鸿皟鍧椼€?
  - 浠〃鐩樸€佹秷璐广€佽祫浜х瓑椤电Щ闄や富瑕佹ā绯婂厜鏂戙€佸崐閫忔槑娴崱鍜?`backdrop-blur` 绛涢€夋诞灞傦紝浣跨晫闈㈡洿鍏嬪埗銆?

## 2.3.16 - 2026-03-29

### Added

- **鏁版嵁椤垫柊澧炰氦鏄撳鏂硅嚜鍔ㄥ綊绫昏鍒?*:
  - 鏀寔浠庝氦鏄撳鏂瑰幓閲嶅垪琛ㄤ腑鎼滅储銆佸嬀閫夊苟鎵归噺寤虹珛瑙勫垯銆?
  - 瑙勫垯鍙粦瀹氬埌鎴跨绛夎嚜瀹氫箟鍒嗙被锛屽苟鍙€夌粺涓€澶囨敞涓庡洖濉巻鍙蹭氦鏄撱€?

### Modified

- **浜ゆ槗鍏ュ簱娴佺▼鎺ュ叆鑷姩褰掔被**:
  - 鎵嬪姩鏂板浜ゆ槗銆佽处鍗曞鍏ュ拰 APP 鍚屾鎺ㄩ€侀兘浼氭寜浜ゆ槗瀵规柟瑙勫垯鑷姩濂楃敤鍒嗙被銆?
  - 鍚庣画鏂板鍚屼竴浜ゆ槗瀵规柟鐨勬敮鍑烘椂锛屾棤闇€鍐嶆鎵嬪姩鏀瑰垎绫汇€?
- **AI 妯″瀷閰嶇疆鍒囨崲鍒板綋鍓嶈处鎴蜂綔鐢ㄥ煙**:
  - 淇 AI 椤甸潰娣诲姞澶фā鍨嬫椂鍥?`accountId` 鍐欏叆閿欒瀵艰嚧鍙彁绀衡€滃垱寤哄け璐モ€濈殑闂銆?
  - AI 妯″瀷鍒楄〃銆佹洿鏂般€佸垹闄や互鍙婇粯璁ゆā鍨嬭鍙栭€昏緫缁熶竴鎸夊綋鍓嶈处鎴烽殧绂汇€?
- **AI 椤甸潰姒傝鍗＄墖鍦?PC 绔粺涓€鍗曡**:
  - 妯″瀷鎬绘暟銆佸凡閰嶇疆銆佹湭閰嶇疆鍜屽姛鑳借鏄庡洓涓ā鍧楀湪澶у睆涓嬫敼涓哄悓涓€琛屽睍绀恒€?

## 2.3.15 - 2026-03-25

### Added

- **璐锋椤垫柊澧炲巻鍙茶繕娆炬壂鎻忚兘鍔?*:
  - 姣忕瑪璐锋鍙富鍔ㄦ壂鎻忓綋鍓嶈处鎴蜂笅宸插鍏ョ殑鍘嗗彶杩樻浜ゆ槗銆?
  - 鍖归厤鎴愬姛鍚庝細涓烘棫浜ゆ槗琛ヤ笂 `loanId`锛屽苟鎸夊凡璇嗗埆鐨勮繕娆捐褰曢噸绠楄捶娆惧墿浣欓噾棰濅笌宸茶繕鏈熸暟銆?

### Modified

- **鏁版嵁绠＄悊椤垫墜鍔ㄥ綍鍏ュ崌绾т负鏀跺叆 / 鏀嚭鍙屾ā寮?*:
  - 鏂板鈥滃綍鍏ユ敹鍏?/ 褰曞叆鏀嚭鈥濇寜閽垏鎹€?
  - 鏀寔浜戦棯浠樸€侀摱琛屽崱銆佺幇閲戠瓑鏃犳硶瀵煎嚭鐨勬秷璐规墜鍔ㄨˉ褰曘€?
  - 鏀嚭鍒嗙被琛ュ厖鈥滆繕娆?/ 淇＄敤鍗¤繕娆?/ 璐锋杩樻 / 杞处鏀嚭鈥濈瓑閫夐」銆?
- **淇＄敤鍊熻繕瀵煎叆璇嗗埆澧炲己**:
  - 寰俊鈥滀俊鐢ㄥ崱杩樻鈥濅氦鏄撳鍏ユ椂璇嗗埆涓?`REPAYMENT`銆?
  - 鏀粯瀹濃€滀俊鐢ㄥ€熻繕鈥濅腑鐨勮繕娆?/ 褰掕繕 / 鏀炬绫昏褰曚細璇嗗埆涓?`REPAYMENT / TRANSFER`銆?
  - 娑堣垂椤靛钩鍙版槧灏勮ˉ鍏呪€滈摱琛屽崱 / 鐜伴噾鈥濓紝閬垮厤鎵嬪姩褰曞叆鍚庢樉绀轰负鈥滃叾浠栤€濄€?

## 2.3.14 - 2026-03-25

### Added

- **鏁版嵁绠＄悊椤垫柊澧炴墜鍔ㄦ敹鍏ヨˉ褰曡〃鍗?*:
  - 鏂板鈥滈摱琛屽崱鏀跺叆鈥濇墜鍔ㄨˉ褰曞尯锛屾敮鎸佽褰曞伐璧勩€佸閲戙€佹姤閿€绛夋棤娉曚粠閾惰鍗¤处鍗曡嚜鍔ㄥ鍏ョ殑鏀跺叆銆?
  - 鏀寔濉啓閲戦銆佸叆璐︽椂闂淬€佹敹鍏ュ垎绫汇€佸叆璐﹀钩鍙般€佹潵婧?/ 鍙戞斁鏂瑰拰澶囨敞銆?
  - 淇濆瓨鍚庝細鑷姩鍒锋柊鏁版嵁绠＄悊鍒楄〃锛屼究浜庡揩閫熸牎瀵规敹鏀钩琛°€?

### Modified

- **浜ゆ槗鎺ュ彛缁熶竴鍒囨崲鍒板綋鍓嶈处鎴蜂綔鐢ㄥ煙**:
  - `GET /api/transactions`
  - `POST /api/transactions`
  - `PUT /api/transactions/:id`
  - `DELETE /api/transactions/:id`
  - `POST /api/transactions/batch`
  - 涓婅堪鎺ュ彛鏀逛负缁熶竴浣跨敤 `requireAccountId`锛岄伩鍏嶄氦鏄撴暟鎹彧鎸夌敤鎴风淮搴﹁鍐欒€屽拷鐣ュ綋鍓嶈处鎴枫€?

## 2.3.13 - 2026-03-25

### Modified

- **绉诲姩绔富棰樺崱鐗囩户缁噺璐?*:
  - 鍏变韩涓婚澹冲眰銆佹彁绀恒€佽〃鍗曞尯銆佸伐鍏锋爮鍦ㄧЩ鍔ㄧ杩涗竴姝ュ急鍖栬竟妗嗗拰闃村奖锛屽噺灏戔€滄瘡灞傞兘鎻忚竟鈥濈殑鑷冭偪鎰熴€?
  - 鍌ㄨ搫椤典笌璐锋椤电殑涓氬姟鍗＄墖缁х画鍘嬪钩鍐呴儴缁撴瀯锛屽噺灏戝祵濂楁ā鍧楁暟閲忥紝骞剁粺涓€绉诲姩绔瓧鍙峰眰绾с€?
  - 璐锋椤典笌鍌ㄨ搫椤靛湪绉诲姩绔敼涓衡€滄牳蹇冨垪琛ㄤ紭鍏堛€佸垎鏋愭ā鍧楀悗缃€濈殑闃呰椤哄簭锛岄灞忔洿鑱氱劍銆?
- **璐锋椤靛浘琛ㄥ彲璇绘€т慨姝?*:
  - 灏嗏€滆繕娆捐繘搴︹€濆浘琛ㄥ浘渚嬬Щ鍔ㄥ埌椤堕儴銆?
  - 閲嶆柊璋冩暣鍥捐〃缃戞牸鐣欑櫧锛岄伩鍏嶅浘渚嬩笌 X 杞村钩鍙板悕绉伴噸鍙犮€?

## 2.3.12 - 2026-03-24

### Added

- **鏂板涓婚楠屾敹鏍锋湰** **`terracotta`**:
  - 鍦?`web/src/themes/registry.ts` 鏂板璧ら櫠涓婚锛岃ˉ榻愬畬鏁翠富棰樺彉閲忋€?
  - 涓婚涓績鑷姩灞曠ず鏂颁富棰橈紝鏃犻渶淇敼涓婚椤甸€昏緫锛屽畬鎴愨€滄柊澧炰富棰樻棤闇€閫愰〉鏀逛唬鐮佲€濈殑楠屾敹銆?

### Modified

- **涓婚绯荤粺鏀跺熬骞剁户缁笅娌夊叡浜?UI primitive**:
  - 灏?AI銆佽祫浜с€侀绠椼€佽捶娆俱€佽缃€佺櫥褰曘€佹敞鍐屻€佹暟鎹鐞嗐€佽繛鎺ョ瓑椤甸潰鐨勮〃鍗曘€佹彁绀轰笌鎿嶄綔鍖虹户缁敹鍙ｅ埌 shared primitive銆?
  - 鍦?`web/src/components/shared/theme-primitives.tsx` 涓ˉ鍏呰緭鍏ユ銆佷笅鎷夈€佸琛岃緭鍏ャ€佺櫧搴曟寜閽€佸浘鏍囨寜閽€佸垪琛ㄩ」鍜岀姸鎬佸３瀛愮瓑鍏变韩甯搁噺銆?
  - 缁х画娓呯悊涓婚缁勪欢涓暎钀界殑閲嶅鏍峰紡锛屼娇璧勪骇銆佹秷璐广€佸偍钃勩€佽捶娆剧瓑涓婚椤电粺涓€渚濊禆鍏变韩鏍峰紡灞傘€?
- **鍏ㄩ噺鍓嶇鏍￠獙閾捐矾鎭㈠涓洪€氳繃鐘舵€?*:
  - 淇 `ClientOnly`銆乣AuthGate`銆乣Skeletons`銆乣dashboard/page.tsx`銆乣assets/page.tsx`銆乣savings/page.tsx`銆乣public/sw.js` 绛夊巻鍙?lint/typecheck 闂銆?
  - 鏈钀藉湴鍚?`npm run lint`銆乣npm run typecheck`銆乣npm run build` 鍧囬€氳繃銆?

## 2.3.11 - 2026-03-24

### Modified

- **鎬昏椤佃祫閲戜綋妫€鏀逛负鍚屾鎸囨爣鍗℃牱寮?*:
  - 鍘绘帀璧勯噾浣撴鐨勫ぇ妯″潡瀹瑰櫒銆佹爣棰樺尯鍜屾繁鑹插垎灞傛牱寮?
  - 灏嗚礋鍊哄崰姣斻€侀绠楅璀︺€佸偍钃勫噣娴佸叆鏀逛负涓庨《閮ㄤ笁寮犳牳蹇冨崱鐗囦竴鑷寸殑鎸囨爣鍗℃牱寮?
  - 淇濇寔璇ョ粍鍗＄墖缁х画浣嶄簬鈥滄€昏祫浜?/ 鎬昏礋鍊?/ 鍌ㄨ搫鍑€娴佸叆鈥濅笅鏂癸紝鏁翠綋鏀规垚瑙勬暣鐨勬í鍚戝崱鐗囨帓甯?

## 2.3.10 - 2026-03-24

### Modified

- **鎬昏椤佃祫閲戜綋妫€妯″潡璋冩暣浣嶇疆涓庡竷灞€**:
  - 灏嗘€昏椤碘€滆祫閲戜綋妫€鈥濇ā鍧楃Щ鍔ㄥ埌椤堕儴涓夊紶鏍稿績鎸囨爣鍗＄墖涓嬫柟
  - 璧勯噾浣撴鐨勪笁寮犳礊瀵熷崱鍦ㄤ腑绛夊強浠ヤ笂灞忓箷鏀逛负涓€琛屼笁鍒楀睍绀?
  - 淇濇寔鍘熸湁鏁版嵁璁＄畻涓庣姸鎬佹彁绀洪€昏緫涓嶅彉锛屼粎璋冩暣灞曠ず灞傜骇涓庢帓鐗堣妭濂?

## 2.3.9 - 2026-03-24

### Modified

- **搴曢儴寮瑰眰琛ㄥ崟鏍峰紡缁х画缁熶竴**:
  - 璐锋椤甸潰鐨勬柊澧炶捶娆惧拰鐧昏杩樻搴曢儴寮瑰眰缁熶竴浣跨敤涓婚鎿嶄綔鏍?
  - 鍌ㄨ搫鐩爣鍒涘缓娴佺▼鐨勫簳閮ㄥ姩浣滃尯缁熶竴鎺ュ叆涓婚鎿嶄綔鏍?
  - 鍌ㄨ搫鍙栨寮瑰眰鐨勬彁绀哄尯銆佽〃鍗曞尯鍜屾搷浣滃尯缁熶竴鎺ュ叆涓婚鏍峰紡
  - 绉诲姩绔〃鍗曞姩浣滃尯瑙嗚涓庡綋鍓嶄富棰橀鏍间繚鎸佷竴鑷?

## 2.3.8 - 2026-03-24

### Added

- **鍏充簬椤甸潰鏂板缁熶竴鏇存柊涓績**:
  - 鏂板鏇存柊妫€鏌ユ帴鍙ｄ笌涓嬭浇浠ｇ悊鎺ュ彛
  - 鏂板缃戠珯鏈湴鏇存柊娓呭崟 `web/public/updates/latest.json`
  - 鏂板 `docs/鏇存柊鍙戝竷涓庨暅鍍忚鏄?md`
  - 鏂板 `docs/APP绔洿鏂板彂甯冨噯澶囨竻鍗?md`

### Modified

- **鍏充簬椤甸潰鍗囩骇涓虹粺涓€鏇存柊鍏ュ彛**:
  - 缃戦〉绔敮鎸佲€滃埛鏂板苟鏇存柊鈥?
  - App 绔敮鎸侀€氳繃鍚庣浠ｇ悊涓嬭浇瀹夎鍖?
  - 鍓嶇涓嶅啀鐩存帴渚濊禆 GitHub锛屾敼涓虹綉绔欓暅鍍忎紭鍏堛€丟itHub 澶囩敤
- **绉诲姩绔鑸笌澶撮儴浜や簰缁х画浼樺寲**:
  - 搴曢儴婊戝姩瀵艰埅杩涗竴姝ョ缉灏忓昂瀵?
  - 椤堕儴瀵艰埅鏀寔涓嬫粦闅愯棌銆佷笂婊戞樉绀?
  - 缁х画鍘嬬缉绉诲姩绔《閮ㄥ鑸爮楂樺害涓庢帶浠跺昂瀵?

## 2.3.7 - 2026-03-23

### Added

- **鏂板鍏ㄥ眬涓婚绯荤粺涓庝富棰樻敞鍐屼腑蹇?*:
  - 鏂板 `web/src/themes/registry.ts`锛岄泦涓畾涔変富棰樺厓淇℃伅銆佷富棰橀瑙堜互鍙婂叏灞€ CSS 鍙橀噺鏄犲皠銆?
  - 鏂板 `web/src/components/shared/theme-provider.tsx`锛屾敮鎸佷富棰樼姸鎬佺鐞嗐€佹湰鍦版寔涔呭寲涓庡叏灞€鍙橀噺娉ㄥ叆銆?
  - 鏂板 `web/src/components/shared/theme-primitives.tsx`锛屾娊璞?`ThemeHero`銆乣ThemeSurface`銆乣ThemeDarkPanel`銆乣ThemeSectionHeader`銆乣ThemeMetricCard` 绛夊叡浜富棰樼粍浠躲€?
  - 涓婚涓績椤?`web/src/app/(dashboard)/themes/page.tsx` 鍗囩骇涓虹湡姝ｇ殑鍏ㄥ眬涓婚鍒囨崲鍏ュ彛锛屾敮鎸佸垏鎹㈠悗鍗虫椂浣滅敤浜庢暣濂?dashboard UI銆?

### Modified

- **Dashboard 鍖哄煙椤甸潰涓婚缁熶竴鎺ュ叆鍏变韩妗嗘灦**:
  - 灏嗘€昏銆佽祫浜с€佹秷璐广€佸偍钃勩€佽捶娆俱€佽缃€佽繛鎺ャ€佹暟鎹鐞嗐€佸悗鍙扮鐞嗐€佸叧浜庛€丄I 閰嶇疆椤甸潰鎺ュ叆鍏变韩涓婚 primitive锛屽噺灏戦€愰〉纭紪鐮佹牱寮忋€?
  - 灏?`Header`銆乣Sidebar`銆乣Dashboard Layout` 缁熶竴鏀逛负璇诲彇涓婚鍙橀噺锛岀‘淇濆鑸€佸唴瀹瑰３灞備笌椤甸潰鍗＄墖鍚屾鍒囨崲銆?
  - 璁╂柊澧炰富棰樻椂涓嶅啀闇€瑕侀€愰〉閲嶅啓 UI锛屽彧闇€琛ュ厖涓婚閰嶇疆鍗冲彲瀹屾垚鍏ㄥ眬鍒囨崲銆?
- **涓婚绯荤粺鍩虹鍙橀噺鎺ュ叆鍏ㄥ眬鏍峰紡灞?*:
  - 鍦?`web/src/app/globals.css` 涓柊澧?`theme-*` 绯诲垪 CSS 鍙橀噺榛樿鍊笺€?
  - `Providers` 鎺ュ叆 `ThemeProvider`锛屾暣涓簲鐢ㄥ湪鏍圭骇鍒寕杞戒富棰樹笂涓嬫枃銆?

### Modified Files

1. `web/src/themes/registry.ts` - 涓婚娉ㄥ唽涓績涓庝富棰橀璁?
2. `web/src/components/shared/theme-provider.tsx` - 涓婚 Provider 涓庡垏鎹㈤€昏緫
3. `web/src/components/shared/theme-primitives.tsx` - 鍏变韩涓婚鍩虹缁勪欢
4. `web/src/app/providers.tsx` - 鎺ュ叆鍏ㄥ眬涓婚涓婁笅鏂?
5. `web/src/app/globals.css` - 澧炲姞鍏ㄥ眬涓婚 CSS 鍙橀噺
6. `web/src/app/(dashboard)/themes/page.tsx` - 涓婚涓績椤垫敼涓哄叏灞€鍒囨崲鍏ュ彛
7. `web/src/components/shared/Header.tsx` - 椤堕儴瀵艰埅鎺ュ叆涓婚鍙橀噺
8. `web/src/components/shared/Sidebar.tsx` - 渚ц竟瀵艰埅鎺ュ叆涓婚鍙橀噺
9. `web/src/app/(dashboard)/layout.tsx` - Dashboard 澶栧３鎺ュ叆涓婚鍙橀噺
10. `web/src/features/dashboard/components/themes/DefaultDashboard.tsx` - 鎬昏椤垫帴鍏ュ叡浜富棰樼粍浠?
11. `web/src/features/assets/components/themes/DefaultAssets.tsx` - 璧勪骇椤垫帴鍏ュ叡浜富棰樼粍浠?
12. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` - 娑堣垂椤垫帴鍏ュ叡浜富棰樼粍浠?
13. `web/src/features/savings/components/themes/DefaultSavings.tsx` - 鍌ㄨ搫椤垫帴鍏ュ叡浜富棰樼粍浠?
14. `web/src/features/loans/components/themes/DefaultLoans.tsx` - 璐锋椤垫帴鍏ュ叡浜富棰樼粍浠?
15. `web/src/app/(dashboard)/settings/page.tsx` - 璁剧疆椤典富棰樼粺涓€
16. `web/src/app/(dashboard)/data/page.tsx` - 鏁版嵁绠＄悊椤典富棰樼粺涓€
17. `web/src/app/(dashboard)/admin/page.tsx` - 鍚庡彴绠＄悊椤典富棰樼粺涓€
18. `web/src/app/(dashboard)/about/page.tsx` - 鍏充簬椤典富棰樼粺涓€涓庡唴瀹归噸鏋?
19. `web/src/app/(dashboard)/ai/page.tsx` - AI 妯″瀷閰嶇疆椤典富棰樼粺涓€
20. `web/src/app/(dashboard)/connections/page.tsx` - 杩炴帴椤垫部鐢ㄥ叡浜富棰樹綋绯?

## 2.3.6 - 2026-03-23

### Added

- **鏂板 APP 浜ゆ槗鍚屾鎺ュ彛涓庡紑鍙戞枃妗?*:
  - 鏂板 `GET /api/sync/transactions/pull`锛屾敮鎸?App 鎸夋父鏍囧閲忔媺鍙栦氦鏄?
  - 鏂板 `POST /api/sync/transactions/push`锛屾敮鎸?App 鎵归噺涓婅浜ゆ槗骞舵寜 `orderId` 鍋氱涓€鐗堝箓绛?
  - 鏂板 `docs/APP浜ゆ槗鍚屾鎺ュ彛寮€鍙戞枃妗?md`锛屾暣鐞嗗悓姝ヨ姹傘€佸搷搴斻€侀檺鍒朵笌鍚庣画鎵╁睍鏂瑰悜
- **鏂板鏁版嵁搴撶粨鏋勬牳瀵规姤鍛?*:
  - 鏂板 `docs/鏁版嵁搴撶粨鏋勬牳瀵规姤鍛?md`
  - 璁板綍褰撳墠瀹為檯鏁版嵁搴撲笌 Prisma 妯″瀷鐨勬牳瀵圭粨鏋滐紝纭鐜伴樁娈典笉缂鸿〃銆佷笉缂哄瓧娈点€佷笉缂哄閿?

### Modified

- **杩炴帴楠岃瘉鐮佹敼涓哄搱甯屼繚瀛?*:
  - `appconnection.otpCode` 涓嶅啀淇濆瓨鏄庢枃楠岃瘉鐮侊紝鏀逛负淇濆瓨甯﹀瘑閽ョ殑 SHA-256 鍝堝笇鍊?
  - Web 绔敓鎴愯繛鎺ョ爜鏃跺彧鍚戝墠绔繑鍥炰竴娆℃槑鏂?OTP锛屾暟鎹簱鍐呬笉鍐嶈惤鏄庢枃
  - App 鎻愪氦楠岃瘉鐮佹椂锛屾湇鍔＄瀵硅緭鍏ュ€煎仛鍚屾牱鍝堝笇鍚庡啀鏍￠獙锛屾彁鍗囪繛鎺ョ粦瀹氬畨鍏ㄦ€?
  - 楠岃瘉閫昏緫鍏煎鏃х殑鏄庢枃 OTP 璁板綍锛岄伩鍏嶅崌绾у悗宸叉湁鏈繃鏈熼獙璇佺爜鐩存帴澶辨晥

### Modified Files

1. `src/server/src/main.ts` - 浜ゆ槗鍚屾鎺ュ彛涓庤繛鎺ラ獙璇佺爜鍝堝笇淇濆瓨
2. `docs/APP杩炴帴鍔熻兘寮€鍙戞枃妗?md` - 鏇存柊 OTP 瀛樺偍涓庢牎楠岃鏄?
3. `docs/APP浜ゆ槗鍚屾鎺ュ彛寮€鍙戞枃妗?md` - APP 鍚屾鎺ュ彛璇存槑
4. `docs/鏁版嵁搴撶粨鏋勬牳瀵规姤鍛?md` - 鏁版嵁搴撶粨鏋勬牳瀵圭粨璁?

## 2.3.5 - 2026-03-23

### Added

- **鏂板 APP 杩炴帴鍔熻兘寮€鍙戞枃妗?*:
  - 鏂板 `docs/APP杩炴帴鍔熻兘寮€鍙戞枃妗?md`
  - 姊崇悊 Web 绔敓鎴愯繛鎺ョ爜銆丄pp 绔?OTP 楠岃瘉銆佽澶囦护鐗屼笌鍚庣画鑱旇皟娓呭崟
  - 鏄庣‘ `generate / verify / devices / revoke` 鍥涗釜杩炴帴鎺ュ彛鐨勮姹備笌杩斿洖缁撴瀯

### Modified

- **杩炴帴椤甸噸鏋勪负鍙仈璋冪殑璁惧缁戝畾宸ヤ綔鍙?*:
  - 杩炴帴椤佃ˉ榻愪腑鏂囩晫闈€侀獙璇佺爜灞曠ず銆佹湇鍔″櫒鍦板潃銆侀獙璇佽矾寰勩€佸€掕鏃朵笌澶嶅埗鎿嶄綔
  - 澧炲姞 App 瀵规帴璇存槑鍖猴紝鐩存帴灞曠ず `POST /api/connect/verify` 鐨勮姹備綋绀轰緥
  - 澧炲姞杩炴帴鐘舵€佽疆璇紝褰撳墠楠岃瘉鐮佽 App 鎴愬姛楠岃瘉鍚庯紝椤甸潰浼氳嚜鍔ㄥ垏鎹负鈥滃凡瀹屾垚缁戝畾鈥?
  - 宸叉巿鏉冭澶囧垪琛ㄦ敮鎸佸埛鏂颁笌鎾ら攢锛屾挙閿€鍚庤澶囦护鐗岀珛鍗冲け鏁?
- **杩炴帴鍚庣鎺ュ彛琛ラ綈鐢ㄤ簬 App 寮€鍙戠殑杩斿洖缁撴瀯**:
  - `POST /api/connect/generate` 鏂板杩斿洖 `connectionId`銆乣verifyPath`銆乣expiresInSeconds`
  - `POST /api/connect/verify` 鏂板杩斿洖 `tokenType`銆乣verifiedAt`
  - 杩炴帴璁板綍鏀逛负鎸?`accountId` 闅旂锛岄伩鍏嶅璐︽埛妯″紡涓嬭澶囦覆鍙?
  - 璁惧浠ょ墝 `dev-<connectionId>` 鎺ュ叆璁よ瘉娴佺▼锛屼究浜?App 鍚庣画鐩存帴鎼哄甫浠ょ墝璁块棶鎺ュ彛
  - `PUBLIC_IP` 鏈厤缃椂鑷姩浠庡綋鍓嶈姹傛帹瀵煎彲灞曠ず鐨勬湇鍔″櫒鍦板潃

### Modified Files

1. `docs/APP杩炴帴鍔熻兘寮€鍙戞枃妗?md` - APP 杩炴帴寮€鍙戣鏄?
2. `web/src/app/(dashboard)/connections/page.tsx` - 杩炴帴椤甸噸鏋?
3. `web/src/components/shared/navigation.ts` - 椤甸潰鏍囬涓庡鑸厓淇℃伅
4. `web/src/components/shared/Header.tsx` - 椤堕儴椤靛ご涓庣敤鎴疯彍鍗?
5. `web/src/components/shared/MobileSidebar.tsx` - 绉诲姩绔鑸?
6. `src/server/src/main.ts` - 杩炴帴鎺ュ彛涓庤澶囦护鐗岃璇?

## 2.3.4 - 2026-03-23

### Modified

- **椤圭洰鍚嶇О缁熶竴鏇存柊涓?* **`openstar-StarAccounting`**:
  - 鏇存柊鎵€鏈夐厤缃枃浠朵腑鐨勯」鐩悕绉板紩鐢紙package.json銆乴ayout.tsx銆乵anifest.json銆乨ocker-compose.yml绛夛級
  - 鏇存柊鍓嶇 UI 涓殑椤圭洰鏍囬锛圫idebar銆丄bout椤甸潰銆佽缃〉闈㈢瓑锛?
  - 鏇存柊鏂囨。涓殑椤圭洰鍚嶇О寮曠敤锛圧EADME.md銆佸紑鍙戣繘搴︽枃妗ｃ€乂2楂樼骇鍔熻兘鏂囨。绛夛級
  - 鏇存柊娴嬭瘯鏂囦欢涓殑榛樿鐢ㄦ埛鍚?
  - 鏇存柊 Docker 瀹瑰櫒鍚嶇О涓?`openstar-StarAccounting-*`
  - 鏇存柊 PWA manifest 鍜?Service Worker 缂撳瓨鍚嶇О
  - 鏇存柊鎵€鏈?GitHub 閾炬帴寮曠敤

### Modified Files

1. `package.json` - 椤圭洰鍚嶇О
2. `web/package.json` - 鍓嶇椤圭洰鍚嶇О
3. `src/server/package.json` - 鍚庣椤圭洰鍚嶇О
4. `web/src/app/layout.tsx` - 鍏冩暟鎹拰鏍囬
5. `web/src/components/shared/Sidebar.tsx` - 渚ц竟鏍忔爣棰?
6. `web/src/components/shared/PWARegister.tsx` - PWA 瀹夎鎻愮ず
7. `web/public/manifest.json` - PWA manifest
8. `web/public/sw.js` - Service Worker 缂撳瓨鍚嶇О
9. `docker-compose.yml` - Docker 瀹瑰櫒鍚嶇О
10. `README.md` - 椤圭洰鏂囨。鏍囬
11. `docs/V2楂樼骇鍔熻兘寮€鍙戞枃妗?md` - 鏂囨。鏍囬
12. `docs/鏁版嵁搴撻厤缃?md` - 鏁版嵁搴撻厤缃?
13. `docs/寮€鍙戣繘搴?md` - 绠＄悊鍛橀偖绠?
14. `web/src/app/(dashboard)/about/page.tsx` - 鍏充簬椤甸潰鏍囬
15. `web/src/app/(dashboard)/settings/page.tsx` - 璁剧疆椤甸潰搴曢儴
16. `web/public/test-api.html` - 娴嬭瘯椤甸潰榛樿閭
17. `web/public/offline.html` - 绂荤嚎椤甸潰鏍囬
18. `web/tests/budget.spec.ts` - 娴嬭瘯鏂囦欢榛樿閭

## 2.3.3 - 2026-03-22

### Bug Fixes

- **璐﹀崟瀵煎叆鏁版嵁缁熻淇**:
  - 淇浜嗗鍏ユ敮浠樺疂/寰俊璐﹀崟鏃讹紝鍥犲叏灞€鍞竴璁㈠崟鍙凤紙`orderId`锛夌害鏉熷鑷寸殑闈欓粯璺宠繃闂銆?
  - 淇浜嗛噸澶嶆暟鎹紙`duplicateCount`锛夌殑璁＄畻閫昏緫锛氱幇鍦ㄨ兘姝ｇ‘缁熻骞跺睍绀哄洜鏁版嵁搴撶害鏉熻€岃璺宠繃鐨勯噸澶嶆潯鐩暟銆?
  - 鎻愬崌浜嗗鍏ユ彁绀虹殑鍑嗙‘鎬э紝瑙ｅ喅浜嗗鍏ョ浉鍚屾枃浠舵椂鍑虹幇鈥滄垚鍔?0 鏉★紝閲嶅 0 鏉★紝鏃犳晥 0 鏉♀€濈殑璇鎬ф彁绀恒€?

## 2.3.2 - 2026-03-21

### Features

- **璐﹀崟瀵煎叆浼樺寲**:
  - 鍚庣鍔ㄦ€佽瘑鍒獵SV鍒楀悕琛岋紙鍓?0琛屾壂鎻忥級
  - 寰俊/鏀粯瀹濆垎鍒瘑鍒壒寰佸垪
  - 缁熶竴鍒嗙被锛?8绉嶆爣鍑嗗垎绫?
  - 缁熶竴鐘舵€侊細SUCCESS / FAILED / REFUND
  - 寰俊浜ゆ槗绫诲瀷鑷姩鏄犲皠鍒扮粺涓€鍒嗙被

### Modified Files

1. `src/server/src/etl/importCsv.ts` - 鏀硅繘鍒楀悕璇嗗埆绠楁硶
2. `src/server/src/etl/mapTransaction.ts` - 娣诲姞鍒嗙被/鐘舵€佹槧灏?

### New Files

1. `docs/璐﹀崟瀵煎叆浼樺寲.md` - 璁捐鏂囨。

## 2.3.1 - 2026-03-21

### Features

- **鏁版嵁绠＄悊椤甸潰**:
  - 鏂板 `/data` 璺敱锛屼晶杈规爮娣诲姞"鏁版嵁绠＄悊"鍏ュ彛
  - 鏀寔鎵归噺閫夋嫨銆佸垹闄ゃ€佷慨鏀逛氦鏄撹褰?
- **璐︽埛绠＄悊鍔熻兘**:
  - 璁剧疆椤甸潰鏂板"璐︽埛绠＄悊"妯″潡锛堜笁鍒楀竷灞€锛?
  - 鏀寔鍒涘缓鏂拌处鎴枫€佹煡鐪嬭处鎴峰垪琛ㄣ€佽缃粯璁よ处鎴?

### API

- `POST /api/accounts` - 鍒涘缓璐︽埛
- `GET /api/accounts` - 鑾峰彇璐︽埛鍒楄〃
- `PUT /api/accounts/:id/default` - 璁剧疆榛樿璐︽埛

### New Files

1. `web/src/app/(dashboard)/data/page.tsx` - 鏁版嵁绠＄悊椤甸潰

### Modified Files

1. `web/src/components/shared/Sidebar.tsx` - 娣诲姞鏁版嵁绠＄悊鍏ュ彛
2. `web/src/app/(dashboard)/settings/page.tsx` - 娣诲姞璐︽埛绠＄悊妯″潡
3. `src/server/src/main.ts` - 鏂板璐︽埛绠＄悊 API

## 2.3.0 - 2026-03-21

### Features

- **澶氳处鎴锋潈闄愮郴缁?*:
  - 鏂板 `account` 琛?- 璐︽埛淇℃伅
  - 鏂板 `account_member` 琛?- 鎴愬憳鍏崇郴涓庢潈闄愶紙鏀寔 OWNER/ADMIN/MEMBER 涓夌瑙掕壊锛?
  - 鎵€鏈変笟鍔¤〃鏂板 `accountId` 瀛楁锛屽疄鐜版暟鎹殧绂?
  - 鐢ㄦ埛 `defaultAccountId` 瀛楁鍏宠仈榛樿璐︽埛
  - `canViewOwn`/`canManageOwn`/`canViewAll`/`canManageAll` 缁嗙矑搴︽潈闄愭帶鍒?

### Database Changes

- 鏂板琛細`account`, `account_member`
- 淇敼琛細鎵€鏈変笟鍔¤〃鏂板 `accountId` 瀛楁
- 鏂板 `npm run db:create` 涓€閿垱寤烘暟鎹〃

### New Files

1. `docs/澶氳处鎴锋潈闄愮郴缁熻璁?md` - 璁捐鏂囨。
2. `docs/瀹屾暣鏁版嵁搴撶粨鏋?sql` - 鏁版嵁搴撶粨鏋?SQL
3. `src/server/scripts/create-tables.ts` - 涓€閿缓琛ㄨ剼鏈?

### Modified Files

1. `src/server/prisma/schema.prisma` - 鏂板 account 鍜?account\_member 妯″瀷
2. `src/server/src/main.ts` - 鏂板 `requireAccountId` 鍑芥暟锛屽鍏ラ€昏緫浣跨敤 accountId
3. `src/server/package.json` - 鏂板 `db:create` 鑴氭湰

## 2.2.6 - 2026-03-20

### Fixes

- **鍩轰簬 Next.js 鏈€浣冲疄璺靛交搴曡В鍐冲埛鏂版粴鍔ㄩ棶棰?*:
  - 绉婚櫎浜嗗墠涓€鐗堟湰浣跨敤 `min-h-screen` 鐨?hack 鍐欐硶銆?
  - 灏嗘秷璐归〉闈㈢殑楠ㄦ灦灞忕粍浠朵粠 `page.tsx` 鍐呴儴鎶界锛屽垱寤轰簡绗﹀悎 Next.js App Router 绾﹀畾鐨?`app/(dashboard)/consumption/loading.tsx`銆?
  - 閫氳繃鏈嶅姟绔殑鍘熺敓 React Suspense 娉ㄥ叆锛岀‘淇濇祻瑙堝櫒鍦ㄦ敹鍒板垵濮?HTML 鐨勭涓€甯у氨鎷ユ湁瀹屾暣鐨勯鏋跺睆楂樺害锛屼粠鑰岃鍘熺敓 Scroll Restoration锛堟粴鍔ㄦ仮澶嶏級瀹岀編鐢熸晥銆?

### Modified Files

1. `web/src/app/(dashboard)/consumption/page.tsx`
2. `web/src/app/(dashboard)/consumption/loading.tsx` (鏂板)
3. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`

## 2.2.5 - 2026-03-20

### Fixes

- **褰诲簳瑙ｅ喅娑堣垂椤甸潰鍒锋柊婊氬姩浣嶇疆涓㈠け闂**:
  - 涓?`page.tsx`銆乣SkeletonLoading` 浠ュ強 `ConsumptionDefaultTheme` 鐨勬渶澶栧眰瀹瑰櫒娣诲姞浜?`min-h-screen` 鏍峰紡銆?
  - 瑙ｅ喅浜嗗湪 `next/dynamic` 寮傛鍔犺浇鏈熼棿 DOM 鐬棿楂樺害鍧嶅锛屽鑷存祻瑙堝櫒 Scroll Restoration锛堟粴鍔ㄦ仮澶嶏級鏈哄埗澶辨晥锛岃寮哄埗寮瑰洖椤堕儴鐨勯棶棰樸€?

### Modified Files

1. `web/src/app/(dashboard)/consumption/page.tsx`
2. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`

## 2.2.4 - 2026-03-20

### Fixes

- **淇婊戝姩鍒锋柊鏃堕鏋跺睆浣嶇疆涓㈠け闂**:
  - 琛ュ叏浜?`consumption/page.tsx` 涓己澶辩殑搴曞眰鍥捐〃楠ㄦ灦灞忓崰浣嶏紙鍖呮嫭甯曠疮鎵樺浘銆佹秷璐规棩鍘嗐€佺儹鍔涘浘銆佹鍩哄浘銆佹暎鐐瑰浘绛夛級銆?
  - 瑙ｅ喅浜嗗洜楠ㄦ灦灞忔€婚珮搴︿笉瓒冲鑷存祻瑙堝櫒鍒锋柊鏃舵棤娉曟纭仮澶嶆粴鍔ㄤ綅缃殑闂銆?
  - 鐜板湪楠ㄦ灦灞忛珮搴︿笌鐪熷疄椤甸潰瀹屽叏瀵归綈锛岀敤鎴峰嵆浣垮湪椤甸潰搴曢儴鍒锋柊涔熻兘骞虫粦杩囨浮銆?

### Modified Files

1. `web/src/app/(dashboard)/consumption/page.tsx`

## 2.2.3 - 2026-03-20

### UI/UX Improvements

- **楠ㄦ灦灞忚瑙変綋楠屾繁搴﹁繕鍘?*:
  - 褰诲簳閲嶆瀯浜嗗浘琛ㄩ鏋跺睆缁勪欢锛屾柊澧?`PieChartSkeleton` 鐢ㄤ簬楗煎浘鍖哄煙鍗犱綅銆?
  - 鍘熸湁鐨?`ChartSkeleton` 鏀逛负鍖呭惈闅忔満楂樺害鏌辩姸鏉＄殑閫氱敤鐭╁舰鍥捐〃鍗犱綅锛屽畬缇庨€傞厤鏉″舰鍥俱€佹姌绾垮浘鍜屽爢绉浘鍖哄煙銆?
  - 绮剧畝浜嗛《閮ㄥ洓涓牳蹇冩暟鎹崱鐗?(`StatsCardSkeleton`) 鐨勫唴閮ㄧ粨鏋勪笌楂樺害锛屼娇鍏朵笉鍐嶆樉寰楄噧鑲匡紝璐磋繎鐪熷疄鍗＄墖鐨勫崟琛岀揣鍑戝竷灞€銆?
  - 涓洪《閮?AI 鐩稿叧鍔熻兘鎸夐挳鍗犱綅绗︽坊鍔犱簡鍖归厤鍏剁湡瀹炵姸鎬佺殑娴呰摑鑹插井鍏夋晥鏋溿€?
  - 寰皟浜嗘墍鏈夊浘琛ㄥ尯鍩熺殑 `min-h` 鍙傛暟锛岃揪鍒板儚绱犵骇鍗犱綅瀵归綈銆?

### Modified Files

1. `web/src/app/(dashboard)/consumption/page.tsx`
2. `web/src/components/shared/Skeletons.tsx`

## 2.2.2 - 2026-03-20

### Fixes

- **淇娑堣垂椤甸潰甯冨眬鍋忕Щ (Layout Shift)**:
  - 淇浜?`consumption/page.tsx` 涓鏋跺睆涓庣湡瀹炵粍浠朵笉涓€鑷村鑷寸殑甯冨眬璺冲姩闂銆?
  - 楠ㄦ灦灞忔柊澧炰簡椤堕儴鏍囬銆丄I 鏅鸿兘鍒嗘瀽鍗＄墖鍗犱綅浠ュ強绛涢€夋爮鍗犱綅銆?
  - 璋冩暣浜嗗浘琛ㄥ尯鍩熼鏋跺睆鐨勭綉鏍煎竷灞€锛?, 1, 2 col-spans锛夛紝涓庣湡瀹為〉闈㈢殑鐎戝竷娴佸畬鍏ㄥ榻愩€?
  - 淇 `AIAnalysisCard.tsx` 涓?`compact` 灞炴€у湪鍒濆鐘舵€佸け鏁堝鑷寸殑楂樺害绐佸彉 Bug銆?

### Modified Files

1. `web/src/app/(dashboard)/consumption/page.tsx`
2. `web/src/components/shared/Skeletons.tsx`
3. `web/src/features/consumption/components/AIAnalysisCard.tsx`

## 2.2.1 - 2026-03-20

### UI/UX Improvements

- **鍓嶇鍔犺浇浣撻獙缁熶竴浼樺寲**:
  - 绉婚櫎浜嗘墍鏈夐〉闈紙棣栭〉銆佹秷璐广€佽祫浜с€佽捶娆俱€佸悗鍙扮鐞嗭級鍦ㄧ粍浠舵噿鍔犺浇鏈熼棿鐨勭敓纭浆鍦?Loading 鍥炬爣銆?
  - 灏嗘墍鏈夋噿鍔犺浇鍗犱綅缁熶竴鏇挎崲涓轰笌瀵瑰簲椤甸潰甯冨眬1:1鍖归厤鐨?**楠ㄦ灦灞?(Skeleton)** 鍔ㄧ敾銆?
  - 鐜板湪鐢ㄦ埛鍒锋柊椤甸潰鏃讹紝鍙渶鐪嬪埌涓€娆″眳涓殑"姝ｅ湪楠岃瘉鐧诲綍鐘舵€?锛岄殢鍚庨〉闈細绔嬪埢浠ラ鏋跺睆褰㈠紡灞曠幇鍩虹缁撴瀯骞跺钩婊戣繃娓″埌鐪熷疄鏁版嵁锛屽交搴曟秷闄や簡澶氭涓嶅悓 Loading 鏍峰紡甯︽潵鐨勮瑙夊壊瑁傛劅銆?

### Modified Files

1. `web/src/app/(dashboard)/page.tsx`
2. `web/src/app/(dashboard)/assets/page.tsx`
3. `web/src/app/(dashboard)/consumption/page.tsx`
4. `web/src/app/(dashboard)/loans/page.tsx`
5. `web/src/app/(dashboard)/admin/page.tsx`

## 2.2.0 - 2026-03-20

### Features

- **AI 鏅鸿兘鍒嗘瀽鍔熻兘涓婄嚎**:
  - 鏂板 `POST /api/ai/analyze-consumption` 鍚庣鎺ュ彛
  - AI 鍒嗘瀽鏈嶅姟鑷姩鍒嗘瀽鐢ㄦ埛娑堣垂鏁版嵁锛岀敓鎴愪釜鎬у寲娲炲療
  - 娑堣垂椤甸潰椤堕儴鏂板 AI 鍒嗘瀽鍗＄墖锛屽睍绀猴細
    - 鎬绘敮鍑恒€佹棩鍧囨秷璐广€佷富瑕佺被鍒瓑缁熻
    - 娑堣垂鎬荤粨鏂囨湰
    - 鍏抽敭娲炲療锛坕nfo/warning/success 绫诲瀷锛?
    - 鍙墽琛岀殑浼樺寲寤鸿锛堟寜浼樺厛绾ч珮/涓?浣庢帓鍒楋級
  - 鏀寔灞曞紑/鏀惰捣璇︽儏
  - 鏀寔閲嶆柊鍒嗘瀽
- **AI 鍒嗘瀽浜や簰鏁堟灉浼樺寲**:
  - 楠ㄦ灦灞忓姩鎬佸姞杞芥晥鏋滐細Stats 鏁版嵁鏍笺€佸浘琛ㄥ尯銆佹礊瀵熷崱鐗囧潎鏈夌嫭绔嬮鏋跺姩鐢?
  - 鍒嗘瀽鎶ュ憡鎵撳瓧鏈烘晥鏋滐細Summary 鏂囧瓧閫愬瓧鏄剧ず锛屽甫闂儊鍏夋爣
  - 娲炲療鍜屽缓璁€愭潯寮瑰嚭锛氭瘡 300ms 閫愭潯鏄剧ず涓€鏉★紝甯?slide-in 鍔ㄧ敾
  - Loading 鏃舵樉绀烘棆杞?Loader 鍥炬爣锛屽疄鏃跺弽棣堝垎鏋愯繘搴?
- **娑堣垂椤甸潰绉诲姩绔浘琛ㄤ紭鍖?*:
  - 銆屾瘡鏃ュ钩鍧囨秷璐?(鎸夊懆)銆嶅浘琛ㄥ湪绉诲姩绔敮鎸?X 杞存爣绛?45 搴︽棆杞樉绀?
  - PC 绔繚鎸佹甯歌搴︽樉绀猴紝鏍规嵁 `isMobile` 鐘舵€佸姩鎬佸垏鎹?

### Fixes

- **鏋勫缓閿欒鍏ㄩ潰淇**:
  - 淇 `ConsumptionDefaultTheme.tsx` 涓?`<DelayedRender>` 鏍囩鏈纭棴鍚堝鑷?JSX 瑙ｆ瀽澶辫触
  - 淇 `ai/page.tsx` 涓?Button 缁勪欢浣跨敤涓嶅瓨鍦ㄧ殑 `asChild` prop锛坆ase-ui 鐗堟湰宸茬Щ闄わ級
  - 淇 `page.tsx` 涓?Transaction 绫诲瀷缂哄皯 `description` 瀛楁瀵艰嚧 TypeScript 鎶ラ敊
  - 淇 `notifications.ts` 涓?`actions` 鍜?`vibrate` 灞炴€т笉瀛樺湪浜?`NotificationOptions` 鐨勭被鍨嬮敊璇?
  - 淇 `echarts-for-react` v3.x 绉婚櫎 `ref` prop 瀵艰嚧鐨勬墍鏈夊浘琛ㄥ紩鐢ㄦ姤閿?
  - 瀹夎 `@playwright/test` 渚濊禆瑙ｅ喅 Playwright 閰嶇疆鎶ラ敊
- **AI 鍒嗘瀽闃舵杞崲 bug 淇**:
  - 淇鎵撳瓧闃舵杞崲閫昏緫锛孲ummary 瀹屾垚鍚庢纭繘鍏?insights 鍜?suggestions 闃舵

### Modified Files

**New Files:**

1. `web/src/features/consumption/components/AIAnalysisCard.tsx` (鏂板 AI 鍒嗘瀽鍗＄墖缁勪欢)
2. `docs/AI璐﹀崟鏅鸿兘鍒嗘瀽鍔熻兘寮€鍙戞枃妗?md` (鏂板寮€鍙戞枃妗?
3. `src/server/src/services/doubaoAi.ts` (鏂板 `analyzeConsumption` 鍑芥暟)

**Modified Files:**
4\. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` (闆嗘垚 AI 鍒嗘瀽鍗＄墖锛屼紭鍖栫Щ鍔ㄧ鍥捐〃鏃嬭浆)
5\. `web/src/app/(dashboard)/ai/page.tsx` (绉婚櫎 asChild prop锛屾敼鐢ㄥ師鐢熼敋鐐规牱寮?
6\. `web/src/app/(dashboard)/page.tsx` (淇 Transaction 绫诲瀷)
7\. `web/src/lib/notifications.ts` (绉婚櫎鏃犳晥鐨?Notification 閫夐」)
8\. `web/package.json` (鏂板 @playwright/test 渚濊禆)
9\. `src/server/src/main.ts` (鏂板 `/api/ai/analyze-consumption` 璺敱)

## 2.1.8 - 2026-03-19

### Features

- **AI 璇嗗埆骞冲彴閫夋嫨鍔熻兘涓婄嚎**:
  - 鍦ㄦ秷璐归〉 AI 璁拌处鍔熻兘涓柊澧炲钩鍙伴€夋嫨涓嬫媺妗嗭紝鏀寔鍒囨崲涓変釜鏀粯骞冲彴锛?*鏀粯瀹?*銆?*寰俊鏀粯**銆?*浜戦棯浠?*銆?
  - 鍒囨崲骞冲彴鍚庯紝璇嗗埆缁撴灉琛ㄥ崟浼氬姩鎬佹樉绀鸿骞冲彴鐗规湁鐨勫瓧娈点€?
- **骞冲彴鐗瑰畾 AI 璇嗗埆浼樺寲**:
  - **鏀粯瀹?(Alipay)**: 鎻愬彇鍟嗘埛鍚嶇О銆佹秷璐规棩鏈熴€佽处鍗曞垎绫汇€佷粯娆炬柟寮忋€佹敹娆炬柟鍏ㄧО銆佹敮浠樻椂闂淬€佸娉ㄧ瓑瀛楁銆?
  - **寰俊鏀粯 (WeChat)**: 鎻愬彇鍟嗘埛鍚嶇О銆佸晢鍝佹弿杩般€佹敮浠樻椂闂淬€佸晢鎴峰叏绉扮瓑瀛楁銆?
  - **浜戦棯浠?(UnionPay)**: 鎻愬彇娑堣垂鍚嶇О銆佸崱鍙凤紙灏惧彿锛夈€佷氦鏄撴椂闂达紙绮剧‘鍒扮锛夈€佷氦鏄撶被鍒€佸垎绫荤瓑瀛楁銆?
  - 涓烘瘡涓钩鍙板畾鍒朵簡鐙珛鐨?AI Prompt 鎻愮ず璇嶏紝纭繚妯″瀷鑳藉噯纭瘑鍒笉鍚屽钩鍙拌处鍗曞皬绁ㄧ殑鏍煎紡鍜屽瓧娈典綅缃€?

### Modified Files

1. `src/server/src/services/doubaoAi.ts` (Added platform-specific prompts and new field types)
2. `src/server/src/main.ts` (Updated `/api/ai/scan-receipt` to accept platform parameter)
3. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` (Added platform selector and dynamic form fields)

## 2.1.7 - 2026-03-19

### Features

- **AI 璁拌处鏃堕棿鎻愬彇涓庡睍绀轰紭鍖?*:
  - 浼樺寲浜嗗墠绔?AI 鎷嶇収璁拌处寮圭獥鐨勬椂闂村睍绀洪€昏緫锛岀Щ闄や簡鍗曠嫭鐨勩€屾敮浠樻椂闂淬€嶈緭鍏ユ锛岄伩鍏嶆椂闂村瓧娈甸噸澶嶃€?
  - 灏嗗師鏈《閮ㄧ殑銆屾棩鏈熴€嶅瓧娈靛崌绾т负銆屾敮浠樻椂闂淬€嶏紝骞舵敮鎸佹樉绀虹簿纭埌绉掔殑瀹屾暣鏃堕棿鏍煎紡 (`YYYY-MM-DDThh:mm:ss`)銆?
  - 鏅鸿兘鍚堝苟 AI 鎻愬彇缁撴灉锛氬綋 AI 鎴愬姛鎻愬彇鍒板畬鏁寸殑鏀粯鏃堕棿鏃讹紝浼氳嚜鍔ㄦ牸寮忓寲骞跺～鍏呭埌涓绘椂闂磋緭鍏ユ涓紱鍦ㄦ渶缁堜繚瀛樻椂锛屼細鑷姩鎴彇鎵€闇€鐨勬棩鏈熼儴鍒?(`YYYY-MM-DD`) 鎻愪氦缁欏悗绔€?

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` (Refactored date/time inputs and state merging logic)

## 2.1.6 - 2026-03-19

### Features

- **AI 璁拌处鍔熻兘鏁版嵁缁村害鎵╁厖**:
  - 澧炲己浜嗚眴鍖呰瑙夋ā鍨嬬殑 Prompt 鎻愮ず璇嶏紝浣垮叾鑳戒粠璐﹀崟鎴浘涓彁鍙栨洿澶氳缁嗕俊鎭€?
  - 鏂板鏀寔鎻愬彇锛?*璐﹀崟鍒嗙被** (濡? 鐖辫溅鍏昏溅)銆?*浠樻鏂瑰紡** (濡? 鍌ㄨ搫鍗?闆堕挶)銆?*鏀粯鏃堕棿** (绮剧‘鍒扮)銆?*鏀舵鏂瑰叏绉?* (濡? \*\*绉?涓汉)) 浠ュ強 **澶囨敞** 淇℃伅銆?
  - 浼樺寲浜嗗墠绔?AI 鎷嶇収璁拌处寮圭獥鐨勮〃鍗曪紝鏀寔灞曠ず鍜岀紪杈戣繖浜涙柊澧炲瓧娈点€?
  - 鍦ㄤ繚瀛樹氦鏄撴椂锛岃嚜鍔ㄥ皢杩欎簺棰濆淇℃伅鎷兼帴鍒颁氦鏄撴弿杩?(Description) 涓紝纭繚淇℃伅涓嶄涪澶便€?

### Modified Files

1. `src/server/src/services/doubaoAi.ts` (Updated prompt and return types for more fields)
2. `src/server/src/main.ts` (Updated API response to include new fields)
3. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` (Added new fields to form and logic)

## 2.1.5 - 2026-03-19

### Fixes

- **AI 妯″瀷閰嶇疆琛ㄥ崟鎻愮ず浜屾浼樺寲**:
  - 鏍规嵁鐏北寮曟搸鏈€鏂扮殑銆屽揩鎹锋帴鍏ラ缃帹鐞嗘湇鍔°€嶈鑼冿紝淇敼浜嗗墠绔殑妯″瀷 ID 濉啓鎻愮ず銆?
  - 鏄庣‘鍛婄煡鐢ㄦ埛锛氫笉闇€瑕佸己鍒朵娇鐢?`ep-` 寮€澶达紝鑰屾槸鐩存帴澶嶅埗鎺у埗鍙颁唬鐮佺ず渚嬩腑鑷姩鐢熸垚鐨勬ā鍨?ID锛堝 `doubao-seed-2-0-mini-260215` 鎴?`ep-xxx`锛夈€?
  - 閬垮厤鐢ㄦ埛璇皢涓嬫媺妗嗙殑涓枃鎴栧ぇ鍐欐樉绀哄悕绉帮紙濡?`Doubao-Seed-2.0-mini`锛夌洿鎺ュ～鍏ャ€?

### Modified Files

1. `web/src/app/(dashboard)/ai/page.tsx` (Updated Volcengine model ID hint)

## 2.1.4 - 2026-03-19

### Fixes

- **AI 妯″瀷閰嶇疆琛ㄥ崟鎻愮ず浼樺寲**:
  - 閽堝浣跨敤鐏北寮曟搸锛堣眴鍖咃級妯″瀷鏃讹紝娴嬭瘯杩炴帴鎶ラ敊 `NotFoundError: 404 The model or endpoint ... does not exist` 鐨勯棶棰樸€?
  - 鍦ㄥぇ妯″瀷閰嶇疆椤甸潰鐨勩€屾ā鍨?ID銆嶈緭鍏ユ涓嬫柟鏂板浜嗛拡瀵圭伀灞卞紩鎿庣殑鍔ㄦ€佹彁绀轰俊鎭€?
  - 鏄庣‘鍛婄煡鐢ㄦ埛锛氬綋鎻愪緵鍟嗕负鐏北寮曟搸鎴?API 绔偣鍖呭惈 volces 鏃讹紝蹇呴』濉啓浠?`ep-` 寮€澶寸殑銆屾帴鍏ョ偣 ID銆嶏紝鑰屼笉鑳界洿鎺ュ～鍐欐ā鍨嬪悕绉般€?
  - 浼樺寲浜嗘ā鍨?ID 杈撳叆妗嗙殑 placeholder銆?

### Modified Files

1. `web/src/app/(dashboard)/ai/page.tsx` (Added endpoint ID hint for Volcengine)

## 2.1.3 - 2026-03-19

### Fixes

- **API 绔彛閰嶇疆淇**:
  - 鍓嶇 API 璇锋眰绔彛浠庨敊璇殑 3006 淇涓烘纭殑 3004
  - 鍒涘缓 `web/.env.local` 鏂囦欢鎸佷箙鍖栭厤缃?
  - 瑙ｅ喅浜?AI 璁拌处鍔熻兘鏃犳硶璋冪敤鍚庣 API 鐨勯棶棰?

### Features

- **璁句负榛樿妯″瀷鍔熻兘**:
  - 澶фā鍨嬬鐞嗛〉闈㈡敮鎸?璁句负榛樿"閫夐」
  - 榛樿妯″瀷鍦ㄥ崱鐗囦笂鏄剧ず钃濊壊"榛樿"鏍囩
  - AI 璁拌处鏃朵紭鍏堜娇鐢ㄩ粯璁ゆā鍨?
  - 璁句负榛樿鍚庝細鍙栨秷鍏朵粬妯″瀷鐨勯粯璁ょ姸鎬?
- **AI 璇嗗埆浜や簰浼樺寲**:
  - 涓婁紶鍥剧墖鍚庝笉鍐嶈嚜鍔ㄨ瘑鍒紝鏀逛负鏄剧ず"寮€濮嬭瘑鍒?鎸夐挳
  - 鐢ㄦ埛涓诲姩鐐瑰嚮璇嗗埆鎸夐挳鍚庢墠瑙﹀彂 AI 璇嗗埆
  - 璇嗗埆杩囩▼涓樉绀?loading 鐘舵€?
  - 璇嗗埆瀹屾垚鍚庢樉绀虹粨鏋滀緵鐢ㄦ埛纭鎴栦慨鏀?
- **AI 璇嗗埆閿欒鎻愮ず浼樺寲**:
  - 鏀硅繘娑堣垂椤甸潰 AI 璇嗗埆鐨勯敊璇鐞?
  - 鏈厤缃?API Key 鏃舵彁绀虹敤鎴峰墠寰€澶фā鍨嬮〉闈㈤厤缃?
  - 鏈櫥褰曟椂鎻愮ず鐢ㄦ埛鍏堢櫥褰?
  - 鎻愪緵鏇村弸濂界殑閿欒鏂囨锛岃€岄潪绗肩粺鐨?璇嗗埆澶辫触"

### Modified Files

1. `web/.env.local` (New file - API port configuration)
2. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` (Added manual scan button, better error handling)
3. `web/src/app/(dashboard)/ai/page.tsx` (Added set default model feature)

## 2.1.2 - 2026-03-18

### Fixes

- **椤堕儴瀵艰埅鏍忕敤鎴蜂俊鎭樉绀轰慨澶?*:
  - 淇浜?`Header` 缁勪欢鍦ㄦ棤鏁版嵁搴撴垨璇锋眰寤惰繜鏃朵竴鐩存樉绀洪潤鎬?"User" 鍜?"鍔犺浇涓?.." 鐨勯棶棰樸€?
  - 澧炲姞浜嗗鐢ㄦ埛鑾峰彇鐘舵€佺殑 Loading 鎻愮ず锛屼互鍙婂け璐ユ椂鐨?鏈櫥褰?鍏滃簳鏄剧ず銆?
  - 淇浜嗚閿欒娉ㄩ噴鎺夌殑 `AuthGate` 缁勪欢锛岄噸鏂板惎鐢ㄤ簡閴存潈澶辫触鏃惰嚜鍔ㄩ噸瀹氬悜鐧诲綍椤电殑閫昏緫銆?
  - 鍚庣 `/api/auth/me`銆乣/api/auth/login` 鍜?`/api/auth/register` 鎺ュ彛鐜板凡鍏ㄩ潰鏀寔鍦ㄦ棤鏁版嵁搴撻厤缃幆澧冧笅鐨勯檷绾у唴瀛樻ā寮忥紝鎻愬崌浜嗙绾垮崟鏈轰綋楠岀殑鍋ュ．鎬с€?
- **鐧诲綍椤甸潰鑷姩濉厖涓庣姸鎬佹竻绌轰慨澶?*:
  - 淇浜嗘祻瑙堝櫒锛堟垨瀵嗙爜绠＄悊鍣級鑷姩濉厖璐﹀彿瀵嗙爜鏃讹紝鏈Е鍙?React `onChange` 浜嬩欢瀵艰嚧鎻愪氦绌烘暟鎹紙鎻愮ず璐﹀彿鎴栧瘑鐮侀敊璇級鐨勯棶棰橈紝鐜版敼涓洪€氳繃 `FormData` 鐩存帴鑾峰彇 DOM 瀹為檯鍊笺€?
  - 灏嗗彈鎺ц緭鍏ユ锛坄value`锛変慨鏀逛负闈炲彈鎺х粍浠讹紙`defaultValue`锛夛紝瑙ｅ喅浜嗙櫥褰曞け璐ュ悗鐘舵€佽鎰忓閲嶇疆瀵艰嚧杈撳叆妗嗚娓呯┖鐨勯棶棰橈紝璁╃敤鎴峰彲浠ョ户缁慨鏀硅€屾棤闇€閲嶆柊杈撳叆銆?

### Modified Files

1. `web/src/components/shared/Header.tsx` (Fixed user display logic)
2. `web/src/components/shared/AuthGate.tsx` (Restored auth routing)
3. `src/server/src/main.ts` (Added memory mode support for auth APIs)
4. `web/src/app/auth/login/page.tsx` (Fixed form autofill & state clear issues)

## 2.1.1 - 2026-03-18

### Features

- **澶фā鍨嬬鐞嗛〉闈笂绾?*:
  - 鏂板渚ц竟鏍?澶фā鍨?鑿滃崟鍏ュ彛
  - 鍒涘缓 `web/src/app/(dashboard)/ai/page.tsx` 椤甸潰
  - 鏀寔娣诲姞銆佺紪杈戙€佸垹闄よ嚜瀹氫箟澶фā鍨嬮厤缃?
  - 鏀寔閰嶇疆 API Key銆佹彁渚涘晢銆佺鐐广€佹ā鍨?ID
  - 宸查厤缃?鏈厤缃ā鍨嬪垎缁勫睍绀猴紝鐘舵€佷竴鐩簡鐒?
- **AI 鎷嶇収璁拌处鍔熻兘涓婄嚎**:
  - 娑堣垂鍒嗘瀽椤甸潰鏂板"AI 璁拌处"鎸夐挳锛堟笎鍙樿壊璁捐锛?
  - 鐐瑰嚮寮瑰嚭 BottomSheet锛屽彲涓婁紶灏忕エ/璐﹀崟鐓х墖
  - 璋冪敤 AI 瑙嗚妯″瀷鑷姩璇嗗埆閲戦銆佸晢鎴枫€佹棩鏈熴€佸垎绫?
  - 鐢ㄦ埛鍙井璋冭瘑鍒粨鏋滃悗涓€閿‘璁よ璐?
  - 璁拌处鎴愬姛鍚庤嚜鍔ㄥ垱寤轰氦鏄撹褰?
- **缁熶竴椤甸潰鑳屾櫙瑁呴グ**:
  - 绠€鍖?`GridDecoration` 缁勪欢锛屽彧淇濈暀搴曢儴涓€鏍规洸绾?
  - 灏嗚儗鏅楗扮Щ鑷?dashboard layout 灞?
  - 鎵€鏈夐〉闈㈢粺涓€灞曠ず鍥哄畾搴曢儴鐨勭嚎鏉¤儗鏅?
  - 浣跨敤 `fixed` 瀹氫綅锛屾粴鍔ㄦ椂鑳屾櫙淇濇寔闈欐

### Modified Files

1. `web/src/components/shared/Sidebar.tsx` (Added AI menu)
2. `web/src/app/(dashboard)/ai/page.tsx` (New)
3. `web/src/app/(dashboard)/layout.tsx` (Added GridDecoration)
4. `web/src/components/shared/GridDecoration.tsx` (Simplified to single line)
5. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` (Added AI scan)
6. `src/server/src/main.ts` (Added `/api/ai/scan-receipt`)

## 2.1.0 - 2026-03-18

### Features

- **AI 鏅鸿兘瑙嗚璁拌处鍚庣鍩虹璁炬柦涓婄嚎**:
  - **AI 寮曟搸鎺ュ叆**: 闆嗘垚 `openai` SDK锛屾垚鍔熷鎺ュ瓧鑺傝烦鍔ㄧ伀灞卞紩鎿庯紙Volcengine锛夌殑 **Doubao-vision-pro** 瑙嗚澶фā鍨嬨€?
  - **鏈嶅姟灏佽**: 鍒涘缓浜?`doubaoAi.ts` 鏈嶅姟妯″潡锛屽皝瑁呬簡鍥剧墖 Base64 杞崲銆丳rompt 鏋勯€犮€丣SON 涓ユ牸瑙ｆ瀽涓庨敊璇洖閫€鏈哄埗銆?
  - **API 鎺ュ彛**: 鏂板 `POST /api/ai/scan-receipt` 鎺ュ彛锛屾敮鎸佸浘鐗囨祦涓婁紶锛屽苟杩斿洖缁撴瀯鍖栨秷璐规暟鎹紙閲戦/鍟嗘埛/鏃ユ湡/鍒嗙被/鎻忚堪锛夈€?
  - **闅愮淇濇姢**: 閲囩敤鍐呭瓨娴佸紡澶勭悊 (`multer.memoryStorage`)锛屽浘鐗囨暟鎹嵆鐢ㄥ嵆鐒氾紝涓嶅湪鏈嶅姟鍣ㄧ鐩樼暀瀛樸€?

### Fixes

- **鐗堟湰鏃ュ織鎺ュ彛淇**:
  - 淇浜嗗悗绔?`/api/changelog` 璇诲彇 `CHANGELOG.md` 鏃剁殑璺緞璁＄畻閿欒锛坄path.join` 灞傜骇淇锛夈€?
  - 浼樺寲浜?Markdown 瑙ｆ瀽姝ｅ垯琛ㄨ揪寮忥紝澧炲己浜嗗澶氭寮忕増鏈彿锛堝 `1.8.36`锛夊拰鍔犵矖鏂囨湰鐨勫吋瀹规€э紝纭繚鍓嶇鈥滃叧浜庘€濋〉闈㈣兘姝ｇ‘灞曠ず鎵€鏈夊巻鍙茶褰曘€?

### Modified Files

1. `src/server/package.json` (Added `openai`)
2. `src/server/src/services/doubaoAi.ts` (New)
3. `src/server/src/main.ts` (Added `/api/ai/scan-receipt` & Fixed `/api/changelog`)
4. `docs/AI鏅鸿兘璁拌处寮€鍙戞枃妗?md` (New)

## 2.0.6 - 2026-03-18

### Features & Refactoring

- **Dashboard 鏋舵瀯閲嶆瀯涓庤瑙夐鏍煎崌绾?*:
  - **绉婚櫎缃戞牸鑳屾櫙**: 搴熷純浜嗗師鏈鏁寸殑缃戞牸绾挎潯 (`repeating-linear-gradient`)銆?
  - **鏋佺畝绾挎潯瑁呴グ**: 閲嶆瀯浜?`GridDecoration` 缁勪欢锛屾敼涓轰娇鐢?`SVG` 缁樺埗鐨?3-4 鏉″叿鏈夋娊璞℃劅銆佷氦鍙夋劅鐨勪笉瑙勫垯缁嗙嚎鑳屾櫙銆傝繖绉嶉鏍兼洿鍔犵幇浠ｃ€佽交鐩堬紝涓斿叿澶囧懠鍚告劅銆?
  - **璐у竵鏍煎紡鍖栧伐鍏?*: 灏佽浜嗛€氱敤鐨?`formatCurrency` 鍑芥暟銆?
  - **鏀舵敮瓒嬪娍瀵规瘮**: 鍦ㄩ椤电粺璁″崱鐗囦腑寮曞叆浜嗗井鍨嬭秼鍔挎寚绀哄櫒銆?
  - **娑堣垂鍗犳瘮鐜舰鍥?*: 鏂板娑堣垂鍒嗙被鍗犳瘮鍥捐〃銆?
  - **棰勭畻棰勮浜や簰**: 澧炲姞浜嗏€滄殏鏃跺拷鐣モ€濇寜閽€?

### Modified Files

1. `web/src/components/shared/GridDecoration.tsx`
2. `web/src/lib/utils.ts`
3. `web/src/features/dashboard/components/themes/DefaultDashboard.tsx`

## 2.0.5 - 2026-03-18

### Fixes

- **绮惧噯鍖归厤楠ㄦ灦灞忛珮搴︿互娑堥櫎鏈€缁堢殑杞诲井璺冲彉**:
  - 鍙戠幇鍌ㄨ搫椤甸潰瀛樺彇璁板綍鐨勭湡瀹炵粍浠跺ご閮ㄨ竟璺濓紙`p-6`锛夊拰鍐呭杈硅窛涓庨€氱敤鐨?`CardListSkeleton` 瀛樺湪鍑犲儚绱犵殑璇樊锛岃繖鍑犲儚绱犵殑宸紓鍦ㄦ暟鎹覆鏌撶灛闂翠粛浼氬紩鍙戣交寰殑楂樺害鎷変几銆?
  - 绮剧‘璋冩暣浜?`Skeletons.tsx` 涓?`CardListSkeleton` 鐨?`padding` 鍙傛暟鍜?`div` 缁撴瀯锛屽苟鍚屾瀵归綈浜嗙湡瀹炲崱鐗囩殑 `CardHeader` 杈硅窛锛堟敼涓?`p-6 pb-4`锛夈€?
  - 浣垮緱楠ㄦ灦灞忕姸鎬佸拰鐪熷疄鏁版嵁鐘舵€佸湪 DOM 鐩掑瓙妯″瀷涓婅揪鍒?1:1 鍍忕礌绾у尮閰嶏紝鐪熸瀹炵幇浜嗘棤鎰熻繃娓°€?

### Modified Files

1. `web/src/components/shared/Skeletons.tsx`
   - 鏇存柊浜?`CardListSkeleton` 鐨勫唴閮?`padding` 鍜?`margin`銆?
2. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 瀵归綈浜嗗瓨鍙栬褰?`CardHeader` 鐨勫唴杈硅窛銆?

## 2.0.4 - 2026-03-18

### Fixes

- **淇鍌ㄨ搫椤甸潰瀛樺彇璁板綍妯″潡楂樺害璺冲彉**:
  - 鍙戠幇搴曢儴鈥滃瓨鍙栬褰曗€濇ā鍧椾涪澶变簡 `DelayedRender` 鐨勫寘瑁癸紝瀵艰嚧鍦ㄦ暟鎹姞杞藉畬鎴愮灛闂寸洿鎺ユ覆鏌撶湡瀹炴暟鎹崱鐗囷紝寮曡捣灞€閮ㄩ珮搴︾殑绐佺劧鏀瑰彉鍜屾粴鍔ㄦ潯鐨勭灛闂撮棯鐜般€?
  - 閲嶆柊涓鸿妯″潡娣诲姞浜?`<DelayedRender delay={200} fallback={<CardListSkeleton count={2} />}>`锛岀‘淇濆姞杞芥湡闂存湁姝ｇ‘楂樺害鐨勯鏋跺睆鍗犱綅锛屽姞杞藉畬鎴愬悗骞虫粦杩囨浮锛屼笉鍐嶅紩璧蜂换浣曢珮搴︾獊鍙樸€?

### Modified Files

1. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 鎭㈠浜嗗瓨鍙栬褰?`Card` 缁勪欢澶栧眰鐨?`DelayedRender` 鍖呰銆?

## 2.0.3 - 2026-03-18

### Fixes

- **缁堟瀬淇鍌ㄨ搫椤甸潰甯冨眬鎶栧姩涓庢粴鍔ㄦ潯闂幇**:
  - 閽堝椤甸潰鍒锋柊鏃跺洜寮傛鏁版嵁鍔犺浇瀵艰嚧鍐呭楂樺害鍙樺寲锛屼粠鑰屽紩鍙戞粴鍔ㄦ潯绐佺劧鍑虹幇锛堝鑷撮〉闈㈡暣浣撴按骞冲亸绉诲拰瑙嗚闂儊锛夌殑闂锛屼负 `DefaultSavings.tsx` 鐨勬牴瀹瑰櫒閲嶆柊娣诲姞浜?`min-h-[101vh]`銆?
  - 璇ユ敼鍔ㄥ己鍒堕〉闈㈠缁堜繚鐣欏瀭鐩存粴鍔ㄦ潯杞ㄩ亾锛岀‘淇濅簡浠庨鏋跺睆鍒囨崲鍒扮湡瀹炴暟鎹椂椤甸潰甯冨眬鐨勭粷瀵圭ǔ瀹氾紝閰嶅悎涔嬪墠鐨勬笎鍏ュ姩鐢伙紝瀹炵幇浜嗗畬缇庣殑鍔犺浇浣撻獙銆?

### Modified Files

1. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 涓烘牴瀹瑰櫒 `div` 娣诲姞浜?`min-h-[101vh]` 绫汇€?

## 2.0.2 - 2026-03-18

### Fixes & Improvements

- **淇鍌ㄨ搫椤甸潰鍔犺浇鏃剁殑瑙嗚闂儊闂骞剁粺涓€鏋舵瀯**:
  - 绉婚櫎浜?`DefaultSavings.tsx` 涓殑鍐椾綑鑷畾涔夐鏋跺睆缁勪欢锛屽叏闈㈠紩鍏ヤ簡 `Skeletons.tsx` 涓爣鍑嗙殑 `ChartSkeleton`銆乣ListTableSkeleton` 鍜?`CardListSkeleton`銆?
  - 涓哄瓨鍙栬褰曠殑楠ㄦ灦灞忥紙`CardListSkeleton`锛夋寚瀹氫簡鍖归厤鐪熷疄鏁版嵁鐨勯」鏁板拰楂樺害锛屾秷闄や簡鐢辨瀵艰嚧鐨勬粴鍔ㄦ潯闂儊鍜岄〉闈㈣烦鍔ㄣ€?
  - 瀛︿範浜嗘秷璐归〉闈㈢殑鍔犺浇鏋舵瀯锛屼负鍌ㄨ搫椤甸潰鐨勫浘琛ㄥ拰琛ㄦ牸缁熶竴寮曞叆浜?`DelayedRender` 缁勪欢锛屽苟閰嶇疆浜嗛樁姊紡鐨勫欢杩熷姞杞芥椂闂达紙50ms, 100ms, 150ms锛夛紝瀹炵幇浜嗗钩婊戠殑娓愭鍏ュ満鍔ㄧ敾鏁堟灉銆?

### Modified Files

1. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 绉婚櫎浜?`StatsCardSkeleton`銆乣DistributionChartSkeleton`銆乣GoalsTableSkeleton`銆乣TransactionsSkeleton`銆?
   - 寮曞叆骞朵娇鐢ㄤ簡 `@/components/shared/Skeletons` 涓殑閫氱敤缁勪欢銆?
   - 鍦ㄤ富缃戞牸甯冨眬涓负鍥捐〃鍜岃〃鏍兼坊鍔犱簡 `DelayedRender` 缁勪欢鍖呰９銆?
   - 鏇存柊浜嗗瓨鍙栬褰曠殑 `fallback` 涓?`<CardListSkeleton count={2} />`銆?

## 2.0.1 - 2026-03-18

### Fixes

- **淇鍏ㄥ眬婊氬姩鏉＄櫧杈归棶棰?*:
  - 绉婚櫎浜?`globals.css` 涓?`html` 鍏冪礌鐨?`scrollbar-gutter: stable` 鍏ㄥ眬鏍峰紡銆?
  - 淇濈暀浜?`.scrollbar-stable` 绫荤殑瀹氫箟锛屼粎鍦ㄩ渶瑕侀槻姝㈠竷灞€鎶栧姩鐨勭壒瀹氭粴鍔ㄥ鍣紙濡?`<main>`锛変笂灞€閮ㄥ簲鐢紝浠庤€屾秷闄や簡娴忚鍣ㄧ獥鍙ｆ渶鍙充晶涓嶅繀瑕佺殑绌虹櫧婊氬姩鏉″崰浣嶃€?

### Modified Files

1. `web/src/app/globals.css`
   - 绉婚櫎浜?`html` 閫夋嫨鍣ㄤ腑鐨?`scrollbar-gutter` 鏍峰紡銆?

## 2.0.0 - 2026-03-17

### Features

- **棰勭畻绯荤粺涓庨璀﹀寮?*:
  - Budget 妯″瀷鏂板 `scopeType` 瀛楁锛屾敮鎸佷笁绉嶉绠椾綔鐢ㄥ煙锛?
    - `GLOBAL`: 鍏ㄥ眬棰勭畻锛堥粯璁わ級
    - `CATEGORY`: 鍒嗙被棰勭畻
    - `PLATFORM`: 骞冲彴棰勭畻
  - Budget 妯″瀷鏂板 `platform` 瀛楁锛屾敮鎸佹寜骞冲彴璁剧疆棰勭畻
  - Budget 妯″瀷鏂板 `alertPercent` 瀛楁锛堥粯璁?80%锛夛紝鏀寔鑷畾涔夐璀﹂槇鍊?
  - 鏂板 `BudgetScope` 鏋氫妇绫诲瀷
  - 鏇存柊鍞竴绾︽潫涓?`[userId, category, period, scopeType, platform]`
- **鍚庣鎺ュ彛澧炲己**:
  - 鎵╁睍 `/api/budgets` 鎺ュ彛锛岃繑鍥為绠楀仴搴风姸鎬侊紙normal/warning/overdue锛?
  - 鏂板 `/api/budgets/alerts` 鎺ュ彛锛岃幏鍙栨墍鏈夐璀?瓒呮敮鐨勯绠楀垪琛?
  - 鏇存柊 `budget.ts` 閫昏緫灞傦紝鏂板 `calculateBudgetHealth` 鍑芥暟
- **鍓嶇棰勭畻绠＄悊椤甸噸鏋?*:
  - 鏀寔閫夋嫨棰勭畻浣滅敤鍩燂紙鍏ㄥ眬/鍒嗙被/骞冲彴锛?
  - 棰勭畻杩涘害鏉℃牴鎹仴搴风姸鎬佸彉鑹诧細
    - < 80%: 缁胯壊锛堟甯革級
    - 80% - 100%: 榛勮壊锛堥璀︼級
    - <br />
      > 100%: 绾㈣壊锛堣秴鏀級
  - 棰勭畻鍗＄墖鏄剧ず鐘舵€佹爣绛撅紙姝ｅ父/棰勮/瓒呮敮锛?
  - 鏀寔鑷畾涔夐璀﹂槇鍊艰缃?
  - 鏂板甯哥敤鍒嗙被鍜屽钩鍙伴€夋嫨鍒楄〃
- **Dashboard 棣栭〉棰勭畻棰勮**:
  - 鏂板棰勭畻棰勮鎻愮ず鍗＄墖锛屾樉绀烘墍鏈夐璀?瓒呮敮鐨勯绠?
  - 棰勮鍗＄墖鏀寔璺宠浆鍒伴绠楃鐞嗛〉
  - 蹇嵎鍏ュ彛鏂板"棰勭畻绠＄悊"鍏ュ彛

### Modified Files

1. `src/server/prisma/schema.prisma`
   - Budget 妯″瀷鏂板 `scopeType`, `platform`, `alertPercent` 瀛楁
   - 鏂板 `BudgetScope` 鏋氫妇
   - 鏇存柊鍞竴绾︽潫
2. `src/server/src/logic/budget.ts`
   - 鏂板 `BudgetStatus` 绫诲瀷
   - 鏂板 `BudgetHealthResult` 绫诲瀷
   - 鏂板 `calculateBudgetHealth` 鍑芥暟
   - 鏇存柊 `calculateBudgetUsage` 鏀寔 scopeType
3. `src/server/src/main.ts`
   - 鏇存柊 GET `/api/budgets` 杩斿洖鍋ュ悍鐘舵€?
   - 鏇存柊 POST `/api/budgets` 鏀寔鏂板瓧娈?
   - 鏇存柊 PUT `/api/budgets/:id` 鏀寔淇敼 alertPercent
   - 鏂板 GET `/api/budgets/alerts` 鎺ュ彛
4. `web/src/app/(dashboard)/budgets/page.tsx`
   - 瀹屽叏閲嶆瀯棰勭畻绠＄悊椤?
   - 鏂板浣滅敤鍩熼€夋嫨
   - 鏂板棰勮闃堝€艰缃?
   - 鐘舵€佹爣绛惧拰棰滆壊鍙樺寲
5. `web/src/app/(dashboard)/page.tsx`
   - 鏂板 `BudgetAlert` 绫诲瀷
   - 鍔犺浇棰勭畻棰勮鏁版嵁
   - 浼犻€掔粰 Dashboard 缁勪欢
6. `web/src/features/dashboard/components/themes/DefaultDashboard.tsx`
   - 鏂板棰勭畻棰勮鍗＄墖缁勪欢
   - 蹇嵎鍏ュ彛鏂板棰勭畻绠＄悊

## 1.8.36 - 2026-03-17

### Fixes

- **淇鍌ㄨ搫椤甸潰甯冨眬鎶栧姩**:
  - 涓?`DefaultSavings.tsx` 椤甸潰娣诲姞浜?`min-h-[101vh]` 鏈€灏忛珮搴﹂檺鍒躲€?
  - 寮哄埗椤甸潰濮嬬粓鏄剧ず鍨傜洿婊氬姩鏉★紝瑙ｅ喅浜嗗洜寮傛鍐呭鍔犺浇锛圫keleton -> 鐪熷疄鍐呭锛夊鑷存粴鍔ㄦ潯绐佺劧鍑虹幇鑰屽紩鍙戠殑椤甸潰姘村钩鍋忕Щ鍜屽竷灞€璺冲姩闂銆?

### Modified Files

1. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 娣诲姞 `min-h-[101vh]` 绫诲埌鏍瑰鍣ㄣ€?

## 1.8.35 - 2026-03-17

### UI/UX Improvements

- **璁剧疆椤甸潰甯冨眬浼樺寲**:
  - 灏嗚缃〉闈㈡ā鍧椾粠闈犲乏鏄剧ず鏀逛负灞呬腑鏄剧ず
  - 瀹瑰櫒鏈€澶у搴﹂檺鍒朵负 2xl (绾?672px)锛岄伩鍏嶈繃瀹藉奖鍝嶉槄璇?
  - 鏍囬鍜屾ā鍧楁爣棰樼粺涓€灞呬腑瀵归綈
- **杩炴帴椤甸潰甯冨眬浼樺寲**:
  - 灏嗚繛鎺ラ〉闈㈡ā鍧椾粠鍏ㄥ睆瀹藉害鏀逛负灞呬腑鏄剧ず
  - 瀹瑰櫒鏈€澶у搴﹂檺鍒朵负 2xl (绾?672px)
  - 鏍囬灞呬腑鏄剧ず

### Modified Files

1. `web/src/app/(dashboard)/settings/page.tsx`
   - 娣诲姞 `mx-auto` 绫讳娇瀹瑰櫒灞呬腑
   - 涓烘爣棰樺拰妯″潡娣诲姞 `text-center` 绫?
2. `web/src/app/(dashboard)/connections/page.tsx`
   - 娣诲姞 `max-w-2xl mx-auto` 绫婚檺鍒跺搴﹀苟灞呬腑
   - 涓烘爣棰樻坊鍔?`text-center` 绫?

## 1.8.34 - 2026-03-17

### Performance Improvements

- **淇婊氬姩鍚搁《瀵艰嚧鐨勪弗閲嶅崱椤?*:
  - 鍙戠幇浣跨敤 `isStickyVisible` 鐘舵€佸疄鐜板惛椤舵晥鏋滄椂锛屽啀娆＄姱浜?鐘舵€佹彁鍗?鐨勬€ц兘闄烽槺锛氱敱浜庣姸鎬佸畾涔夊湪搴炲ぇ鐨勭埗缁勪欢 `ConsumptionDefaultTheme` 涓紝姣忔婊氬姩鍒囨崲鍚搁《鐘舵€佹椂锛岄兘浼氬鑷撮〉闈笂鎵€鏈夊鏉傜殑 ECharts 鍥捐〃鍜屾暟鎹垪琛ㄨ寮哄埗閲嶆柊娓叉煋锛屽紩鍙戜弗閲嶇殑鎺夊抚鍜屽崱椤裤€?
  - 杩涜浜嗘繁搴﹂噸鏋勶細灏嗗惛椤剁瓫閫夋爮鍙婂叾婊氬姩鐩戝惉鐘舵€侊紙`isStickyVisible`锛夊畬鍏ㄦ娊绂讳负涓€涓嫭绔嬬殑绾噣瀛愮粍浠?`FixedStickyHeader`銆?
  - 浼樺寲鍚庯紝婊氬姩鐘舵€佺殑鏀瑰彉琚弗鏍奸檺鍒跺湪 `FixedStickyHeader` 鍐呴儴锛屽彧鏈夎瀵艰埅鏍忎細鎵ц杞婚噺绾х殑 CSS 绫诲悕鍒囨崲锛岀埗缁勪欢鍜屽浘琛ㄥ交搴曞厤鐤粴鍔ㄦ洿鏂帮紝瀹炵幇浜嗙粷瀵逛笣婊戠殑婊氬姩浣撻獙銆?

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 鎻愬彇 `FixedStickyHeader` 缁勪欢銆?
   - 绉婚櫎 `ConsumptionDefaultTheme` 涓殑婊氬姩鐩戝惉鍜?`isStickyVisible` 鐘舵€併€?

## 1.8.33 - 2026-03-17

### Fixes & Improvements

- **褰诲簳瑙ｅ喅鍚搁《澶辨晥闂**:
  - 鍙戠幇鍘熸湁鐨?`sticky` 鏂规鐢变簬鍙楀埌鏇撮珮灞傜骇绁栧厛鍏冪礌鐨?`overflow` 鎴栧竷灞€闄愬埗锛屽湪鏌愪簺鎯呭喌涓嬫棤娉曟甯稿伐浣溿€?
  - 閲嶆瀯浜嗗惛椤堕€昏緫锛氶噰鐢ㄧ洃鍚粴鍔ㄧ姸鎬侀厤鍚?`fixed` 瀹氫綅鐨勬柟妗堛€?
  - 鏂板浜嗕竴涓嫭绔嬩簬姝ｅ父鏂囨。娴佺殑 `Fixed` 瀵艰埅鏍忥紝褰撻〉闈㈠悜涓嬫粴鍔ㄨ秴杩?150px 鏃讹紝璇ュ鑸爮浼氬钩婊戝湴浠庨《閮ㄦ粦鍑猴紝褰诲簳鎽嗚劚浜嗙埗瀹瑰櫒甯冨眬鐨勯檺鍒躲€?
  - 鍚搁《瀵艰埅鏍忓鍔犱簡 "娑堣垂鍒嗘瀽" 鏍囬锛屼娇鍏跺湪婊氬姩鍚庝緷鐒朵繚鎸佽壇濂界殑涓婁笅鏂囨彁绀恒€?

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 澧炲姞 `isStickyVisible` 鐘舵€佸拰婊氬姩鐩戝惉閫昏緫銆?
   - 浣跨敤 `fixed` 鍏冪礌瀹炵幇鑷畾涔夊惛椤舵晥鏋溿€?

## 1.8.32 - 2026-03-17

### UI/UX Improvements

- **椤堕儴绛涢€夋爮鏍峰紡鍗囩骇**:
  - 淇浜嗗洜涓虹埗瀹瑰櫒瀛樺湪 `relative` 灞炴€у彲鑳藉鑷寸殑 `sticky` 甯冨眬澶辨晥闂銆?
  - 浼樺寲浜嗙瓫閫夋爮鍚搁《鏃剁殑瑙嗚鏁堟灉锛岀Щ闄や簡绮楃硻鐨勫簳杈规锛屽鍔犱簡鏌斿拰鐨勯槾褰?(`shadow-sm`)銆?
  - 澧炲姞浜嗗唴杈硅窛 (`py-3 px-4`) 鍜屽渾瑙?(`rounded-xl`)锛屼娇鍏跺湪鍚搁《鏃剁湅璧锋潵鍍忎竴涓偓娴殑鐙珛鎺у埗闈㈡澘銆?
  - 鎼滅储妗嗐€佷笅鎷夎彍鍗曠殑鑳屾櫙鑹茶皟鏁翠负娣＄伆鑹?(`bg-gray-50/50`)锛屽苟娣诲姞浜?`hover` 鍜?`focus` 鐘舵€佷笅鐨勮繃娓″姩鐢伙紝鎻愬崌浜や簰璐ㄦ劅銆?

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 绉婚櫎澶栧眰瀹瑰櫒鐨?`relative` 绫汇€?
   - 鏇存柊 `sticky` 瀹瑰櫒鍙婂叾瀛愮粍浠剁殑 Tailwind 绫诲悕銆?

## 1.8.31 - 2026-03-17

### UI/UX Improvements

- **娑堣垂椤电瓫閫変氦浜掗噸鏋?*:
  - 绉婚櫎浜嗗彸涓嬭鐨勬偓娴瓫閫夋寜閽紙`FloatingFilterButton`锛夈€?
  - 灏嗛〉闈㈤《閮ㄧ殑鎼滅储妗嗐€佸钩鍙扮瓫閫夊拰鏃堕棿绛涢€夋ā鍧楁敼涓?*鍚搁《 (Sticky) 鏁堟灉**銆?
  - 鍦ㄥ悜涓嬫粴鍔ㄩ〉闈㈡椂锛岀瓫閫夋ā鍧椾細鍥哄畾鍦ㄩ〉闈㈤《閮ㄥ苟甯︽湁姣涚幓鐠?(Backdrop Blur) 鑳屾櫙锛屾柟渚跨敤鎴烽殢鏃惰繘琛屾暟鎹瓫閫夛紝浜や簰鏇村姞鐩磋鑷劧銆?

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 鍒犻櫎 `FloatingFilterButton` 缁勪欢鍙婂叾鐩稿叧閫昏緫銆?
   - 涓洪《閮ㄧ殑绛涢€夊鍣ㄦ坊鍔?`sticky top-0 z-40 bg-gray-50/95 backdrop-blur` 绛夋牱寮忕被銆?

## 1.8.30 - 2026-03-17

### Performance Improvements

- **鎮诞绛涢€夋寜閽交搴曡В鍐冲崱椤?*:
  - 鍙戠幇鎮诞鎸夐挳涔嬪墠鐨勫崱椤挎槸鐢变簬 `showFloatingFilter` 鐘舵€佺殑鏀瑰彉瑙﹀彂浜嗘暣涓?`ConsumptionDefaultTheme` 缁勪欢锛堝寘鍚墍鏈夊浘琛級鐨勯噸娓叉煋銆?
  - 灏嗘偓娴寜閽強鍏剁姸鎬侊紙`showFloatingFilter`, `filterOpen`锛夊拰婊氬姩鐩戝惉閫昏緫鎶界鎴愪簡鐙珛鐨勫瓙缁勪欢 `FloatingFilterButton`銆?
  - 鐜板湪婊氬姩椤甸潰鏃讹紝鐘舵€佹洿鏂板彧浼氬湪 `FloatingFilterButton` 缁勪欢鍐呴儴鍙戠敓锛屼笉浼氬啀寮曡捣澶嶆潅鍥捐〃缁勪欢鐨勬棤鏁堥噸娓叉煋锛屽交搴曡В鍐充簡婊氬姩鍗￠】闂銆?

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 鏂板 `FloatingFilterButton` 缁勪欢銆?
   - 绉婚櫎 `ConsumptionDefaultTheme` 涓殑婊氬姩鐩戝惉鍜屾偓娴寜閽浉鍏崇姸鎬併€?

## 1.8.29 - 2026-03-17

### Performance Improvements

- **鎮诞绛涢€夋寜閽覆鏌撲紭鍖?*:
  - 淇浜嗗悜涓嬫粴鍔ㄦ椂鎮诞绛涢€夋寜閽嚭鐜板鑷撮〉闈㈠崱椤跨殑闂銆?
  - 涓烘粴鍔ㄤ簨浠剁洃鍚櫒娣诲姞浜?`{ passive: true }` 閫夐」锛屾彁鍗囨粴鍔ㄦ€ц兘銆?
  - 浼樺寲浜嗘偓娴寜閽殑鍔ㄧ敾閫昏緫锛屼娇鐢?`willChange: 'transform, opacity'` 鎻愮ず娴忚鍣ㄨ繘琛岀‖浠跺姞閫?(GPU 娓叉煋)銆?
  - 缂╃煭浜嗘偓娴寜閽殑鍨傜洿绉诲姩璺濈锛堜粠 `translate-y-20` 浼樺寲涓?`translate-y-10`锛夛紝鍑忓皯閲嶇粯璐熸媴銆?
  - 浣跨敤 `PopoverTrigger asChild` 鏇挎崲浜嗘墜鍔?onClick 缁戝畾锛屼娇缁勪欢灞傜骇鏇寸鍚?Shadcn/UI 瑙勮寖锛岄伩鍏嶅浣欑殑浜嬩欢澶勭悊寮€閿€銆?

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 浼樺寲 `handleScroll`锛屾坊鍔?`passive: true`銆?
   - 浼樺寲娴姩鎸夐挳鐨?`className` 鍜?`style`銆?

## 1.8.28 - 2026-03-17

### Fixes

- **娑堣垂椤靛浘琛ㄤ富棰樿壊淇**:
  - 淇浜嗗皢 Recharts 鏇挎崲涓?ECharts 鍚庡鑷寸殑鍥捐〃涓婚鑹蹭涪澶遍棶棰樸€?
  - 灏嗘墍鏈夊浘琛ㄧ殑棰滆壊缁熶竴涓烘棩鍘嗗浘鐨勮摑鑹茶壊闃讹紙`#1d4ed8`, `#3b82f6`, `#60a5fa`, `#93c5fd`, `#dbeafe`锛夈€?
  - 鏇存柊浜?`mockData.ts` 涓殑纭紪鐮?CSS 鍙橀噺涓哄搴旂殑 Hex 棰滆壊鍊笺€?

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 鏇存柊鍫嗗彔鏌辩姸鍥俱€佹暎鐐瑰浘绛夊浘琛ㄧ殑纭紪鐮侀鑹层€?
2. `web/src/features/consumption/mockData.ts`
   - 灏?`var(--color-chart-X)` 鏇挎崲涓鸿摑鑹茶壊闃躲€?

## 1.8.27 - 2026-03-17

### Features

- **娑堣垂椤靛浘琛ㄥ紩鎿庡叏闈㈠崌绾?*:
  - 灏嗘秷璐归〉闈?(`ConsumptionDefaultTheme.tsx`) 涓殑鎵€鏈?Recharts 鍥捐〃锛圥ie, Bar, Line, Scatter, Composed锛夊叏閮ㄦ浛鎹负 ECharts (Canvas 娓叉煋)銆?
  - 瑙ｅ喅浜嗙敱浜?Recharts (SVG) 鑺傜偣杩囧瀵艰嚧鐨勯〉闈㈡粴鍔ㄤ弗閲嶅崱椤块棶棰橈紝瀹炵幇浜嗕笣婊戠殑婊氬姩浣撻獙銆?
  - 涓烘墍鏈?ECharts 鍥捐〃瀹炵幇浜嗙粺涓€鐨勯槻鎶?(200ms) resize 鐩戝惉锛岀鐢ㄤ簡榛樿鐨?`autoResize`锛岃繘涓€姝ヤ紭鍖栦簡绐楀彛鎷栨嫿鏃剁殑鎬ц兘銆?
  - 浼樺寲浜嗘粴鍔ㄤ簨浠剁洃鍚櫒锛屼娇鐢?`requestAnimationFrame` 杩涜鑺傛祦澶勭悊锛屽噺灏戜富绾跨▼鍗犵敤銆?

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 绉婚櫎 Recharts 鐩稿叧渚濊禆銆?
   - 浣跨敤 `ReactECharts` 鏇挎崲鎵€鏈夊浘琛ㄧ粍浠躲€?
   - 瀹炵幇浜嗙粺涓€鐨?`chartsRef` 绠＄悊鍜?resize 閫昏緫銆?
   - 浼樺寲 `handleScroll` 涓?RAF 鑺傛祦妯″紡銆?

## 1.8.26 - 2026-03-17

### Features

- **娑堣垂椤甸潰鎬ц兘浼樺寲**:
  - 淇浜嗘嫋鎷借皟鏁寸獥鍙ｅぇ灏忔椂椤甸潰涓ラ噸鍗￠】鐨勯棶棰樸€?
  - 涓烘墍鏈?Recharts 鍥捐〃瀹瑰櫒 (`ChartContainer`) 娣诲姞浜嗛粯璁ょ殑闃叉姈 (debounce) 澶勭悊 (200ms)锛岄伩鍏嶉绻侀噸缁樸€?
  - 涓?ECharts 鍥捐〃娣诲姞浜嗘墜鍔ㄩ槻鎶?resize 鐩戝惉锛屽苟绂佺敤浜嗚嚜鍔?resize锛屾樉钁楅檷浣庝簡 resize 鏃剁殑璁＄畻璐熻浇銆?
  - 浼樺寲浜嗙Щ鍔ㄧ妫€娴?(`isMobile`) 鐨?resize 鐩戝惉鍣紝娣诲姞浜嗛槻鎶栧鐞嗐€?

### Modified Files

1. `web/src/components/ui/chart.tsx`
   - `ChartContainer` 鏂板 `debounce` 灞炴€э紝榛樿鍊间负 200ms銆?
   - 灏?`debounce` 灞炴€т紶閫掔粰 `RechartsPrimitive.ResponsiveContainer`銆?
2. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 浼樺寲 `checkMobile` 鍑芥暟锛屾坊鍔?resize 闃叉姈銆?
   - 浼樺寲 ECharts 妗戝熀鍥撅紝绂佺敤 `autoResize`锛屼娇鐢ㄨ嚜瀹氫箟鐨勯槻鎶?resize 閫昏緫銆?

## 1.8.25 - 2026-03-17

### Features

- **鏂板鍏充簬椤甸潰**:
  - 渚ц竟鏍忔柊澧?鍏充簬"鍏ュ彛
  - 椤圭洰浠嬬粛妯″潡锛氬睍绀洪」鐩悕绉般€佺増鏈€佹妧鏈爤鍜屼富瑕佸姛鑳?
  - 鐗堟湰鏇存柊璁板綍妯″潡锛氬彲灞曞紑/鏀惰捣鐨勭増鏈巻鍙插垪琛紝鏀寔鍏ㄩ儴灞曞紑/鏀惰捣
  - 鏇存柊鐗堟湰妯″潡锛氭樉绀哄綋鍓嶇増鏈俊鎭紝鎻愪緵 GitHub Releases 涓嬭浇閾炬帴
  - 璐＄尞鑰呮ā鍧楋細灞曠ず鏍稿績寮€鍙戝洟闃熷拰绀惧尯璐＄尞鑰?
  - 缃戠珯妯″潡锛氭彁渚?GitHub 浠撳簱銆侀棶棰樺弽棣堛€佸姛鑳藉缓璁瓑閾炬帴

### Modified Files

1. `web/src/app/(dashboard)/about/page.tsx` (鏂板缓)
   - 鍒涘缓鍏充簬椤甸潰缁勪欢
   - 瀹炵幇浜斾釜鍔熻兘妯″潡
2. `web/src/components/shared/Sidebar.tsx`
   - 娣诲姞 Info 鍥炬爣瀵煎叆
   - 鍦ㄥ鑸彍鍗曚腑娣诲姞"鍏充簬"鍏ュ彛

## 1.8.24 - 2026-03-14

### Features

- **妗戝熀鍥惧崌绾т负 ECharts**:
  - 浠?Recharts 鏇挎崲涓?ECharts 妗戝熀鍥剧粍浠?
  - 鏀寔 4 绾у垎鏀暟鎹祦灞曠ず
  - 娣诲姞绗?4 绾ц妭鐐癸細椁愰ギ锛堟槦宸村厠銆侀害褰撳姵銆佺憺骞稿挅鍟°€佺編鍥㈠鍗栵級銆佽喘鐗╋紙浜笢鍟嗗煄銆佹窐瀹濄€佹嫾澶氬锛夈€佷氦閫氾紙婊存淮鍑鸿銆佸湴閾併€佸叕浜わ級銆佸ū涔愶紙鐖卞鑹恒€佽吘璁棰戯級銆佺敓娲伙紙璇濊垂鍏呭€笺€佹按鐢佃垂锛?
  - 鑺傜偣棰滆壊缁熶竴涓虹豢鑹茬郴 + 娣辫摑鑹诧紝绠€娲佺編瑙?
  - 杩炴帴绾夸娇鐢ㄦ笎鍙樿壊锛屼氦浜掓洿娴佺晠
- **娑堣垂椤靛竷灞€浼樺寲**:
  - 妗戝熀鍥惧鍣ㄩ珮搴﹁皟鏁达紙300px 鈫?500px锛?
  - 绉诲姩绔鍩哄浘鏀寔妯悜婊氬姩鏌ョ湅
- **淇 hydration 璀﹀憡闂**:
  - 鍦?layout.tsx 娣诲姞 suppressHydrationWarning 灞炴€?
- **妗戝熀鍥惧竷灞€淇**:
  - 灏?ECharts 妗戝熀鍥?`layout` 浠?`none` 璋冩暣涓?`sankey`锛屾仮澶嶈嚜鍔ㄥ竷灞€绠楁硶
  - 淇鍥惧舰浠呭崰椤堕儴鍖哄煙鐨勯棶棰橈紝浣胯妭鐐逛笌杩炵嚎鎸夊鍣ㄩ珮搴︽甯稿垎甯?
  - 淇 `DelayedRender` 杩囨浮灞傛湭璁剧疆 `h-full w-full` 瀵艰嚧瀛愬浘琛?`height: 100%` 澶辨晥
- **鍌ㄨ搫寮圭獥浜や簰淇**:
  - 淇绉诲姩绔?纭鍏抽棴"鍦ㄥ彇娑堝悗鍐嶆鍙嶅寮瑰嚭鐨勯棶棰?
  - 淇 BottomSheet 搴曢儴婊戝嚭/鏀跺洖鍔ㄧ敾涓嶈繛璐紙闂儊锛夌殑闂锛岀粺涓€鍔ㄧ敾鏇茬嚎涓庢墽琛屾柟寮?
  - 涓哄叧闂‘璁ゆ祦绋嬪鍔犱竴娆℃€ф斁琛屾爣璁帮紝閬垮厤 `onOpenChange(false)` 浜屾瑙﹀彂鏃堕噸澶嶈繘鍏ユ湭淇濆瓨纭
  - 澧炲姞鍏抽棴纭鐘舵€侀攣涓庡彇娑堝悗涓€娆℃€у拷鐣ユ満鍒讹紝娑堥櫎浜嬩欢杩炲彂瀵艰嚧鐨勫啀娆″脊绐?
- **椤甸潰鍒囨崲鎬ц兘浼樺寲**:
  - 瀵规€昏銆佽祫浜с€佹秷璐广€佸偍钃勩€佽捶娆鹃〉闈㈢殑鏍稿績鍥捐〃瑙嗗浘锛堝 `ConsumptionDefaultTheme`锛夊簲鐢ㄤ簡 `next/dynamic` 寮傛鍔犺浇 (ssr: false)銆?
  - 褰诲簳瑙ｅ喅浜嗛€氳繃渚ц竟鏍忓垏鎹㈤〉闈㈡椂锛堝挨鍏舵槸鍒囨崲鍒版秷璐归〉闈㈡椂锛夌敱浜庡悓姝ュ姞杞藉ぇ閲忓浘琛ㄧ粍浠讹紙ECharts/Recharts锛夊鑷寸殑涓荤嚎绋嬮樆濉炲拰椤甸潰鍗￠】闂銆?
  - 瀹炵幇浜嗛〉闈㈠垏鎹㈢殑鐬棿鍝嶅簲锛屾彁鍗囦簡鍏ㄧ珯瀵艰埅鐨勬祦鐣呭害銆?

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 妗戝熀鍥炬浛鎹负 ECharts 瀹炵幇
   - 娴獥绛涢€夋寜閽慨澶嶆寜閽祵濂楅棶棰?
2. `web/src/features/consumption/mockData.ts`
   - 妗戝熀鍥炬暟鎹墿灞曚负 4 绾у垎鏀?
3. `web/src/app/layout.tsx`
   - 娣诲姞 suppressHydrationWarning 灞炴€?

### Dependencies

- 鏂板锛歟charts
- 鏂板锛歟charts-for-react

## 1.8.23 - 2026-03-14

### Features

- **娑堣垂椤电Щ鍔ㄧ鍥捐〃浼樺寲**:
  - 鏀嚭瓒嬪娍鍥捐〃锛氱Щ鍔ㄧ鍙鍖哄煙鏄剧ず 8 涓暟鎹偣锛屾敮鎸佹í鍚戞粦鍔ㄦ煡鐪嬪畬鏁存暟鎹?
  - 娑堣垂鍒嗙被鍫嗙Н鍥捐〃锛氱Щ鍔ㄧ鍙鍖哄煙鏄剧ず 6 鏍规煴瀛愶紝鏀寔妯悜婊戝姩鏌ョ湅瀹屾暣鏁版嵁
  - 妗戝熀鍥撅細PC 绔崰婊″鍣ㄥ搴︼紝绉诲姩绔敮鎸佹í鍚戞粴鍔紝鍙宠竟璺濊皟鏁?(80 鈫?120)

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 鏀嚭瓒嬪娍鍥捐〃瀹藉害璋冩暣 (w-\[2000px] 鈫?w-\[1200px])
   - 娑堣垂鍒嗙被鍫嗙Н鍥捐〃瀹藉害璋冩暣 (w-\[1500px] 鈫?w-\[750px])
   - 妗戝熀鍥?PC 绔搴︿慨澶嶅拰鍙宠竟璺濊皟鏁?

## 1.8.22 - 2026-03-14

### Features

- **娑堣垂椤电Щ鍔ㄧ浼樺寲**:
  - 璋冩暣鏀粯骞冲彴鍒嗗竷鍜屾敹鏀垎鏋愬浘琛ㄥ昂瀵?(160px 鈫?100px)
  - 浼樺寲鍥捐〃鍐呴儴闂磋窛锛屽噺灏?padding 鍜?margin
  - 鍦嗙幆鍥剧嚎瀹藉搷搴斿紡璋冩暣 (PC: 4px, 绉诲姩绔細12px)
  - 鍥捐〃灞呬腑瀵归綈浼樺寲
- **鍥捐〃妯悜婊氬姩鏀寔**:
  - 鏀嚭瓒嬪娍鍥捐〃鏀寔妯悜婊戝姩锛岀Щ鍔ㄧ鍥哄畾 500px 瀹藉害
  - 娑堣垂鍒嗙被鍫嗙Н鍥捐〃鏀寔妯悜婊戝姩锛屾渶澶氭樉绀?10 鏍规煴瀛?
  - PC 绔嚜鍔ㄥ崰婊″鍣ㄥ搴︼紝绉诲姩绔繚鐣欐粴鍔ㄥ姛鑳?
- **鍥捐〃甯冨眬浼樺寲**:
  - 甯曠疮鎵樺垎鏋愬浘琛ㄥ噺灏戝乏鍙宠竟璺濓紝鏌卞瓙瀹藉害澧炲姞 (30 鈫?60)
  - 鐑棬鍟嗗鍥捐〃绉婚櫎鍙充晶杈硅窛锛屾潯褰㈠浘绱ц创杈圭紭
  - 妗戝熀鍥惧彸杈硅窛浼樺寲 (150 鈫?80)
- **姣忔棩骞冲潎娑堣垂鍥捐〃澧炲己**:
  - 鏂板鍛ㄦ暟閫夋嫨鎸夐挳 (绗?1 鍛?- 绗?5 鍛?
  - X 杞存樉绀哄懆鍑犲拰鍏蜂綋鏃ユ湡 (濡傦細鍛ㄤ竴 3 鏈?2 鏃?
  - 鏍规嵁鐪熷疄鏃ュ巻璁＄畻鏃ユ湡锛屾敮鎸佹樉绀轰笂涓湀/涓嬩釜鏈堟棩鏈?
  - 绗竴鍛ㄤ粠 3 鏈?1 鍙?(鍛ㄦ棩) 寮€濮嬶紝鍛ㄤ竴鍒板叚鏄剧ず 2 鏈堟棩鏈?

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 绉诲姩绔浘琛ㄥ昂瀵稿拰闂磋窛浼樺寲
   - 鍝嶅簲寮忓渾鐜浘绾垮
   - 鍥捐〃妯悜婊氬姩鍔熻兘
   - 鍛ㄦ暟閫夋嫨鍜屾棩鏈熸樉绀?
   - 鏃ュ巻璁＄畻閫昏緫

## 1.8.21 - 2026-03-14

### Bug Fixes

- **鏁版嵁搴?transaction 琛ㄧ粨鏋勪慨澶?*:
  - 淇 `createdAt` 鍜?`updatedAt` 瀛楁缂哄皯榛樿鍊肩殑闂
  - 娣诲姞 `DEFAULT CURRENT_TIMESTAMP(3)` 榛樿鍊?
  - 娣诲姞 `ON UPDATE CURRENT_TIMESTAMP(3)` 鑷姩鏇存柊
  - 瑙ｅ喅鍚庣鍒涘缓浜ゆ槗鏃舵姤閿?"Field doesn't have a default value"

### 闂鏍规簮

1. 鍚庣缂哄皯 POST `/api/transactions` 鎺ュ彛锛堝凡鍦?v1.8.20 淇锛?
2. 鏁版嵁搴?`transaction` 琛ㄧ殑 `createdAt` 鍜?`updatedAt` 瀛楁娌℃湁榛樿鍊?
3. 瀵艰嚧 Prisma 鍒涘缓浜ゆ槗璁板綍鏃跺け璐?

### Modified Files

1. 鏁版嵁搴撲慨澶?
   - `ALTER TABLE transaction MODIFY COLUMN updatedAt datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`
   - `ALTER TABLE transaction MODIFY COLUMN createdAt datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)`

## 1.8.20 - 2026-03-14

### Features

- **鍚庣浜ゆ槗鍒涘缓鎺ュ彛**:
  - 鏂板 POST `/api/transactions` 鎺ュ彛
  - 鏀寔鍒涘缓鍗曟潯浜ゆ槗璁板綍锛堝彇娆俱€佹墦鍗＄瓑锛?
  - 蹇呭～瀛楁锛歛mount, type, category, platform, date
  - 鍙€夊瓧娈碉細merchant, description
  - 鑷姩鍏宠仈褰撳墠鐧诲綍鐢ㄦ埛鐨?userId

### Bug Fixes

- **鍙栨鍜屾墦鍗¤褰曚笉鏄剧ず闂**:
  - 涔嬪墠鍙湁瀵煎叆鎺ュ彛锛屾病鏈夊崟鏉″垱寤烘帴鍙?
  - 瀵艰嚧鍙栨鍜屾墦鍗℃椂鍒涘缓浜ゆ槗澶辫触
  - 鐜板湪鍙互姝ｅ父鍒涘缓骞舵樉绀轰氦鏄撹褰?

### Modified Files

1. `src/server/src/main.ts`
   - 娣诲姞 POST /api/transactions 璺敱
   - 瀹炵幇鍗曟潯浜ゆ槗鍒涘缓閫昏緫
   - 楠岃瘉蹇呭～瀛楁
   - 鑷姩娉ㄥ叆 userId

## 1.8.19 - 2026-03-14

### Features

- **瀛樺彇璁板綍鍒楄〃鏄剧ず浼樺寲**:
  - 鎵撳崱瀛樻鏃惰嚜鍔ㄥ垱寤轰氦鏄撹褰曪紙绫诲埆锛氬偍钃勫瓨娆撅級
  - 浼樺寲瀛樺彇璁板綍杩囨护閫昏緫锛屽悓鏃舵鏌?category 鍜?description 瀛楁
  - 纭繚鎵撳崱鍜屽彇娆捐褰曢兘鑳藉湪瀛樺彇璁板綍鍒楄〃涓樉绀?
  - 鏀寔鍏抽敭璇嶏細鍌ㄨ搫銆佸瓨娆俱€佺悊璐€佸熀閲戙€佽偂绁ㄣ€佸畾鎶曠瓑

### Modified Files

1. `web/src/features/savings/components/SavingsPlanDialog.tsx`
   - 鍦?`handleUpdatePlan` 鍑芥暟涓坊鍔犱氦鏄撳垱寤洪€昏緫
   - 褰撴墦鍗＄姸鎬佸彉涓?COMPLETED 鏃跺垱寤?INCOME 绫诲瀷浜ゆ槗
   - 浜ゆ槗鎻忚堪鍖呭惈鏈堜唤淇℃伅
2. `web/src/app/(dashboard)/savings/page.tsx`
   - 浼樺寲杩囨护閫昏緫锛屽悓鏃舵鏌?category 鍜?description
   - 鎵╁ぇ鍖归厤鑼冨洿锛岀‘淇濇墍鏈夊偍钃勭浉鍏充氦鏄撻兘鑳芥樉绀?

## 1.8.18 - 2026-03-14

### Features

- **鎵撳崱鍜屽彇娆炬棩鏈熸樉绀?*:
  - 鍦ㄥ偍钃勬墦鍗″脊绐椾腑鏄剧ず鎵撳崱鏃ユ湡鏃堕棿
  - 宸插畬鎴愮殑鎵撳崱璁板綍鏄剧ず "鎵撳崱锛歒YYY-MM-DD HH:mm"
  - 鍙栨浜ゆ槗鑷姩璁板綍褰撳墠鏃堕棿
  - 瀛樺彇璁板綍鍒楄〃鏄剧ず浜ゆ槗鏃ユ湡

### Modified Files

1. `web/src/features/savings/components/SavingsPlanDialog.tsx`
   - 娣诲姞 `createdAt` 鍜?`updatedAt` 瀛楁鍒扮被鍨嬪畾涔?
   - 鍦ㄦ墦鍗＄姸鎬佹寜閽笅鏂规樉绀烘墦鍗℃椂闂?
   - 浠呭宸插畬鎴愮姸鎬佹樉绀烘墦鍗℃棩鏈?

## 1.8.17 - 2026-03-14

### Features

- **Savings 椤甸潰鍙栨鍔熻兘**:
  - 鏂板鍙栨寮圭獥缁勪欢 `SavingsWithdrawalDialog`
  - 鍦ㄧ洰鏍囧垪琛ㄤ腑娣诲姞"鍙栨"鎸夐挳锛屾敮鎸佷粠鍌ㄨ搫鐩爣鍙栨
  - 鑷姩鍒涘缓鍙栨浜ゆ槗璁板綍锛堝垎绫伙細鍌ㄨ搫鍙栨锛?
  - 瀹炴椂鏇存柊鍌ㄨ搫鐩爣鐨勫綋鍓嶅瓨娆鹃噾棰?
  - 鍙栨閲戦楠岃瘉锛氫笉鑳借秴杩囧綋鍓嶅瓨娆?
  - 鏀寔澶囨敞璇存槑锛岃褰曞彇娆剧敤閫?

### Modified Files

1. `web/src/features/savings/components/SavingsWithdrawalDialog.tsx` (鏂板缓)
   - 鍒涘缓鍙栨寮圭獥缁勪欢
   - 瀹炵幇鍙栨琛ㄥ崟鍜岄獙璇侀€昏緫
   - 璋冪敤 API 鍒涘缓浜ゆ槗璁板綍鍜屾洿鏂板偍钃勭洰鏍?
2. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 娣诲姞 `onOpenWithdrawal` 鍥炶皟鍑芥暟
   - 鍦ㄧ洰鏍囧垪琛ㄦ搷浣滄爮娣诲姞"鍙栨"鎸夐挳
   - 鎸夐挳鍦ㄥ瓨娆句负 0 鏃剁鐢?
3. `web/src/app/(dashboard)/savings/page.tsx`
   - 瀵煎叆 `SavingsWithdrawalDialog` 缁勪欢
   - 娣诲姞鍙栨鐘舵€佺鐞?
   - 瀹炵幇 `openWithdrawal` 鍑芥暟
   - 浼犻€掑洖璋冨埌 `SavingsDefaultTheme`

## 1.8.16 - 2026-03-14

### Features

- **Dashboard 椤甸潰闆嗘垚鍌ㄨ搫鏁版嵁**:
  - Dashboard 鐨勬€昏祫浜х幇鍦ㄥ寘鍚偍钃勭洰鏍囩殑褰撳墠瀛樻
  - 浠?`/api/savings` 鑾峰彇鍌ㄨ搫鐩爣鏁版嵁
  - 鎬昏祫浜?= 甯歌璧勪骇 + 鍌ㄨ搫鐩爣瀛樻鎬诲拰

### Bug Fixes

- **Savings 椤甸潰甯冨眬鍋忕Щ闂**:
  - 淇浜嗗埛鏂伴〉闈㈡椂楠ㄦ灦灞忛珮搴﹂殢鏈哄鑷寸殑甯冨眬璺冲姩
  - 绉婚櫎浜嗛殢鏈洪珮搴﹁绠楋紝浣跨敤鍥哄畾鐨?Tailwind CSS 楂樺害绫?

### Improvements

- **Savings 椤甸潰楠ㄦ灦灞忓姞杞戒綋楠?*:
  - 鏂板涓撶敤楠ㄦ灦灞忕粍浠讹細
    - `StatsCardSkeleton()` - 缁熻鍗＄墖楠ㄦ灦灞?
    - `DistributionChartSkeleton()` - 鍒嗗竷鍥捐〃楠ㄦ灦灞?
    - `GoalsTableSkeleton()` - 鐩爣鍒楄〃琛ㄦ牸楠ㄦ灦灞?
    - `TransactionsSkeleton()` - 浜ゆ槗璁板綍楠ㄦ灦灞?
  - 鎵€鏈夐鏋跺睆浣跨敤鍥哄畾灏哄锛岀‘淇濆姞杞芥椂甯冨眬绋冲畾
  - 娣诲姞 `loading` 鍙傛暟鏀寔锛屾牴鎹姞杞界姸鎬佹樉绀洪鏋跺睆鎴栫湡瀹炴暟鎹?
  - 骞虫粦鐨勫姞杞藉姩鐢伙紝鎻愬崌鐢ㄦ埛浣撻獙

### Modified Files

1. `web/src/app/(dashboard)/page.tsx`
   - 娣诲姞鍌ㄨ搫鐩爣 API 璋冪敤
   - 淇敼鎬昏祫浜ц绠楅€昏緫锛屽寘鍚偍钃勫瓨娆?
2. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 鍒涘缓 4 涓笓鐢ㄩ鏋跺睆缁勪欢
   - 鏇存柊 `DelayedRender` 缁勪欢鏀寔鑷畾涔夐鏋跺睆
   - 娣诲姞 `loading` 鍙傛暟鍒扮粍浠?props
   - 涓烘墍鏈夊尯鍩熸坊鍔犻鏋跺睆鏀寔
3. `web/src/app/(dashboard)/savings/page.tsx`
   - 浼犻€?`loading` 鍙傛暟鍒?`SavingsDefaultTheme` 缁勪欢

## 1.8.15 - 2026-03-14

### Features

- **绉诲姩绔€傞厤**:
  - 鏂板绉诲姩绔鑸彍鍗?(Hamburger Menu)锛屼綅浜?Header 宸︿晶銆?
  - 闆嗘垚渚ф粦鎶藉眽 (Side Drawer)锛屽湪绉诲姩绔彁渚涘畬鏁寸殑渚ц竟鏍忓鑸姛鑳姐€?
  - 浼樺寲 Header 甯冨眬锛屽湪绉诲姩绔嚜鍔ㄩ€傞厤鏍囬涓庤彍鍗曟寜閽€?
- **浠〃鐩樹綋楠屼紭鍖?*:
  - 绉诲姩绔椤靛竷灞€閲嶆瀯锛氶噰鐢ㄦ洿绱у噾鐨勭綉鏍煎竷灞€ (Grid Layout)銆?
  - 缂╁皬绉诲姩绔崱鐗囧昂瀵镐笌鍐呰竟璺濓紝鎻愬崌灞忓箷绌洪棿鍒╃敤鐜囥€?
  - 浼樺寲瀛椾綋澶у皬涓庡浘鏍囧昂瀵革紝閫傞厤灏忓睆璁惧闃呰浣撻獙銆?
  - **瀛椾綋璋冩暣**:
    - 澧炲ぇ"鍑€璧勪骇"鏁板€煎瓧浣?(text-3xl -> text-4xl)銆?
    - 澧炲ぇ"鎬昏祫浜?璐熷€?杈呭姪淇℃伅瀛椾綋 (text-\[10px] -> text-xs/sm)锛屾彁鍗囧彲璇绘€с€?
  - **缁勪欢鍝嶅簲寮忎紭鍖?*:
    - "鏈€杩戜氦鏄?鍒楄〃椤瑰鍔犲脊鎬у竷灞€涓庢枃鏈埅鏂紝闃叉闀挎枃鏈牬鍧忓竷灞€銆?
    - "蹇嵎鍏ュ彛"缁勪欢鍦ㄧЩ鍔ㄧ缂╁皬鍥炬爣涓庡唴杈硅窛锛岄€傞厤灏忓睆鐐瑰嚮鍖哄煙銆?
  - **甯冨眬婧㈠嚭淇**:
    - 鍏ㄥ眬瀹瑰櫒澧炲姞 `overflow-x-hidden`锛岄槻姝㈡按骞虫粴鍔ㄣ€?
    - 浠〃鐩?Grid 瀛愰」澧炲姞 `min-w-0`锛岄槻姝㈠浘琛ㄧ瓑瀹藉唴瀹规拺寮€缃戞牸銆?
    - 淇"甯姪"鍗＄墖瑁呴グ鍦嗗湀鐨勭粷瀵瑰畾浣嶆孩鍑洪棶棰樸€?
  - **瑙嗚浼樺寲**:
    - 鍏ㄥ眬鍔犳繁鍗＄墖杈规棰滆壊 (border-gray-100 -> border-gray-200)锛岃В鍐冲湪閮ㄥ垎灞忓箷涓婅竟妗嗕笉鍙鐨勯棶棰樸€?
  - **缁熶竴杈硅窛**:
    - 绉婚櫎璧勪骇銆佹秷璐广€佸偍钃勩€佽捶娆鹃〉闈㈢殑棰濆鍐呰竟璺?(`p-6`)锛岀粺涓€浣跨敤鍏ㄥ眬 Layout 鎻愪緵鐨勬爣鍑嗚竟璺濓紝瑙ｅ喅绉诲姩绔?杈规杩囧帤"闂銆?

## 1.8.14 - 2026-03-14

### Features

- **娑堣垂椤典綋楠屼紭鍖?*:
  - 鏂板搴曢儴鎮诞绛涢€夋寜閽?(Floating Filter Button)锛屼笅婊戞粴鍔ㄦ椂鑷姩鏄剧幇銆?
  - 鏀寔蹇嵎绛涢€夐潰鏉?(Popover)锛岄泦鎴愭悳绱€佸钩鍙拌繃婊や笌鏈堜唤鍒囨崲鍔熻兘锛屼笌椤堕儴绛涢€夋爮瀹炴椂鍚屾銆?
  - 浼樺寲婊氬姩鐩戝惉閫昏緫锛屼慨澶?`h-screen` 甯冨眬涓?`window.scrollY` 澶辨晥闂锛屾敼涓虹洃鍚?`main` 瀹瑰櫒婊氬姩銆?

## 1.8.13 - 2026-03-14

### Features

- **鍌ㄨ搫鎵撳崱娴佺▼缁熶竴**:
  - 缁熶竴"鏂板缓鐩爣/姣忔湀鎵撳崱/鎸囧畾璁″垝"鍒板悓涓€寮圭獥涓庡悓涓€璁″垝琛ㄧ晫闈€?
  - 鐩爣鍒楄〃鍏ュ彛鍙洿鎺ヨ繘鍏ヨ鍒掕〃姝ラ锛屽噺灏戣法寮圭獥鍒囨崲銆?
- **鎵撳崱璇嗗埆涓庢彁閱掑寮?*:
  - 鎵撳崱琛ㄤ粎灞曠ず"璁″垝瀛樻 > 0"鐨勫簲瀛樻鏈堜唤锛屽苟鍚屾楂樹寒褰撳墠鏈堜唤銆?
  - 鏂板鍙充笅瑙掓彁閱掞細鑻ヤ笂涓€涓簲瀛樻鏈堟湭鎵撳崱鍒欐彁绀猴紱鏈堝簳鏈€鍚庝竴澶╄嫢鏈湀鏈墦鍗″垯鎻愮ず銆?
- **鎵撳崱鍑瘉鏀寔**:
  - 姣忔湀鎵撳崱鏂板鍥剧墖涓婁紶涓庨瑙堣兘鍔涳紙鏈湴鎸佷箙鍖栵級銆?

### Fixed

- **鍌ㄨ搫璁″垝鎺ュ彛璋冪敤淇**:
  - 淇鎵撳崱寮圭獥璇锋眰钀藉埌鍓嶇绔彛瀵艰嚧鐨?404 涓?JSON 瑙ｆ瀽澶辫触闂锛岀粺涓€鏀逛负 API 鍩虹灏佽璋冪敤銆?
- **鍙闂€т慨澶?*:
  - 涓哄偍钃勭浉鍏冲脊绐楄ˉ榻?`DialogDescription`锛屾秷闄?`DialogContent` 鎻忚堪缂哄け鍛婅銆?
- **娑堣垂椤垫瀯寤洪敊璇慨澶?*:
  - 绉婚櫎娑堣垂涓婚缁勪欢涓殑鍐椾綑闂悎鏍囩锛屼慨澶?JSX 瑙ｆ瀽澶辫触瀵艰嚧鐨勬瀯寤烘姤閿欍€?

## 1.8.12 - 2026-03-14

### Features

- **娑堣垂椤垫繁搴﹀垎鏋愬浘琛ㄤ笂绾?*:
  - 鏂板 **璧勯噾娴佸悜妗戝熀鍥?* (Sankey Diagram)锛氱洿瑙傚睍绀?鏀跺叆鏉ユ簮 鉃?鏀粯璐︽埛 鉃?鏀嚭鍘诲悜"鐨勮祫閲戞祦鍔ㄥ叏鏅€?
  - 鏂板 **娑堣垂鏃舵鏁ｇ偣鍥?* (Scatter Plot)锛?4灏忔椂姘旀场鍒嗗竷鍥撅紝鍙鍖栧垎鏋愭秷璐逛範鎯紙濡傚崍椁?娣卞鏃舵锛夈€?
  - 鏂板 **鍗曠瑪閲戦鐩存柟鍥?* (Histogram)锛氱粺璁℃秷璐归噾棰濆尯闂村垎甯冿紝鍕惧嫆"缁嗘按闀挎祦"鎴?澶ч浣庨"娑堣垂鐢诲儚銆?

### Fixed

- **鍥捐〃鏍囩娓叉煋淇**:
  - 閲嶅啓妗戝熀鍥捐妭鐐规覆鏌撻€昏緫锛岃嚜瀹氫箟 Label 缁勪欢锛屼慨澶嶈妭鐐瑰悕绉颁笉鏄剧ず鐨勯棶棰樸€?
  - 浼樺寲妗戝熀鍥惧彸渚у竷灞€闂磋窛锛岄槻姝㈤暱鏂囨湰鏍囩锛堝"椁愰ギ缇庨"锛夎瀹瑰櫒鎴柇銆?

## 1.8.11 - 2026-03-14

### Performance

- **娑堣垂椤靛浘琛ㄦ柟鍚戞€у姩鏁堥噸鍋?*:
  - 绉婚櫎鍥捐〃瀹瑰櫒鐨勪綅绉昏繃娓★紝浠呬繚鐣欓€忔槑搴︽笎鏄撅紝淇"鏁翠綋鍋忕Щ"瑙傛劅銆?
  - 鏌辩姸鍥剧粺涓€鍚敤绾靛悜鐢熼暱鍔ㄧ敾鍙傛暟锛屾姌绾垮浘鍚敤宸﹀埌鍙崇粯鍒跺姩鐢诲弬鏁般€?
  - 娑堣垂鏃ュ巻鏀逛负鎸夋棩鏈熷崟鍏冩牸渚濇鏄剧幇锛屾仮澶?涓€涓釜鏂瑰潡鍔犺浇"鐨勫姩鎬佹晥鏋溿€?
  - 淇濈暀鍒嗘壒鎳掑姞杞界瓥鐣ワ紝鍏奸【鍔犺浇涓濇粦搴︿笌涓荤嚎绋嬪帇鍔涙帶鍒躲€?

## 1.8.10 - 2026-03-14

### Performance

- **娑堣垂椤靛姞杞藉姩鏁堜笌鎳掑姞杞戒慨澶?*:
  - 绉婚櫎鐢熺‖鐨勫叏灞€姝ヨ繘涓茶鏂规锛屾仮澶嶆寜鍖哄潡鍒嗘壒鎳掑姞杞界瓥鐣ャ€?
  - 鍥捐〃鍗＄墖鏀逛负骞虫粦杩囨浮锛堥€忔槑搴?+ 杞诲井浣嶇Щ鍔ㄧ敾锛夛紝鎻愬崌鍔犺浇涓濇粦鎰熴€?
  - 閲嶆柊鏍″噯棣栧睆涓庢粴鍔ㄥ尯寤惰繜鑺傚锛屼繚鐣欏姩鎬佸姞杞借鎰熷苟闄嶄綆骞跺彂娓叉煋鍘嬪姏銆?

## 1.8.9 - 2026-03-14

### Performance

- **娑堣垂椤靛浘琛ㄤ覆琛屽姞杞?*:
  - 鏂板娓叉煋姝ヨ繘鎺у埗锛屽浘琛ㄦ寜姝ラ閫愪釜鍔犺浇锛岄伩鍏嶅悓灞忓苟鍙戞覆鏌撳鑷村崱椤裤€?
  - `DelayedRender` 鏂板 `enabled` 寮€鍏筹紝浠呭湪鍛戒腑褰撳墠姝ラ鏃跺惎鍔ㄦ覆鏌撹皟搴︺€?
  - 棣栧睆鍥捐〃鏀逛负涓ユ牸涓茶瑙﹀彂锛屾粴鍔ㄥ尯鍥捐〃淇濇寔鎳掑姞杞藉墠鎻愪笅鎸夋楠や緷娆¤В閿併€?

## 1.8.8 - 2026-03-14

### Performance

- **娑堣垂椤靛埛鏂板崱椤夸紭鍖?*:
  - 浼樺寲 `DelayedRender` 璋冨害绛栫暐锛氭噿鍔犺浇鍦烘櫙鍔犲叆 `requestIdleCallback`锛屽苟瀹屽杽瀹氭椂鍣?绌洪棽鍥炶皟娓呯悊銆?
  - 鍒嗘暎鍥捐〃鎸傝浇寤惰繜锛岄伩鍏嶅埛鏂板悗澶氫釜鍥捐〃鍚屼竴鏃跺埢闆嗕腑娓叉煋閫犳垚涓荤嚎绋嬪皷宄般€?
  - 瀵瑰浘琛ㄩ厤缃笌绛涢€夋暟鎹仛璁板繂鍖栵紝鍑忓皯浜や簰鏈熼噸澶嶆覆鏌撲笌閲嶅璁＄畻銆?
  - 鐑姏鍥炬煡鍊肩敱寰幆鍐?`.find` 鏀逛负 `Map` 棰勭储寮曪紝闄嶄綆琛ㄦ牸娓叉煋寮€閿€銆?
  - 浜ゆ槗鏄庣粏鏀逛负娓叉煋绛涢€夌粨鏋滐紝绉婚櫎鏃犳晥杩囨护璁＄畻銆?

## 1.8.7 - 2026-03-14

### Fixed

- **娑堣垂椤靛搧鐗屽浘鏍囦慨姝?*:
  - 寰俊涓庢敮浠樺疂鍗＄墖鍥炬爣鏀逛负鍩轰簬 `simple-icons` 鐨勫畼鏂瑰搧鐗岀煝閲忚矾寰勩€?
  - 缁熶竴鍝佺墝搴曡壊涓庣櫧鑹蹭富鏍囷紝淇"鍥炬爣涓嶅儚瀹樻柟"鐨勮瘑鍒亸宸€?

## 1.8.6 - 2026-03-14

### Fixed

- **娑堣垂椤靛浘琛ㄥ埛鏂颁綅绉讳慨澶?*:
  - 閲嶆瀯 `DelayedRender` 娓叉煋缁撴瀯锛屽姞杞藉墠鍚庣粺涓€浣跨敤鍚屼竴澶栧眰瀹瑰櫒锛岄伩鍏嶅竷灞€閲嶆帓銆?
  - 绉婚櫎鍥捐〃杞藉叆鏃剁殑绾靛悜浣嶇Щ鍔ㄧ敾锛屼粎淇濈暀娣″叆鏁堟灉锛屾秷闄?涓婁笅璺冲姩"瑙傛劅銆?
  - 楗煎浘妯″潡瀹瑰櫒鍥哄畾涓?`200x200`锛岄鏋朵笌鐪熷疄鍥捐〃灏哄瀹屽叏涓€鑷达紝鍒锋柊鏃朵綅缃繚鎸佷笉鍙樸€?

## 1.8.5 - 2026-03-14

### UI/UX Improvements

- **娑堣垂椤典綋楠屼紭鍖?*:
  - 閲嶆瀯鍥捐〃鍔犺浇鐘舵€侊紝绉婚櫎鏁翠綋鍗犱綅绗︼紝鏀逛负鍗＄墖鍐呴鏋跺睆 (Skeleton) 鍔犺浇銆?
  - 淇鍥捐〃鍔犺浇鏃剁殑楂樺害璺冲彉闂锛岀‘淇濆姞杞藉墠鍚庡竷灞€绋冲畾銆?
  - 涓轰笉鍚岀被鍨嬬殑鍥捐〃锛堥ゼ鍥俱€佸垪琛ㄣ€佹枃鏈級瀹氬埗浜嗕笓灞炵殑楠ㄦ灦灞忔牱寮忋€?

## 1.8.4 - 2026-03-14

### UI/UX Improvements

- **娑堣垂椤靛浘琛ㄤ笌甯冨眬缁嗗寲**:
  - 淇绗?4 琛岀綉鏍肩瓑楂樻媺浼稿鑷寸殑甯曠疮鎵樺崱鐗囧簳閮ㄧ┖鐧斤紙`items-start`锛夈€?
  - 浼樺寲甯曠疮鎵樺浘鍐呰竟璺濅笌鍧愭爣杞寸嚎锛岃繘涓€姝ュ帇缂╂棤鏁堢暀鐧姐€?
  - 娑堣垂鏃ュ巻鏀逛负鎵佸钩鍖栧叏灞曠ず甯冨眬锛岀Щ闄ゆ粴鍔ㄥ苟璋冩暣鏂瑰潡闀垮姣斻€?
  - 椤堕儴鍥涘紶姒傝鍗＄墖鍥炬爣鏀惧ぇ锛屽苟缁熶竴寰俊/鏀粯瀹濆畼鏂归厤鑹蹭笌杈规鏍峰紡銆?

## 1.8.3 - 2026-03-14

### UI/UX Improvements

- **鍌ㄨ搫椤靛寮?*:
  - 鏂板 "鎸囧畾璁″垝" 鍔熻兘锛屾敮鎸佷负姣忎釜鐩爣璁惧畾鍒嗘湀瀛樻璁″垝銆?
  - 澧炲姞 "闅旀湀瀛? 妯″紡鐨勬偓娴鏄庡崱鐗?(Tooltip)銆?
  - 浼樺寲鐩爣鍗＄墖鎿嶄綔鏍忥紝澧炲姞蹇嵎璁″垝鍏ュ彛銆?
  - 鏂板鐩爣绫诲瀷锛氭瘡鏈堝瓨銆侀殧鏈堝瓨(鍗?鍙?銆?
  - 鏂板瀛樻绫诲瀷锛氱幇閲戙€佹鏈熴€佷粬浜哄府瀛樸€?
  - 浼樺寲鏂板缓/缂栬緫琛ㄥ崟锛屾敮鎸佹洿澶氶厤缃」銆?
  - **寮圭獥閲嶆瀯**:
    - "鏂板缓/缂栬緫鐩爣" 寮圭獥閲囩敤 Shadcn UI 缁勪欢閲嶆瀯锛岀晫闈㈡洿鍔犵幇浠ｅ寲銆?
    - 浼樺寲琛ㄥ崟甯冨眬锛屽鍔犲浘鏍囪緟鍔╋紝鎻愬崌杈撳叆浣撻獙銆?
- **鍌ㄨ搫椤甸噸鏋?*:
  - 瀵归綈娑堣垂椤?(Consumption) 涓婚椋庢牸锛岄噰鐢ㄧ粺涓€鐨勫崱鐗囪璁′笌閰嶈壊銆?
  - 鏂板 "鍌ㄨ搫鍒嗗竷" 楗煎浘 (鎸夌被鍨嬬粺璁?銆?
  - 浼樺寲 "鎬诲瓨娆?鐩爣鎬婚/鎬讳綋杩涘害" 姒傝鍗＄墖鏍峰紡銆?
  - 寮曞叆 `DelayedRender` 瀹炵幇浜ら敊鍔ㄧ敾涓庢噿鍔犺浇銆?
  - 鏂板鍌ㄨ搫鐩爣鎼滅储鍔熻兘銆?

## 1.8.2 - 2026-03-13

### UI/UX Improvements

- **渚ц竟鏍忎紭鍖?*: 淇渚ц竟鏍忚窡闅忔粴鍔ㄩ棶棰橈紝璋冩暣涓哄浐瀹氬竷灞€ (`h-screen`)锛屽苟鏂板 `Theme` (涓婚) 椤甸潰鍏ュ彛銆?
- **娑堣垂椤甸噸鏋?*:
  - 鏂板楠ㄦ灦灞忓姞杞藉姩鐢?(Skeleton Loading)
  - 椤堕儴鍗＄墖鏂板鍥炬爣 (Icons)
  - 楗煎浘鏍囩浼樺寲 (绉昏嚦搴曢儴鍙充晶)
  - 鏃ュ巻缁勪欢鏍峰紡浼樺寲 (瀛椾綋涓庢牸瀛愬ぇ灏忚皟鏁?
  - 鏂板杩囨护鍣細鍏ㄥ眬鎼滅储 (鍏抽敭璇?銆佸钩鍙扮瓫閫夈€佹棩鏈熺瓫閫?
  - 浼樺寲 "宸ヤ綔鏃?vs 鍛ㄦ湯" 鍥捐〃涓烘寜鍛?(鍛ㄤ竴鑷冲懆鏃? 姣忔棩骞冲潎娑堣垂缁熻
- **鍏ㄧ珯椋庢牸缁熶竴**: 閲嶆瀯璧勪骇 (Assets)銆佸偍钃?(Savings)銆佽捶娆?(Loans) 椤甸潰锛屽簲鐢ㄧ粺涓€鐨勫崱鐗囪璁°€佸浘鏍囦綋绯讳笌閰嶈壊鏂规銆?

## 1.8.1 - 2026-03-13

### Performance

- **娑堣垂椤垫€ц兘浼樺寲**:
  - 寮曞叆 `IntersectionObserver` 瀹炵幇鍥捐〃鎳掑姞杞斤紝浠呭湪婊氬姩鍙鏃舵覆鏌撱€?
  - 浼樺寲棣栧睆鍔犺浇绛栫暐锛屽垎鎵规娓叉煋棣栧睆鍥捐〃锛屽交搴曡В鍐冲鍥捐〃骞跺彂娓叉煋瀵艰嚧鐨勯〉闈㈠崱椤块棶棰樸€?

## 1.8.0 - 2026-03-13

### Architecture

- **鍓嶇鏋舵瀯閲嶆瀯**: 杩佺Щ鑷?Feature-based 鏋舵瀯 (`src/features/*`)锛屽垎绂?UI/Theme 涓庢暟鎹€昏緫銆?
- **妯″潡鍖?*: 鎷嗗垎 `dashboard`, `assets`, `consumption`, `savings`, `loans` 涓虹嫭绔嬬壒鎬фā鍧椼€?

### UI/UX

- **缁勪欢搴撳崌绾?*: 闆嗘垚 `shadcn/ui` 涓?`recharts`銆?
- **鍥捐〃澧炲己**:
  - 娑堣垂椤碉細鏂板骞冲彴鍒嗗竷楗煎浘銆佹敹鏀幆褰㈠浘銆佸晢瀹舵帓琛屾煴鐘跺浘銆佺儹鍔涘浘绛夈€?
  - 璧勪骇椤碉細鏂板璧勪骇浼板€煎崱鐗囥€?
  - 璐锋椤碉細鏂板杩樻璁″垝琛ㄤ笌杩涘害鍥俱€?
  - 鍌ㄨ搫椤碉細鏂板鐩爣杩涘害鍙鍖栥€?
- **涓婚鏀寔**: 瀹炵幇浜嗗熀浜庣粍浠剁殑涓婚鍒囨崲鏋舵瀯銆?

### Changed

- **绔彛鍙樻洿**: 鍚庣 API 绔彛璋冩暣涓?`3006`銆?

## 1.7.0 - 2026-03-13

### Added

- 棰勭畻绠＄悊妯″潡涓婄嚎锛?
  - 鍚庣鏂板棰勭畻 CRUD 鎺ュ彛锛屾敮鎸佹寜鏈?骞磋瀹氬垎绫绘垨鎬婚绠楋紝骞惰嚜鍔ㄧ粺璁¤繘搴?
  - 鍓嶇鏂板棰勭畻绠＄悊椤碉紝鏀寔灞曠ず杩涘害鏉★紙棰滆壊鍖哄垎棰勮鐘舵€侊級涓庡鍒犳敼鎿嶄綔

## 1.6.0 - 2026-03-13

### Added

- 浜ゆ槗绠＄悊澧炲己锛?
  - 鍚庣鏂板浜ゆ槗缂栬緫涓庡垹闄ゆ帴鍙ｏ紙`PUT/DELETE`锛?
  - 鍓嶇娑堣垂娴佹按鍒楄〃鏀寔鎮仠鏄剧ず鎿嶄綔鎸夐挳锛屽彲缂栬緫閲戦/鍒嗙被/鍟嗗/鏃堕棿鎴栧垹闄よ褰?

## 1.5.0 - 2026-03-13

### Added

- 娑堣垂鍒嗘瀽澧炲己锛?
  - 瓒嬪娍鍥炬敮鎸?鎸夋棩/鎸夋湀"鏃堕棿绮掑害鍒囨崲
  - 鍒嗙被鎺掕鏀寔"Top 5/10/20"绛涢€?
  - 鍚庣鎺ュ彛澧炲己 `groupBy` 涓?`limit` 鍙傛暟鏀寔

## 1.4.0 - 2026-03-13

### Added

- 璁剧疆妯″潡涓婄嚎锛?
  - 鍚庣鏂板鐢ㄦ埛淇℃伅淇敼涓庡瘑鐮侀噸缃帴鍙?
  - 鍓嶇鏂板璁剧疆椤碉紝鏀寔淇敼鏄电О涓庨噸缃瘑鐮?
- 鍩虹璁炬柦浼樺寲锛?
  - 鏍圭洰褰?`npm run dev` 鍙竴閿悓鏃跺惎鍔ㄥ墠鍚庣锛圕oncurrently锛?

## 1.3.0 - 2026-03-13

### Added

- 浠〃鐩橀椤碉紙Dashboard Home锛変笂绾匡細
  - 鑱氬悎灞曠ず鍑€璧勪骇銆佹€昏祫浜с€佹€昏礋鍊?
  - 灞曠ず鏈湀鏀嚭銆佹敹鍏ヤ笌缁撲綑
  - 灞曠ず鏈€杩?5 绗斾氦鏄撹褰曚笌蹇嵎鍔熻兘鍏ュ彛

## 1.2.0 - 2026-03-13

### Added

- 鍚庣鏂板璧勪骇锛圓sset锛夋ā鍧楋紝鏀寔璁板綍鐜伴噾/閾惰鍗?鏀粯瀹?寰俊/鎶曡祫绛夎祫浜э紙CRUD锛?
- 鍓嶇鏂板璧勪骇绠＄悊椤碉紝鏀寔灞曠ず鎬昏祫浜т及鍊笺€佽祫浜у崱鐗囦笌澧炲垹鏀规搷浣?

## 1.1.0 - 2026-03-13

### Added

- 鍓嶇璐锋椤垫柊澧?杩樻璁″垝"鍔熻兘锛堝熀浜庡墿浣欓噾棰濅笌鏈堜緵鑷姩鎺ㄧ畻锛?
- 鍓嶇娑堣垂椤垫柊澧炰氦鏄撹褰?CSV 瀵煎嚭鍔熻兘锛堟敮鎸佸綋鍓嶇瓫閫夋潯浠讹級

## 1.0.0 - 2026-03-13

### Added

- 鍚庣鏂板璐锋锛圠oan锛夋ā鍧楋紝鏀寔璁板綍璐锋鎬婚銆佽繕娆炬湡鏁颁笌鍓╀綑閲戦锛圕RUD锛?
- 鍓嶇鏂板璐锋绠＄悊椤碉紝鏀寔灞曠ず杩樻杩涘害鏉°€佹瘡鏈堣繕娆句俊鎭笌澧炲垹鏀规搷浣?

## 0.9.0 - 2026-03-13

### Added

- 鍚庣鏂板鍌ㄨ搫鐩爣锛圫avingsGoal锛夋ā鍧楋紝鏀寔 CRUD 鎺ュ彛锛堝唴瀛?Prisma 鍙屾ā寮忥級
- 鍓嶇鏂板鍌ㄨ搫鐩爣绠＄悊椤碉紝鏀寔灞曠ず鐩爣鍗＄墖銆佽繘搴︽潯涓庡鍒犳敼鎿嶄綔

## 0.8.0 - 2026-03-13

### Added

- 娑堣垂椤垫柊澧炴棩鏈熻寖鍥寸瓫閫夛紙蹇嵎鎸夐挳/鑷畾涔夛級涓庢敹鏀被鍨嬪垏鎹?
- 鍚庣娑堣垂鑱氬悎鎺ュ彛鏀寔鎸夋敹鏀被鍨嬶紙EXPENSE/INCOME锛変笌骞冲彴绛涢€?

## 0.7.0 - 2026-03-13

### Added

- 鍓嶇鏂板娉ㄥ唽椤碉紝瀹屽杽鐧诲綍/閫€鍑烘祦绋嬩笌 Header 鐢ㄦ埛灞曠ず
- 閴存潈瀹堝崼鍗囩骇涓烘牎楠?/api/auth/me锛孴oken 鏃犳晥鑷姩娓呴櫎骞惰烦杞櫥褰?

## 0.6.0 - 2026-03-13

### Added

- 娑堣垂椤垫柊澧炴寜鏃ヨ秼鍔挎姌绾垮浘涓庡垎绫?Top10 鍒嗗竷灞曠ず

## 0.5.0 - 2026-03-13

### Added

- 鍚庣鏂板 JWT 鐧诲綍/娉ㄥ唽涓庨壌鏉冧腑闂撮€昏緫锛屽苟灏嗘牳蹇冩暟鎹帴鍙ｇ撼鍏ラ壌鏉冧繚鎶?
- 鍓嶇鎺ュ叆鐧诲綍椤典笌 Token 瀛樺偍锛孌ashboard 璺敱缁勫鍔犳湭鐧诲綍璺宠浆
- 鍓嶇璇锋眰鏀逛负缁熶竴灏佽锛岃嚜鍔ㄦ惡甯?Authorization Bearer Token

## 0.4.0 - 2026-03-13

### Added

- 鏂板 PostgreSQL + Prisma 鏁版嵁搴撻厤缃枃妗ｏ紝骞惰ˉ榻愬悗绔?Prisma Studio 鑴氭湰
- 鍚庣鏂板娑堣垂鍒嗘瀽鑱氬悎鎸囨爣鎺ュ彛锛堟眹鎬?鎸夊钩鍙?鎸夊垎绫?鎸夋棩瓒嬪娍锛?
- 鍓嶇娑堣垂椤垫柊澧炴眹鎬诲崱鐗囦笌鎸夊钩鍙板垎甯冨睍绀猴紝骞舵敮鎸佸鍏ュ悗鑷姩鍒锋柊

## 0.3.0 - 2026-03-13

### Added

- 鍚庣鏂板浜ゆ槗瀵煎叆涓庢煡璇㈡帴鍙ｏ紙鏀寔寰俊/鏀粯瀹?CSV 瑙ｆ瀽銆佸幓閲嶄笌缁熻锛?
- 鍓嶇娑堣垂椤垫柊澧炶处鍗曞鍏ヤ笌鏀嚭娴佹按鍒楄〃锛堝垎椤靛睍绀猴級

## 0.2.0 - 2026-03-13

### Added

- 鍚庣鎺ュ叆 Prisma锛屾柊澧炴牳蹇冩暟鎹ā鍨嬩笌绀轰緥鐜鍙橀噺
- 杩炴帴鍩熷寮猴細OTP 鐢熸垚/鏍￠獙/鎾ら攢鏀寔鏁版嵁搴撴ā寮忥紝骞舵彁渚涜澶囧垪琛ㄦ帴鍙?
- 鍓嶇杩炴帴绠＄悊椤碉細鐢熸垚杩炴帴鐮佷笌鍊掕鏃躲€佽澶囧垪琛ㄤ笌鎾ら攢鎺堟潈

## 0.1.0 - 2026-03-13

### Added

- 鍒濆鍖栧墠绔?Next.js 宸ョ▼锛坵eb/锛夛紝寤虹珛 Dashboard 璺敱缁勪笌鍩虹甯冨眬
- 澧炲姞 TanStack Query Provider 浣滀负鍓嶇鏁版嵁璇锋眰鍩虹璁炬柦
- 鍒濆鍖栧悗绔?Express 宸ョ▼锛坰rc/server锛夛紝鎻愪緵鍋ュ悍妫€鏌ヤ笌杩炴帴鐮?API 楠ㄦ灦








