# 2026-04-03 修复 useInsertionEffect 运行时异常

## 本次变更

- 定位到根目录旧版 `dashboard` 模板仍引用 `framer-motion`。
- 移除 `src/app/(dashboard)/template.tsx` 中的动画包装，改回纯容器节点。
- 避免旧入口被启动时触发 `Cannot read properties of null (reading 'useInsertionEffect')`。

## 涉及文件

- `src/app/(dashboard)/template.tsx`
- `CHANGELOG.md`
- `docs/开发进度.md`

## 验证

- `npx next build`
- `npx next dev -p 3010`

## 结果说明

- 根目录旧版 Next 入口可正常启动。
- 浏览器访问首页时未再复现 `useInsertionEffect` 空值运行时异常。
