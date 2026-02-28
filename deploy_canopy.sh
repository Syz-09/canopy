#!/usr/bin/env bash
# 一键部署 CANOPY 静态网站（CentOS 7/8/Stream 适用）

set -e

SITE_NAME="canopy-website"
SITE_DEST="/var/www/${SITE_NAME}"
NGINX_CONF="/etc/nginx/conf.d/${SITE_NAME}.conf"

echo "=== CANOPY 部署开始 ==="

# 1. 必须 root
if [ "$EUID" -ne 0 ]; then
  echo "请用 root 身份运行：sudo bash deploy_canopy.sh"
  exit 1
fi

# 2. 确定包管理器（yum 或 dnf）
if command -v dnf >/dev/null 2>&1; then
  PKG_MGR="dnf"
else
  PKG_MGR="yum"
fi

echo "使用包管理器：${PKG_MGR}"

# 3. 安装 nginx（如未安装）
if ! command -v nginx >/dev/null 2>&1; then
  echo "安装 nginx..."
  ${PKG_MGR} install -y epel-release || true
  ${PKG_MGR} install -y nginx
else
  echo "已检测到 nginx，跳过安装。"
fi

# 4. 拷贝网站文件到 /var/www/canopy-website
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "脚本所在目录：${SCRIPT_DIR}"

echo "同步网站文件到 ${SITE_DEST} ..."
mkdir -p "${SITE_DEST}"
# 仅拷贝静态资源（排除脚本本身）
rsync -av --delete \
  --exclude "deploy_canopy.sh" \
  "${SCRIPT_DIR}/" "${SITE_DEST}/"

# 5. 配置 nginx 虚拟站点
echo "写入 nginx 配置：${NGINX_CONF}"

# 确保目录存在
mkdir -p /etc/nginx/conf.d

cat > "${NGINX_CONF}" <<'EOF'
server {
    listen 80;
    server_name _;

    root /var/www/canopy-website;
    index index.html;

    # Admin 与登录、API 由 Node 后端处理（需在 3000 端口运行 node server.js）
    location = /admin {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location /admin-login {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态站点
    location / {
        try_files $uri $uri/ =404;
    }

    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|webp)$ {
        try_files $uri =404;
        access_log off;
        add_header Cache-Control "public, max-age=31536000";
    }
}
EOF

# 6. 检查 nginx 配置语法
echo "启动/重载 nginx 并设置开机自启..."
systemctl enable nginx || true

if pgrep nginx >/dev/null 2>&1; then
  echo "nginx 已在运行，执行配置重载..."
  nginx -s reload || systemctl reload nginx || true
else
  echo "nginx 未运行，尝试启动..."
  systemctl start nginx
fi
echo "启动 nginx 并设置开机自启..."
systemctl enable nginx
systemctl restart nginx

# 8. 防火墙放行 80 端口（如果启用 firewalld）
if systemctl is-active firewalld >/dev/null 2>&1; then
  echo "检测到 firewalld，放行 HTTP 80 端口..."
  firewall-cmd --permanent --add-service=http || true
  firewall-cmd --reload || true
else
  echo "未检测到 firewalld，跳过防火墙配置。"
fi

echo "=== 部署完成 ==="
echo "现在可以在浏览器访问服务器 IP（http://你的服务器IP/）查看 CANOPY 网站。"