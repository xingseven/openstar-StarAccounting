# GitHub 自动推送说明

## 目标

- 每次代码提交后，自动把本地更新推送到 GitHub（main 分支）
- 提交信息使用中文描述更新内容

## 使用方式

- 本仓库提供 `.githooks/post-commit`，会在每次 `git commit` 成功后自动执行 `git push`
- 需要在本地启用 hooksPath：
  - `git config core.hooksPath .githooks`

## 注意

- 自动推送依赖本机已配置 GitHub 鉴权（HTTPS 凭据或 SSH Key）
- 如需暂停自动推送：`git config --unset core.hooksPath`

