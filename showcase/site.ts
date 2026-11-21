/**
 * Facts about the site that the entry chunk needs, without the catalogue.
 * `catalog.ts` imports the full props JSON; anything on the first paint
 * reads from here instead so `/` does not download 120 prop tables.
 */
export const REPO = 'https://github.com/ramazandogna/rei-kit'
export const SITE = 'https://ramazandogna.github.io/rei-kit/'
export const COMPONENT_COUNT: number = __REI_KIT_COUNT__
