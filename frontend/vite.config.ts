import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // GitHub Pages는 https://changdh002.github.io/LifeSync/ 하위 경로로 서비스되므로
  // 빌드 산출물의 asset 경로가 /LifeSync/ 기준이 되도록 base를 지정한다.
  // 로컬 개발(npm run dev)에서는 dev 서버가 base를 자동 처리한다.
  base: '/LifeSync/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})
