module.exports = {
  apps: [
    {
      name: 'api',
      script: 'node_modules/@patentrack/api/dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
    {
      name: 'ingestion-worker',
      script: 'node_modules/@patentrack/ingestion/dist/index.js',
      instances: 1,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'processing-worker',
      script: 'node_modules/@patentrack/processing/dist/index.js',
      instances: 2,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'scheduler',
      script: 'node_modules/@patentrack/scheduler/dist/index.js',
      instances: 1,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'monitoring',
      script: 'node_modules/@patentrack/monitoring/dist/index.js',
      instances: 1,
      cron_restart: '*/5 * * * *',
      autorestart: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
