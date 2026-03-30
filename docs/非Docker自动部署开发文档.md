# 非 Docker 自动部署开发文档

## 1. 背景

当前项目已经具备两部分能力：

1. 关于页可以检查更新，并在前端执行“刷新并更新”。
2. 仓库已经提供 Docker 部署文件和基础 CI。

但目前还缺少一条关键链路：

`GitHub push -> 服务器拉取最新代码 -> 安装依赖 -> 构建 -> 重启服务 -> 用户刷新网页拿到新版本`

这意味着“关于页刷新更新”只对“已经部署到服务器的新资源”生效，不能直接替代服务器部署。

## 2. 目标

本次开发目标是补齐一套适用于非 Docker 部署环境的自动化方案，支持：

1. 开发者把代码推送到 GitHub `main` 分支。
2. GitHub Actions 通过 SSH 登录目标服务器。
3. 服务器执行统一部署脚本。
4. 脚本完成代码同步、依赖安装、构建、`pm2` 重启和健康检查。
5. 部署成功后，关于页的“刷新并更新”可以让浏览器拿到已部署的新网页资源。

## 3. 非目标

本次开发不包含以下内容：

1. 不在网页前端直接执行 `git pull` 或直接改服务器文件。
2. 不替代数据库备份、迁移审批和正式发布流程。
3. 不自动修改 `web/public/updates/latest.json` 的版本号。
4. 不强依赖 Docker；Docker 方案继续保留。

## 4. 当前现状

### 4.1 已有能力

1. 关于页已接入更新检查接口与网页刷新更新入口。
2. 后端已提供 `/api/update/check` 和 `/api/update/download/...`。
3. 仓库已存在 `.github/workflows/ci.yml`。
4. 仓库已存在 `docker-compose.yml`、`web/Dockerfile`、`src/server/Dockerfile`。

### 4.2 缺口

1. 没有面向非 Docker 服务器的标准部署脚本。
2. 没有基于 SSH 的自动部署工作流。
3. 没有把 Linux/Windows 服务器差异整理成统一文档。
4. 没有健康检查和失败回滚边界说明。

## 5. 方案总览

### 5.1 总体流程

```text
开发者 push 到 main
  -> GitHub Actions 触发部署工作流
  -> 通过 SSH 连接服务器
  -> 运行仓库内部署脚本
  -> git fetch / pull
  -> 安装依赖
  -> 生成 Prisma Client
  -> 构建 server 与 web
  -> 使用 pm2 重启服务
  -> 健康检查
  -> 用户在关于页点击“刷新并更新”获取新前端资源
```

### 5.2 关键原则

1. 前端负责“感知新版本”和“刷新资源”。
2. GitHub Actions 负责“触发远程部署”。
3. 服务器脚本负责“真正上线新代码”。
4. 部署脚本必须可重复执行，不能依赖人工点操作。
5. 失败时应直接中止并返回错误，不能静默跳过。

## 6. 技术选型

### 6.1 进程管理

使用 `pm2` 管理两个常驻进程：

1. `src/server`：执行 `npm start`
2. `web`：执行 `npm start`

原因：

1. 现有项目就是 Node 常规运行方式。
2. `pm2` 同时适用于 Linux 和 Windows。
3. 支持按名称重启、保存进程、查看日志。

### 6.2 远程执行

GitHub Actions 使用 SSH 执行部署脚本。

原因：

1. 不要求服务器 Docker 化。
2. 不要求额外安装专用 agent。
3. 与现有 GitHub 仓库流程兼容。

## 7. 目录与产物规划

本次新增如下产物：

1. `docs/非Docker自动部署开发文档.md`
2. `scripts/deploy-linux.sh`
3. `scripts/deploy-windows.ps1`
4. `.github/workflows/deploy-non-docker.yml`

可选扩展产物：

1. `docs/DEPLOY.md` 增加文档跳转说明
2. 后续新增手动触发回滚工作流

## 8. 部署脚本职责

### 8.1 Linux 脚本职责

1. 校验 `git`、`node`、`npm`、`pm2`、`curl`。
2. 检查工作目录是否干净。
3. 同步指定分支最新代码。
4. 在 `src/server` 执行：
   - `npm ci`
   - `npx prisma generate`
   - `npm run build`
5. 在 `web` 执行：
   - `npm ci`
   - `npm run build`
6. 使用 `pm2` 启动或重启 `server` 与 `web`。
7. 对服务做健康检查。

### 8.2 Windows 脚本职责

1. 校验 `git`、`node`、`npm`、`pm2`。
2. 校验仓库目录存在。
3. 校验工作区干净。
4. 拉取指定分支最新代码。
5. 构建 `src/server` 与 `web`。
6. 用 `pm2` 启动或重启服务。
7. 通过 HTTP 请求检查服务是否恢复。

## 9. GitHub Actions 工作流职责

### 9.1 触发方式

1. `push` 到 `main`
2. 手动 `workflow_dispatch`

### 9.2 设计要求

1. 支持 Linux 部署。
2. 支持 Windows 部署。
3. 没有配置对应 Secrets 时，自动跳过对应环境。
4. 允许手动指定部署目标：`linux`、`windows`、`both`。

## 10. GitHub Secrets 规划

### 10.1 Linux

1. `DEPLOY_LINUX_HOST`
2. `DEPLOY_LINUX_PORT`
3. `DEPLOY_LINUX_USERNAME`
4. `DEPLOY_LINUX_SSH_KEY`
5. `DEPLOY_LINUX_APP_DIR`

### 10.2 Windows

1. `DEPLOY_WINDOWS_HOST`
2. `DEPLOY_WINDOWS_PORT`
3. `DEPLOY_WINDOWS_USERNAME`
4. `DEPLOY_WINDOWS_SSH_KEY`
5. `DEPLOY_WINDOWS_APP_DIR`

## 11. 服务器前置条件

### 11.1 通用

1. 服务器上已克隆本仓库。
2. 服务器可以访问 GitHub。
3. 已安装 Node.js 20+，推荐 Node.js 22。
4. 已安装 `pm2`。
5. 已准备生产环境变量文件。

### 11.2 进程命名建议

默认建议：

1. `openstar-server`
2. `openstar-web`

## 12. 风险与边界

### 12.1 代码仓库脏工作区

如果服务器部署目录里有未提交修改，脚本直接失败，不自动覆盖。

原因：

1. 避免误覆盖服务器上的本地调整。
2. 避免部署脚本在未知状态下继续运行。

### 12.2 构建成功但服务未恢复

脚本在 `pm2` 重启后执行健康检查。健康检查失败时，工作流返回失败，提示人工处理。

### 12.3 关于页更新提示与服务器部署不同步

这属于正常边界：

1. 关于页只读取更新清单和已部署资源。
2. 服务器还没部署成功时，前端刷新不会拿到新版本。

## 13. 开发计划

### 阶段一：文档与约束

1. 梳理当前更新与部署链路。
2. 确定非 Docker 自动部署的边界。
3. 输出本开发文档。

### 阶段二：脚本实现

1. 新增 Linux 部署脚本。
2. 新增 Windows 部署脚本。
3. 固化默认参数与健康检查地址。

### 阶段三：工作流实现

1. 新增 GitHub Actions 工作流。
2. 增加 `push main` 自动触发。
3. 增加手动触发入口。

### 阶段四：验证与交付

1. 校验脚本结构和参数。
2. 校验工作流引用路径。
3. 输出需要用户补充的 Secrets 和服务器准备事项。

## 14. 验收标准

满足以下条件即可视为第一版完成：

1. 仓库存在 Linux/Windows 两套非 Docker 部署脚本。
2. 仓库存在自动部署工作流。
3. 文档明确说明前端刷新更新与服务器部署的职责边界。
4. 工作流在缺少 Secrets 时不会误报成功。
5. 服务器部署成功后，用户刷新网页可以拿到新资源。

## 15. 后续增强建议

1. 增加回滚脚本，支持回滚到上一个 Git commit。
2. 增加部署前数据库备份。
3. 增加部署后自动写入版本清单。
4. 增加飞书、企业微信或邮件通知。
5. 将健康检查结果回写到发布记录中。
