# APP 端更新发布准备清单

## 1. 这份文档是干什么的

这份文档只回答一件事：

如果以后你要给移动端 App 发新版本，到底要提前准备哪些东西。

它不讨论网页端刷新更新，只聚焦 App 安装包更新。

## 2. 当前项目的 App 更新方式

当前项目的设计是：

1. 关于页面点击“检查更新”
2. 前端请求你自己的后端接口
3. 后端读取更新清单
4. 如果有新的 App 安装包，就通过后端下载代理输出给用户
5. 用户下载安装新包
6. 重新安装更新

所以当前 App 端不是“热更新”，也不是“增量补丁”，而是：

**下载新安装包，再重新安装。**

## 3. 每次发 App 新版本，必须准备的东西

### 3.1 新版本号

你要先确定这次的版本号，例如：

- `2.3.8`
- `2.3.9`
- `2.4.0`

建议规则：

- 小修复：`2.3.8 -> 2.3.9`
- 新功能：`2.3.9 -> 2.4.0`
- 大改版：`2.x -> 3.0.0`

## 3.2 App 安装包文件

这是最核心的东西。

你至少要准备：

- Android：`.apk`

如果你后面还有桌面端，也可以准备：

- Windows：`.exe` 或 `.zip`
- macOS：`.dmg` 或 `.zip`

但当前你最优先准备的，通常是：

**Android APK**

## 3.3 安装包文件名

建议文件名统一规范，不要乱命名。

推荐格式：

```text
openstar-android-2.3.8.apk
```

如果以后有多个渠道包，可以这样：

```text
openstar-android-universal-2.3.8.apk
openstar-android-arm64-2.3.8.apk
openstar-android-debug-2.3.8.apk
```

正式给用户下载的包，建议不要放 `debug`。

## 3.4 更新说明

每次发包都要准备一段简短说明，最好 2 到 5 条。

例如：

- 修复连接验证码校验问题
- 新增交易同步能力
- 优化移动端底部导航
- 修复若干弹窗样式问题

这些说明会用于：

- `CHANGELOG.md`
- `web/public/updates/latest.json`
- 关于页面里的更新说明

## 3.5 下载信息

你还需要准备这几个信息：

- 下载项 `id`
- 展示名称 `label`
- 文件名 `fileName`
- 文件大小 `size`
- 简短描述 `description`

例如：

```json
{
  "id": "android-universal",
  "label": "Android 安装包",
  "fileName": "openstar-android-2.3.8.apk",
  "size": "28.4 MB",
  "description": "适用于大多数 Android 设备",
  "url": "/updates/downloads/openstar-android-2.3.8.apk"
}
```

## 4. 安装包应该放哪里

当前项目最推荐的方式是直接放到网站镜像目录：

```text
web/public/updates/downloads/
```

例如：

```text
web/public/updates/downloads/openstar-android-2.3.8.apk
```

这样部署网站后，后端就能通过本地静态资源找到这个安装包，不需要用户自己翻 GitHub。

## 5. 更新清单要怎么改

每次发 App 新版本时，都要更新：

```text
web/public/updates/latest.json
```

你重点改的是里面的 `app` 部分。

参考示例：

```json
{
  "version": "2.3.8",
  "publishedAt": "2026-03-24",
  "notes": [
    "修复连接验证码校验问题",
    "优化移动端导航交互",
    "改进关于页面更新检测能力"
  ],
  "web": {
    "version": "2.3.8",
    "action": "refresh",
    "description": "网页版部署后刷新即可获取新资源。",
    "downloads": []
  },
  "app": {
    "version": "2.3.8",
    "action": "reinstall",
    "description": "移动端 App 更新后需要下载安装并重新安装。",
    "downloads": [
      {
        "id": "android-universal",
        "label": "Android 安装包",
        "fileName": "openstar-android-2.3.8.apk",
        "size": "28.4 MB",
        "description": "适用于大多数 Android 设备",
        "url": "/updates/downloads/openstar-android-2.3.8.apk"
      }
    ]
  }
}
```

## 6. 如果还想放 GitHub 备用

如果你还想保留 GitHub Release 作为备用下载源，也可以。

做法是：

1. 把安装包上传到 GitHub Release
2. 在 `latest.json` 的 `url` 里填 GitHub 附件地址

例如：

```json
{
  "url": "https://github.com/你的仓库/releases/download/v2.3.8/openstar-android-2.3.8.apk"
}
```

但从你的目标来看，建议优先用：

```text
/updates/downloads/...
```

因为这样对没代理的用户更友好。

## 7. Android 发版前，你还要检查什么

如果你是 Android App，每次发版前至少检查这些：

### 必查项

- `versionName` 是否更新
- `versionCode` 是否递增
- 是否使用正式签名包
- 安装包能否正常安装
- 覆盖安装是否正常
- 连接服务器是否正常
- 下载后的 APK 是否完整

### 建议项

- 安卓 10/11/12/13 至少各测一台
- 深色模式下是否正常
- 中文文案是否完整
- 首次安装权限流程是否正常
- 更新后本地数据是否保留

## 8. 发布时的最小步骤

每次发 App 新版本，你最少按这个流程走：

1. 打包新的 APK
2. 修改 `CHANGELOG.md`
3. 修改 `web/public/updates/latest.json`
4. 把 APK 放进 `web/public/updates/downloads/`
5. 部署网站和后端
6. 打开关于页面点击“检查更新”
7. 测试下载和安装

## 9. 你现在真正要准备的东西

如果你下一步马上就要开始做 App 更新能力，当前最实际要准备的是这 6 个：

1. 一个正式可安装的 APK
2. 新版本号
3. 更新说明
4. 规范的安装包文件名
5. `latest.json` 里的 app 下载项
6. 网站镜像目录里的实际安装包文件

## 10. 目前还不用准备的东西

你现在先不用急着准备这些：

- 增量更新补丁
- 热更新系统
- 自动静默安装
- 多渠道复杂分发
- App Store / TestFlight 发布流程

因为你当前项目的更新链路已经足够：

**关于页检查更新 -> 下载 APK -> 重新安装**

先把这一版跑通，最重要。

## 11. 最后给你的建议

如果你下一步真要开始做 App 更新，我建议你按这个顺序：

1. 先产出第一份正式 APK
2. 我帮你把 `latest.json` 填好
3. 你把 APK 放到 `web/public/updates/downloads/`
4. 我再帮你把关于页面的下载入口联调到真实安装包

这样是最稳的，不容易乱。
