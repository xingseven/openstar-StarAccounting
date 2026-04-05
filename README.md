# OpenStar StarAccounting

## 仓库结构

- `web/`: 当前唯一生效的 Next.js 前端工程。
- `src/server/`: 当前唯一生效的后端服务、Prisma 和部署脚本。
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
- 仓库根目录已不再保留旧前端源码与旧前端构建配置。

## 收口结果

- 历史前端目录 `src/app`、`src/components`、`src/features`、`src/lib`、`src/themes`、`src/types` 已移除。
- 根目录旧前端配置 `components.json`、`next.config.ts`、`tsconfig.json`、`next-env.d.ts` 和 `public/` 已移除。
- CI、Playwright、Docker Compose、非 Docker 部署脚本和根目录 Dockerfile 已统一指向 `web/` 前端与 `src/server/` 后端。
- 目录收口过程与核对结果见 `docs/前端目录收口开发文档.md`。
