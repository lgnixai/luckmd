import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@luckmd/core': path.resolve(__dirname, '../packages/core/src'),
      '@luckmd/ui': path.resolve(__dirname, '../packages/ui/src'),
      '@luckmd/plugins': path.resolve(__dirname, '../packages/plugins/src'),
    },
  },
  server: {
    port: 3337,
    host: true
  }
})
