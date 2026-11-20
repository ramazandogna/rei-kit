import { createApp, nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import { reduceMotion, showSeamLine } from './seam'
import './main.css'

/**
 * One app, web history, lazy routes.
 *
 * `base` is the Pages path (`/rei-kit/`) in a deployed build and `/` locally.
 * Every route is its own chunk, so the first visit to `/` does not pay for
 * the catalogue or the component pages. The kit's own `TabBar`, `NavLinks`
 * and `BaseBreadcrumb` render `RouterLink`, which is why a router has to
 * exist at all, and now the URL is real, so a component page is linkable.
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('./pages/HomePage.vue') },
    { path: '/components', name: 'catalog', component: () => import('./pages/CatalogPage.vue') },
    { path: '/c/:name', name: 'component', component: () => import('./pages/ComponentPage.vue') },
    { path: '/themes', name: 'themes', component: () => import('./pages/ThemesPage.vue') },
    { path: '/docs/:page?', name: 'docs', component: () => import('./pages/DocsPage.vue') },
    { path: '/:pathMatch(.*)*', name: '404', component: () => import('./pages/NotFound.vue') },
  ],
  scrollBehavior(to, _from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, top: 72 }
    return { top: 0 }
  },
})

/* View Transitions on navigation. The new page is rendered inside the
   transition callback, which resolves once the router has finished. Same-path
   hash changes, reduced motion and browsers without the API navigate plainly. */
let done: (() => void) | undefined
router.beforeResolve((to, from) => {
  const doc = document as Document & {
    startViewTransition?: (cb: () => Promise<void>) => { finished: Promise<void> }
  }
  if (!from.name || to.path === from.path || !doc.startViewTransition || reduceMotion()) return

  document.documentElement.dataset['vt'] = 'seam'
  showSeamLine()
  return new Promise<void>((resolve) => {
    doc.startViewTransition!(
      () =>
        new Promise<void>((finish) => {
          done = finish
          resolve()
        }),
    )
      .finished.catch(() => undefined)
      .finally(() => delete document.documentElement.dataset['vt'])
  })
})
router.afterEach(async () => {
  await nextTick()
  done?.()
  done = undefined
})
router.onError(() => {
  done?.()
  done = undefined
})

createApp(App).use(router).mount('#app')
