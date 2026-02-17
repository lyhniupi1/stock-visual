module.exports = {
  apps: [
    {
      name: 'stock-visual-backend',
      script: './backend/dist/main.js',
      cwd: '/var/www/stock-visual',
      env: {
        NODE_ENV: 'production',
        PORT: 8080,
        DB_DATABASE: '/root/magicFormula/src/data/magicFormulaData.db',
        NEXT_BACKEND_URL: 'http://localhost:8080'
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