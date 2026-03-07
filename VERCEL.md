# Vercel 部署说明

部署到 Vercel 后，Submit 表单数据会存在 **Vercel Blob**（无需自建数据库）。

## 1. 创建 Blob 存储

1. 打开 Vercel 项目 → **Storage** → **Create Database**
2. 选择 **Blob**，创建 store（名称随意）
3. 创建后项目会自动获得环境变量 `BLOB_READ_WRITE_TOKEN`

## 2. 环境变量（可选）

在 Vercel 项目 **Settings → Environment Variables** 中可设置：

- `CANOPY_ADMIN_USER`：Admin 登录用户名（默认 `canopy`）
- `CANOPY_ADMIN_PASS`：Admin 登录密码（默认 `canopy123`）

## 3. 部署

推送代码到 GitHub 后，Vercel 会自动构建并部署。部署完成后：

- 首页 / 静态页面：正常访问
- 提交表单：数据写入 Blob，提交成功会显示成功提示
- **Admin**：打开 `/admin`，用上面设置的用户名密码登录后可查看、删除所有提交
