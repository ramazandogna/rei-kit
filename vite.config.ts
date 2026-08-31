import { copyFileSync, mkdirSync, readdirSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    // Declarations mirror the source layout; the exports map in package.json
    // is what gives consumers a flat public API.
    dts({ tsconfigPath: './tsconfig.lib.json' }),
    {
      // Copied, not compiled. `@theme` and `@utility` are Tailwind source
      // syntax: they have to reach the consuming app's Tailwind untouched, so
      // running them through this build would strip the very thing they are.
      name: 'rei-kit:copy-styles',
      closeBundle() {
        mkdirSync('dist', { recursive: true })

        for (const file of readdirSync('src/styles')) {
          copyFileSync(`src/styles/${file}`, `dist/${file}`)
        }
      },
    },
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    lib: {
      // Three entries: an app that never touches Supabase must not download the
      // client, and the CSS has to be importable on its own.
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        supabase: fileURLToPath(new URL('./src/supabase/index.ts', import.meta.url)),
      },
      formats: ['es'],
      // Named so the import line reads as what it is — the compiled styles of
      // the components — rather than after the package.
      cssFileName: 'styles',
    },
    rollupOptions: {
      // Everything the consumer already has. Bundling Vue here would give an
      // app two copies of the runtime and break every composable.
      external: ['vue', 'vue-i18n', 'lucide-vue-next', /^@supabase\//],
      output: { assetFileNames: '[name][extname]' },
    },
    // A library ships readable code; the app that consumes it does the
    // minifying, with its own settings.
    minify: false,
    sourcemap: true,
  },
})
