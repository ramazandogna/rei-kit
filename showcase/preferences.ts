import { ref, watch } from 'vue'

/**
 * Two choices a reader makes once and expects the whole page to remember:
 * which language the samples are in, and which package manager the commands
 * use. Kept per browser — a convenience, so a private window that cannot
 * store it simply starts from the defaults.
 */
export type CodeLanguage = 'ts' | 'js'
export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun'

export const PACKAGE_MANAGERS: readonly PackageManager[] = ['pnpm', 'npm', 'yarn', 'bun']

function stored<T extends string>(key: string, allowed: readonly T[], fallback: T) {
  let initial = fallback
  try {
    const value = localStorage.getItem(key)
    if (value && (allowed as readonly string[]).includes(value)) initial = value as T
  } catch {
    // Storage refused: the default is a fine answer.
  }

  const choice = ref(initial)
  watch(choice, (value) => {
    try {
      localStorage.setItem(key, value)
    } catch {
      // Nothing to do; the choice still holds for this visit.
    }
  })

  return choice
}

export const codeLanguage = stored<CodeLanguage>('rei-kit-docs-lang', ['ts', 'js'], 'ts')
export const packageManager = stored<PackageManager>('rei-kit-docs-pm', PACKAGE_MANAGERS, 'pnpm')

/** The same command in each package manager's words. */
export function command(kind: 'add' | 'add-dev' | 'create', args: string, pm: PackageManager) {
  if (kind === 'create') {
    return {
      pnpm: `pnpm create vite ${args}`,
      npm: `npm create vite@latest ${args}`,
      yarn: `yarn create vite ${args}`,
      bun: `bun create vite ${args}`,
    }[pm]
  }

  const dev = kind === 'add-dev'
  return {
    pnpm: `pnpm add ${dev ? '-D ' : ''}${args}`,
    npm: `npm install ${dev ? '-D ' : ''}${args}`,
    yarn: `yarn add ${dev ? '-D ' : ''}${args}`,
    bun: `bun add ${dev ? '-d ' : ''}${args}`,
  }[pm]
}
