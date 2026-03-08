# 使用 Vercel KV（Redis）存储 Submit 数据

本站 Submit 表单的提交数据保存在 **Vercel KV**（基于 Redis），Admin 后台从 KV 读取并展示。按下面步骤在 Vercel 上配置即可。

---

## 一、在 Vercel 添加 Redis 存储（获得 KV 环境变量）

1. 打开 [Vercel Dashboard](https://vercel.com/dashboard)，进入你的 **项目**（例如 `canopy-website`）。
2. 顶部点 **Storage**，再点 **Create Database**（或 **Connect Store**）。
3. 在列表里选 **Redis** 类存储：
   - 推荐选 **Upstash Redis**（Vercel 官方推荐，免费额度够用）。
   - 若看到 **Vercel KV**，也可选（底层也是 Redis）。
4. 按提示创建/连接：
   - 选一个 **Region**（离用户近即可）。
   - 记下或使用默认的 Store 名称。
   - 创建完成后，在 Storage 列表里点进刚创建的 Redis/KV Store。
5. 在 Store 页面里找到 **Connect to Project**（或 **.env** / **Environment Variables**）：
   - 选择当前这个 **Canopy 网站项目**，勾选 **Production / Preview / Development**（至少勾选 Production）。
   - 确认 **注入到项目的环境变量** 包含：
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN`
   - 保存后，这些变量会自动加到项目的 Environment Variables 里。

至此，项目已具备 KV 所需的环境变量，**无需再手动复制粘贴**（除非你本地开发要自己配）。

---

## 二、Admin 登录（可选）

若需要改 Admin 后台的登录账号，在 Vercel 项目里：

1. **Settings** → **Environment Variables**。
2. 添加（可选）：
   - `CANOPY_ADMIN_USER`：Admin 登录用户名（不设则代码里默认）。
   - `CANOPY_ADMIN_PASS`：Admin 登录密码（不设则代码里默认）。

保存后重新部署一次使变量生效。

---

## 三、部署与验证

1. 把代码推到 GitHub（或触发 Vercel 部署）。
2. 部署完成后：
   - 打开网站，在 **Submit** 页提交一条 Project / Feature / Contributor。
   - 打开 **`/admin`**，用上面设置的用户名密码登录。
   - 在 Admin 列表里应能看到刚提交的数据；可删除单条验证删除是否正常。

若列表为空或报错，请到 Vercel 项目 **Settings → Environment Variables** 确认 `KV_REST_API_URL` 和 `KV_REST_API_TOKEN` 已存在且对应的是刚创建的 Redis Store。

---

## 四、本地开发（可选）

要在本地跑 API 并连到同一套数据：

1. 在 Vercel 项目 **Settings → Environment Variables** 里复制 `KV_REST_API_URL` 和 `KV_REST_API_TOKEN` 的值。
2. 在项目根目录创建 `.env`（不要提交到 Git），写入：
   ```bash
   KV_REST_API_URL=https://xxx.upstash.io
   KV_REST_API_TOKEN=你的token
   ```
3. 用 `vercel dev` 或你当前用的方式启动本地服务（确保会读 `.env`），再访问本地的 Submit / Admin 进行测试。

---

## 小结

| 步骤 | 操作 |
|------|------|
| 1 | Vercel 项目 → **Storage** → 创建/连接 **Redis**（如 Upstash Redis） |
| 2 | 将该 Store **Connect to Project** 到当前 Canopy 项目，确认注入 `KV_REST_API_URL`、`KV_REST_API_TOKEN` |
| 3 | （可选）在 **Environment Variables** 中设置 `CANOPY_ADMIN_USER`、`CANOPY_ADMIN_PASS` |
| 4 | 部署后访问 Submit 提交一条，再访问 `/admin` 登录查看是否出现 |

数据存在 Redis 的 key：`canopy:submissions`（一个 JSON 数组）。
