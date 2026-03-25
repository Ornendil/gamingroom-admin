import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const httpsKeyPath = env.DEV_HTTPS_KEY
    ? resolve(process.cwd(), env.DEV_HTTPS_KEY)
    : null;
  const httpsCertPath = env.DEV_HTTPS_CERT
    ? resolve(process.cwd(), env.DEV_HTTPS_CERT)
    : null;

  const https =
    httpsKeyPath &&
    httpsCertPath &&
    existsSync(httpsKeyPath) &&
    existsSync(httpsCertPath)
      ? {
          key: readFileSync(httpsKeyPath),
          cert: readFileSync(httpsCertPath),
        }
      : undefined;

  return {
    base: '/admin/',
    plugins: [react()],
    server: {
      host: true,
      port: 3000,
      proxy: {
        '/api': 'http://localhost:3002',
      },
      ...(https ? { https } : {}),
    },
  };
});