# Vercel 部署说明

部署到 Vercel 后，Submit 表单数据会存在 **Vercel KV（Redis）**，Admin 从 KV 读取数据。

**配置步骤请查看 [VERCEL_KV.md](./VERCEL_KV.md)**，按其中「一、在 Vercel 添加 Redis 存储」完成 KV 连接与环境变量注入即可。
