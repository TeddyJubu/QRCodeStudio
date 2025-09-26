import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    visualizer({
      filename: "bundle-analysis.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },
    rollupOptions: {
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
      output: {
        manualChunks: (id) => {
          // Core React and ecosystem
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-core';
          }
          
          // Radix UI components - group by component type for better tree shaking
          if (id.includes('node_modules/@radix-ui')) {
            // Group primitive components together
            if (id.includes('@radix-ui/react-primitive')) {
              return 'radix-primitives';
            }
            // Group form-related components
            if (id.includes('@radix-ui/react-select') || 
                id.includes('@radix-ui/react-checkbox') ||
                id.includes('@radix-ui/react-radio-group') ||
                id.includes('@radix-ui/react-switch') ||
                id.includes('@radix-ui/react-slider')) {
              return 'radix-forms';
            }
            // Group navigation components
            if (id.includes('@radix-ui/react-navigation-menu') ||
                id.includes('@radix-ui/react-tabs') ||
                id.includes('@radix-ui/react-collapsible')) {
              return 'radix-navigation';
            }
            // Group overlay components
            if (id.includes('@radix-ui/react-dialog') ||
                id.includes('@radix-ui/react-popover') ||
                id.includes('@radix-ui/react-tooltip') ||
                id.includes('@radix-ui/react-toast') ||
                id.includes('@radix-ui/react-alert-dialog')) {
              return 'radix-overlays';
            }
            return 'radix-ui';
          }
          
          // Form handling and validation
          if (id.includes('node_modules/react-hook-form') || 
              id.includes('node_modules/@hookform') || 
              id.includes('node_modules/zod')) {
            return 'forms';
          }
          
          // Charts and visualization
          if (id.includes('node_modules/recharts')) {
            return 'charts';
          }
          
          // QR code generation
          if (id.includes('node_modules/qr-code-styling')) {
            return 'qr-generation';
          }
          
          // Date utilities - tree shake specific functions
          if (id.includes('node_modules/date-fns')) {
            return 'date-utils';
          }
          
          // Icons - tree shake specific icons
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          
          // TanStack Query
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'query';
          }
          
          // Wouter router
          if (id.includes('node_modules/wouter')) {
            return 'router';
          }
          
          // Animation libraries
          if (id.includes('node_modules/framer-motion') ||
              id.includes('node_modules/tailwindcss-animate')) {
            return 'animations';
          }
          
          // Theme and styling utilities
          if (id.includes('node_modules/next-themes') ||
              id.includes('node_modules/class-variance-authority') ||
              id.includes('node_modules/clsx') ||
              id.includes('node_modules/tailwind-merge')) {
            return 'styling';
          }
          
          // Utility libraries
          if (id.includes('node_modules/cmdk') ||
              id.includes('node_modules/embla-carousel-react') ||
              id.includes('node_modules/react-resizable-panels') ||
              id.includes('node_modules/vaul')) {
            return 'utilities';
          }
          
          // Page chunks for better caching
          if (id.includes('/pages/')) {
            return 'pages';
          }
          
          // Component chunks - separate UI components from business logic
          if (id.includes('/components/ui/')) {
            return 'ui-components';
          }
          if (id.includes('/components/')) {
            return 'components';
          }
          
          // Default vendor chunk for other third-party modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name;
          if (name.includes('vendor') || name.includes('node_modules')) {
            return `assets/${name}-[hash].js`;
          }
          return `assets/${name}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return `assets/unknown-[hash].bin`;
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/media/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|gif|svg)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash].${ext}`;
          }
          if (ext === 'css') {
            return `assets/css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
