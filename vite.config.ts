import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ mode }) => {
  const apiUrl = process.env.VITE_API_URL ?? 'http://localhost:5069';
  const useBackend = mode === 'backend';
  const useMockData = mode === 'mock';
  const mockDataModule = mode === 'mock'
    ? path.resolve(__dirname, 'src/data/mockData.ts')
    : path.resolve(__dirname, 'src/data/emptyMockData.ts');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '$mock': mockDataModule,
        ...(useMockData ? {} : {
          './data/mockData': path.resolve(__dirname, 'src/data/emptyMockData.ts'),
          '../data/mockData': path.resolve(__dirname, 'src/data/emptyMockData.ts'),
          '../../data/mockData': path.resolve(__dirname, 'src/data/emptyMockData.ts'),
        }),
      },
    },
    server: {
      port: parseInt(process.env.PORT ?? '5173'),
      strictPort: true,
      proxy: useBackend
        ? {
            '/api': {
              target: apiUrl,
              changeOrigin: true,
            },
          }
        : undefined,
    },
  };
});
