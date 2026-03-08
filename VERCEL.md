# Vercel 部署说明

部署到 Vercel 后，Submit 表单数据会存在 **Vercel Blob（private）**，Admin 从 Blob 读取数据。

## 1) 创建 Blob 存储

1. 打开项目 -> **Storage** -> **Create Database**
2. 选择 **Blob**
3. 连接到当前项目后，会自动注入 `BLOB_READ_WRITE_TOKEN`

## 2) 设置 Admin 账号（可选）

在项目 **Settings -> Environment Variables** 添加：

- `CANOPY_ADMIN_USER`
- `CANOPY_ADMIN_PASS`

## 3) 部署与验证

1. 推送代码并等待 Vercel 部署完成
2. 在 `/submit` 提交一条数据
3. 打开 `/admin` 登录后查看是否出现新提交

如提交成功但列表为空，优先检查：

- `BLOB_READ_WRITE_TOKEN` 是否已注入当前环境（Production/Preview）
- 项目是否已经使用这版代码（引用 `api/blob-store.js`）
