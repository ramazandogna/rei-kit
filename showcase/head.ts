import { NOT_FOUND_META, SITE_URL, metaForPath, type RouteMeta } from './head-meta'

/**
 * Keeps <title>, description, canonical and the OG/Twitter tags in step with
 * the route. No dependency: the shell already carries every tag, so this only
 * rewrites their content. The static file a crawler gets for each route is
 * written with the same words by the prerender script.
 */
function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.append(el)
  }
  el.content = value
}

export function applyHead(meta: Pick<RouteMeta, 'title' | 'description' | 'path'>) {
  /* Trailing slash: Pages serves each route from `<path>/index.html` and
     redirects the bare path there, so the slashed URL is the one that is 200. */
  const url = meta.path ? `${SITE_URL}${meta.path}/` : SITE_URL
  document.title = meta.title
  setMeta('name', 'description', meta.description)
  setMeta('property', 'og:title', meta.title)
  setMeta('property', 'og:description', meta.description)
  setMeta('property', 'og:url', url)
  setMeta('name', 'twitter:title', meta.title)
  setMeta('name', 'twitter:description', meta.description)
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  /* A not-found page has no canonical URL of its own. */
  if (meta.path === NOT_FOUND_META.path) {
    canonical?.remove()
    return
  }
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.append(canonical)
  }
  canonical.href = url
}

/** For every route but `/c/:name`, which knows its own summary. */
export function applyRouteHead(path: string) {
  applyHead(metaForPath(path) ?? NOT_FOUND_META)
}
