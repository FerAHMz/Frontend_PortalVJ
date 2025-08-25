import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'lucide-vue-next']
        }
      }
    },
    target: 'esnext',
    minify: 'esbuild',
    chunkSizeWarningLimit: 2000, // Aumentar límite para permitir chunks más grandes
    cssCodeSplit: false, // Un solo archivo CSS
    sourcemap: false // Sin sourcemaps para performance
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'lucide-vue-next'],
    exclude: ['@vite/client', '@vite/env'],
    force: true // Forzar re-optimización
  },
  server: {
    hmr: {
      overlay: false // Sin overlay de errores
    },
    fs: {
      strict: false // Menos restricciones de filesystem
    }
  },
  // Configuración para reducir module splitting
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
  },
  esbuild: {
    drop: ['console', 'debugger'], // Eliminar logs en desarrollo
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/*.d.ts',
        '**/*.config.js',
        'dist/'
      ]
    },
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist'],
  },
})
