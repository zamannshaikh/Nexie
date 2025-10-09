import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // 1. Point this to your backend server
        target: 'http://localhost:5000',
        changeOrigin: true,
        // 2. We REMOVED the 'rewrite' line here.
        //    This is because your backend URL already includes /api.
      },
    },
  },
})