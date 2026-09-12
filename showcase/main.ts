import { createApp } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import KitShowcase from './KitShowcase.vue'
import './main.css'

/**
 * A router, because several parts of the kit navigate.
 *
 * `TabBar`, `NavLinks`, `BaseBreadcrumb` and `LocaleLinks` render `RouterLink`,
 * and a `RouterLink` with no router throws on mount. Memory history rather than
 * the URL: the showcase is one page, and a demo that changed the address bar
 * would scroll the reader somewhere else every time they pressed a tab.
 */
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/:rest(.*)*', component: { render: () => null } }],
})

createApp(KitShowcase).use(router).mount('#app')
