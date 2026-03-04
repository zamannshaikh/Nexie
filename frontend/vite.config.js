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
      // Add the Socket.io proxy here
      '/socket.io': {
        target: 'ws://localhost:5000', // Points to your backend port
        ws: true, // Crucial: Enables WebSocket proxying
      },
    },
  },
})