# openstar-xfdashborad

## 目录

- `web/`：前端（Next.js App Router）
- `src/server/`：后端（Express + TypeScript + Prisma）
- `docs/`：开发文档与进度记录

## 本地运行

### 1) 启动后端

```bash
cd src/server
npm install
npm run dev
```

可选：配置 PostgreSQL 并启用持久化，参考 [数据库配置.md](file:///f:/1python/xiangmu/openstar-xfdashboard/docs/%E6%95%B0%E6%8D%AE%E5%BA%93%E9%85%8D%E7%BD%AE.md)

### 2) 启动前端

```bash
cd web
npm install
npm run dev
```

默认后端地址为 `http://localhost:3001`，可在 `web/.env` 中配置 `NEXT_PUBLIC_API_BASE_URL`。
