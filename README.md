# OpenStar StarAccounting

## 仓库结构

- `web/`: 当前唯一生效的 Next.js 前端工程。
- `src/server/`: 当前唯一生效的后端服务、Prisma 和部署脚本。
- `src/` 中除 `server/` 以外的目录：历史前端副本，保留用于迁移比对，不作为默认启动入口。
- `docs/`: 开发、发布和迁移文档。

## 当前启动方式

在仓库根目录执行：

```bash
npm run dev
```

它会同时启动：

- 前端：`web/`
- 后端：`src/server/`

常用命令：

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run test:e2e
```

## 开发约定

- 前端业务代码统一维护在 `web/src/`。
- 后端代码统一维护在 `src/server/src/`。
- UI 组件脚手架、主题开发和页面改造，默认都以 `web/` 为目标目录。
- 根目录遗留前端暂不直接删除，删除前请先核对 `src/` 与 `web/src/` 的分叉文件。

## 目录收口说明

- CI、Playwright、Docker Compose 和非 Docker 部署脚本已经统一指向 `web/` 前端与 `src/server/` 后端。
- 根目录 `Dockerfile` 现在也按 `web/` 前端构建，避免误打包旧前端入口。
- 旧前端清理清单与迁移步骤见 `docs/前端目录收口开发文档.md`。
