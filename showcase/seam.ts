import { ref } from 'vue'

/**
 * The Seam: the site's one signature motion, a clip-path wipe with a hairline
 * riding its edge. Route changes, the appearance dock and the command palette
 * all go through here, so they share one gesture and one reduced-motion rule.
 */
export const seamKey = ref(0)

export const reduceMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function showSeamLine() {
  seamKey.value++
}

type Origin = { x: number; y: number }

/** Run `update` inside a view transition when the browser and reader allow. */
export function seam(update: () => void | Promise<void>, origin?: Origin) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void | Promise<void>) => { finished: Promise<void> }
  }
  if (!doc.startViewTransition || reduceMotion()) {
    void update()
    return
  }

  const root = document.documentElement
  root.dataset['vt'] = origin ? 'circle' : 'seam'
  if (origin) {
    root.style.setProperty('--vt-x', `${origin.x}px`)
    root.style.setProperty('--vt-y', `${origin.y}px`)
  } else {
    showSeamLine()
  }
  doc
    .startViewTransition(update)
    .finished.catch(() => undefined)
    .finally(() => delete root.dataset['vt'])
}
