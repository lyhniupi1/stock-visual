# 股票数据可视化项目 - Ubuntu Linux 云服务器部署指南

本文档详细说明如何在 Ubuntu Linux 云服务器上部署股票数据可视化项目的前端和后端。

## 📋 系统要求

### 服务器要求
- **操作系统**: Ubuntu 20.04 LTS 或更高版本
- **内存**: 至少 2GB RAM
- **存储**: 至少 10GB 可用空间
- **网络**: 公网 IP 地址，开放 80/443 端口

### 软件依赖
- **Node.js**: 18.x 或更高版本
- **npm**: 9.x 或更高版本
- **PM2**: 进程管理工具
- **Nginx**: Web 服务器和反向代理
- **SQLite3**: 数据库（已包含在项目中）

## 🚀 部署步骤概览

1. **服务器准备** - 系统更新和基础软件安装
2. **项目上传** - 将代码上传到服务器
3. **环境配置** - 配置生产环境变量
4. **依赖安装** - 安装 Node.js 依赖
5. **构建项目** - 构建前端和后端
6. **数据库准备** - 准备 SQLite 数据库
7. **进程管理** - 使用 PM2 管理服务
8. **反向代理** - 配置 Nginx
9. **SSL 证书** - 配置 HTTPS（可选）
10. **服务启动** - 启动所有服务

## 📝 详细部署步骤

### 1. 服务器准备

#### 1.1 更新系统
```bash
sudo apt update
sudo apt upgrade -y
```

#### 1.2 安装 Node.js 24.x
```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
```

验证安装：
```bash
node --version  
npm --version   
```

#### 1.3 安装 PM2 和 yarn
```bash
sudo npm install -g pm2
sudo npm install -g yarn
```

#### 1.4 安装 Nginx
```bash
sudo apt install -y nginx
```

#### 1.5 安装 SQLite3（如果未安装）
```bash
sudo apt install -y sqlite3
```

### 2. 项目上传

#### 2.1 创建项目目录
```bash
sudo mkdir -p /var/www/stock-visual
sudo chown -R $USER:$USER /var/www/stock-visual
```

#### 2.2 上传项目文件
将本地项目文件上传到服务器，可以使用以下方法之一：


**方法 : 使用 git（在服务器上执行）**
```bash
cd /var/www
git clone <your-repository-url> stock-visual
```

#### 2.3 验证文件结构
```bash
cd /var/www/stock-visual
ls -la
```
应该看到以下结构：
```
├── backend/
├── frontend/
├── package.json
└── README.md
```

### 3. 环境配置

#### 3.1 创建生产环境配置文件

**后端环境配置** (`/var/www/stock-visual/backend/.env.production`):
```bash
cd /var/www/stock-visual/backend
cat > .env.production << 'ENV'
DB_TYPE=sqlite
DB_DATABASE=/var/www/stock-visual/data/stocks.db
PORT=8080
NODE_ENV=production
ENV
```

**前端环境配置** (`/var/www/stock-visual/frontend/.env.production`):
```bash
cd /var/www/stock-visual/frontend
cat > .env.production << 'ENV'
NEXT_PUBLIC_API_URL=/api
NEXT_BACKEND_URL=http://localhost:8080
ENV
```

#### 3.2 创建数据目录
```bash
sudo mkdir -p /var/www/stock-visual/data
sudo chown -R $USER:$USER /var/www/stock-visual/data
```

### 4. 依赖安装

#### 4.1 安装根项目依赖
```bash
cd /var/www/stock-visual
npm install
```

#### 4.2 安装前端依赖
```bash
cd /var/www/stock-visual/frontend
yarn install
yarn build
```

#### 4.3 安装后端依赖
```bash
cd /var/www/stock-visual/backend
yarn install
yarn build
```



### 6. 数据库准备

使用magicformula项目下的db

### 7. 进程管理（使用 PM2）

#### 7.1 创建 PM2 配置文件 (`/var/www/stock-visual/ecosystem.config.js`)
```bash
cd /var/www/stock-visual
cat > ecosystem.config.js << 'CONFIG'
module.exports = {
  apps: [
    {
      name: 'stock-visual-backend',
      script: './backend/dist/main.js',
      cwd: '/var/www/stock-visual',
      env: {
        NODE_ENV: 'production',
        PORT: 8080,
        DB_DATABASE: '/root/magicFormula/src/data/magicFormulaData.db'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/stock-visual-backend-error.log',
      out_file: '/var/log/pm2/stock-visual-backend-out.log',
      log_file: '/var/log/pm2/stock-visual-backend-combined.log',
      time: true
    },
    {
      name: 'stock-visual-frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/stock-visual/frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/stock-visual-frontend-error.log',
      out_file: '/var/log/pm2/stock-visual-frontend-out.log',
      log_file: '/var/log/pm2/stock-visual-frontend-combined.log',
      time: true
    }
  ]
};
CONFIG
```

#### 7.2 创建日志目录
```bash
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2
```

#### 7.3 启动 PM2 服务
```bash
cd /var/www/stock-visual
pm2 start ecosystem.config.js
```

#### 7.4 设置 PM2 开机自启
```bash
pm2 startup
# 按照提示执行生成的命令
pm2 save
```

### 8. 反向代理配置（Nginx）

#### 8.1 创建 Nginx 站点配置
```bash
sudo nano /etc/nginx/sites-available/stock-visual
```

添加以下配置：
```nginx
server {
    listen 80;
    server_name 547206004.xyz www.547206004.xyz;
    
    # 前端静态文件
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 增加超时时间
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 静态文件缓存
    location /_next/static {
        proxy_cache_valid 200 60d;
        proxy_pass http://localhost:3000;
    }
    
    # 访问日志
    access_log /var/log/nginx/stock-visual-access.log;
    error_log /var/log/nginx/stock-visual-error.log;
}
```

#### 8.2 启用站点配置
```bash
sudo ln -s /etc/nginx/sites-available/stock-visual /etc/nginx/sites-enabled/
sudo nginx -t  # 测试配置
sudo systemctl restart nginx
```

### 9. SSL 证书配置（可选，推荐）

#### 9.1 安装 Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

#### 9.2 获取 SSL 证书
```bash
sudo certbot --nginx -d www.547206004.xyz
```

#### 9.3 自动续期测试
```bash
sudo certbot renew --dry-run
```

### 10. 防火墙配置

#### 10.1 配置 UFW 防火墙
```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw --force enable
```

### 11. 服务验证

#### 11.1 检查服务状态
```bash
# 检查 PM2 服务
pm2 status

# 检查 Nginx 服务
sudo systemctl status nginx

# 检查端口监听
sudo netstat -tulpn | grep -E ':(80|443|3000|8080)'
```

#### 11.2 测试 API 端点
```bash
curl http://localhost:8080/api/stocks/codes
```

#### 11.3 测试前端访问
在浏览器中访问：
- `http://your-domain.com` (HTTP)
- `https://your-domain.com` (HTTPS，如果配置了 SSL)

## 🔧 维护和监控

### 查看日志
```bash
# PM2 日志
pm2 logs stock-visual-backend
pm2 logs stock-visual-frontend

# Nginx 日志
sudo tail -f /var/log/nginx/stock-visual-access.log
sudo tail -f /var/log/nginx/stock-visual-error.log
```

### 重启服务
```bash
# 重启所有服务
pm2 restart all

# 重启单个服务
pm2 restart stock-visual-backend
pm2 restart stock-visual-frontend

# 修改pm2环境变量后重启 需要删掉后 重新刷入环境变量
pm2 delete  stock-visual-frontend
pm2 delete stock-visual-backend
pm2 start ecosystem.config.js --env production

# 重启 Nginx
sudo systemctl restart nginx
```

### 更新部署
当代码更新时：
```bash
cd /var/www/stock-visual
git pull origin main  # 如果使用 git

# 重新安装依赖
npm install
cd frontend && yarn install
cd ../backend && yarn install

# 重新构建
cd /var/www/stock-visual/frontend
yarn build
cd ../backend && yarn build


# 重启服务
pm2 restart all
```

## 🐛 故障排除

### 常见问题

#### 1. 端口被占用
```bash
# 查看端口占用
sudo lsof -i :3000
sudo lsof -i :8080

# 杀死占用进程
sudo kill -9 <PID>
```

#### 2. 数据库权限问题
```bash
sudo chmod 644 /var/www/stock-visual/data/stocks.db
sudo chown $USER:$USER /var/www/stock-visual/data/stocks.db
```

#### 3. Node.js 内存不足
编辑 PM2 配置文件，增加内存限制：
```javascript
max_memory_restart: '2G'  // 增加到 2GB
```

#### 4. Nginx 502 Bad Gateway
检查后端服务是否运行：
```bash
pm2 status stock-visual-backend
curl http://localhost:8080/api/stocks/codes
```

### 调试命令
```bash
# 查看服务状态
pm2 monit

# 查看详细进程信息
pm2 describe stock-visual-backend

# 查看系统资源
htop
free -h
df -h
```

## 📊 性能优化建议

### 1. 数据库优化
- 定期清理旧数据
- 为常用查询字段创建索引
- 考虑使用 SQLite WAL 模式

### 2. 前端优化
- 启用 Next.js 图片优化
- 使用 CDN 加速静态资源
- 实现客户端缓存

### 3. 后端优化
- 实现 API 响应缓存
- 使用连接池管理数据库连接
- 优化数据库查询

### 4. 服务器优化
- 启用 Nginx gzip 压缩
- 配置适当的缓存头
- 使用 HTTP/2

## 🔒 安全建议

### 1. 服务器安全
- 定期更新系统和软件
- 使用强密码或 SSH 密钥
- 配置防火墙规则
- 禁用 root SSH 登录

### 2. 应用安全
- 使用 HTTPS
- 设置安全的 CORS 策略
- 验证用户输入
- 限制 API 请求频率

### 3. 数据安全
- 定期备份数据库
- 加密敏感数据
- 实施访问控制

## 📞 支持

如果遇到问题，请检查：
1. 查看相关日志文件
2. 验证配置文件语法
3. 检查服务状态
4. 确认端口是否开放

如需进一步帮助，请提供：
- 错误日志内容
- 相关配置信息
- 问题重现步骤

---

**部署完成！** 现在可以通过浏览器访问你的股票数据可视化应用了。

**访问地址**: `https://your-domain.com` (如果配置了 SSL) 或 `http://your-server-ip`

**默认功能**:
- 股票 K 线图展示
- PE/PB 曲线分析
- 自选股管理
- 数据查询和导出

**后续维护**:
- 定期检查日志
- 监控服务器资源
- 备份重要数据
- 及时更新依赖