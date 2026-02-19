#!/bin/bash

# 重启整个项目的shell脚本
# 添加详细的echo输出和错误处理

set -e  # 任何命令失败则退出脚本

# 颜色定义（可选）
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "命令 $1 未找到，请先安装"
        exit 1
    fi
}

# 检查当前目录
check_current_dir() {
    if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
        log_error "当前目录不是项目根目录，请切换到项目根目录再运行此脚本"
        exit 1
    fi
}

# 主函数
main() {
    log_info "开始重启股票数据可视化项目..."
    log_info "当前工作目录: $(pwd)"
    
    # 检查目录
    check_current_dir
    
    # 1. 拉取最新代码
    log_info "步骤 1/6: 拉取最新代码..."
    if git pull; then
        log_success "代码拉取成功"
    else
        log_warning "代码拉取失败或没有git仓库，继续执行..."
    fi
    
    # 2. 停止并删除PM2进程
    log_info "步骤 2/6: 停止并删除PM2进程..."
    
    # 检查进程是否存在
    if pm2 list | grep -q "stock-visual-frontend"; then
        log_info "停止 stock-visual-frontend..."
        pm2 stop stock-visual-frontend || true
        log_info "删除 stock-visual-frontend..."
        pm2 delete stock-visual-frontend || true
    else
        log_warning "stock-visual-frontend 进程不存在，跳过"
    fi
    
    if pm2 list | grep -q "stock-visual-backend"; then
        log_info "停止 stock-visual-backend..."
        pm2 stop stock-visual-backend || true
        log_info "删除 stock-visual-backend..."
        pm2 delete stock-visual-backend || true
    else
        log_warning "stock-visual-backend 进程不存在，跳过"
    fi
    
    # 3. 构建后端
    log_info "步骤 3/6: 构建后端..."
    cd ./backend
    log_info "安装后端依赖..."
    yarn install --frozen-lockfile
    log_info "构建后端..."
    yarn build
    if [ $? -eq 0 ]; then
        log_success "后端构建成功"
    else
        log_error "后端构建失败"
        exit 1
    fi
    cd ..
    
    # 4. 构建前端
    log_info "步骤 4/6: 构建前端..."
    cd ./frontend
    log_info "安装前端依赖..."
    yarn install --frozen-lockfile
    log_info "构建前端..."
    yarn build
    if [ $? -eq 0 ]; then
        log_success "前端构建成功"
    else
        log_error "前端构建失败"
        exit 1
    fi
    cd ..
    
    # 5. 启动PM2进程
    log_info "步骤 5/6: 启动PM2进程..."
    if [ -f "ecosystem.config.js" ]; then
        log_info "使用 ecosystem.config.js 启动服务..."
        pm2 start ecosystem.config.js --env production
    else
        log_error "ecosystem.config.js 文件不存在"
        exit 1
    fi
    
    # 6. 显示状态
    log_info "步骤 6/6: 检查服务状态..."
    sleep 2  # 等待进程启动
    pm2 status
    
    log_success "项目重启完成！"
    log_info "前端访问: http://localhost:3000"
    log_info "后端API: http://localhost:8080"
    log_info "查看日志: pm2 logs [服务名]"
}

# 执行主函数
main "$@"