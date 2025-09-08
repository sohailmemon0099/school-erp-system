module.exports = {
  apps: [{
    name: 'school-erp',
    script: 'server.js',
    cwd: '/var/www/school-erp',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/pm2/school-erp-error.log',
    out_file: '/var/log/pm2/school-erp-out.log',
    log_file: '/var/log/pm2/school-erp.log',
    time: true
  }]
};
