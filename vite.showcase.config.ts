import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

/**
 * The showcase, built as an ordinary app.
 *
 * Separate from the library build on purpose: that one externalises every peer
 * and emits a package, and this one has to bundle everything and emit a site.
 * Trying to make one config do both is how a library ends up shipping its demo
 * to consumers.
 *
 * It imports from `src` rather than from `dist`, so the page always shows the
 * working tree — which is the point during development, and is why a broken
 * component is visible before it is published.
 */
const { version } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { version: string }

export default defineConfig({
  define: { __REI_KIT_VERSION__: JSON.stringify(version) },
  root: fileURLToPath(new URL('./showcase', import.meta.url)),
  plugins: [vue(), tailwindcss()],
  build: {
    outDir: fileURLToPath(new URL('./dist-showcase', import.meta.url)),
    emptyOutDir: true,
  },
})
