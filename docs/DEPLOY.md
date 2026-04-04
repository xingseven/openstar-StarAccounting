# 部署指南 (Deployment Guide)

本项目支持使用 Docker Compose 进行一键部署，包含 PostgreSQL 数据库、后端 API 服务与前端 Next.js 应用。

## 前置要求

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## 快速启动

1. **克隆项目**
   ```bash
   git clone https://github.com/xingseven/openstar-xfdashborad.git
   cd openstar-xfdashborad
   ```

2. **启动服务**
   ```bash
   docker-compose up -d --build
   ```
   该命令会自动构建前后端镜像并启动所有服务。
   - 数据库 (PostgreSQL): `5432`
   - 后端 (API): `3004`
   - 前端 (Web): `3000`

3. **访问应用**
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)。

## 环境变量配置

默认配置已在 `docker-compose.yml` 中设置。如需修改（如生产环境密钥），请修改 `docker-compose.yml` 中的 `environment` 部分：

- **server**:
  - `DATABASE_URL`: 数据库连接串
  - `JWT_SECRET`: JWT 签名密钥（生产环境务必修改）
  - `ALLOW_DEV_HEADERS`: 是否允许开发调试头（生产环境建议设为 0）

- **web**:
  - `NEXT_PUBLIC_API_URL`: 前端访问后端的 API 地址（默认为 `http://localhost:3004`）

## 数据持久化

数据库数据挂载在 Docker Volume `postgres_data` 中，重启容器不会丢失数据。

## 常见问题

- **数据库连接失败**：确保 `postgres` 容器已启动且健康检查通过 (`docker-compose ps`)。
- **Prisma Migration**：`server` 容器启动时会自动执行 `prisma migrate deploy`。如果表结构未更新，可手动进入容器执行：
  ```bash
  docker-compose exec server npx prisma migrate deploy
  ```
