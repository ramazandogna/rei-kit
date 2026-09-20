import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

const entry = (name: string) =>
  fileURLToPath(new URL(`./src/${name}/index.ts`, import.meta.url))

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude],
      root: fileURLToPath(new URL('./', import.meta.url)),
      /*
       * The examples import `rei-kit` the way a reader would, and without
       * this Node's own `exports` field answers — with `dist`. A test that
       * audits the last build rather than the working tree reports a fix as
       * still broken and, worse, a regression as fine until someone rebuilds.
       *
       * `tsconfig.showcase.json` already maps these for the type-check; this
       * is the same map for the runtime.
       */
      alias: [
        { find: /^rei-kit\/web$/, replacement: entry('web') },
        { find: /^rei-kit\/app$/, replacement: entry('app') },
        { find: /^rei-kit\/pwa$/, replacement: entry('pwa') },
        { find: /^rei-kit\/motion$/, replacement: entry('motion') },
        { find: /^rei-kit\/supabase$/, replacement: entry('supabase') },
        { find: /^rei-kit$/, replacement: fileURLToPath(new URL('./src/index.ts', import.meta.url)) },
      ],
    },
  }),
)
