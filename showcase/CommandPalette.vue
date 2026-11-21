<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import {
  MATERIALS,
  PALETTES,
  applyMaterial,
  applyPalette,
  applyTheme,
  useMaterial,
  usePalette,
  useTheme,
  useToast,
} from '../src/index'
import type { ThemePreference } from '../src/index'
import { CommandMenu } from '../src/web/index'
import { ENTRIES, ENTRY_LABEL, REPO, plain } from './catalog'
import { DOC_PAGES } from './docs'
import { seam } from './seam'

/**
 * ⌘K: pages, every component (jumping to /c/<Name>), the docs and their
 * headings, and the three appearance axes as actions.
 */
const open = defineModel<boolean>({ default: false })

const router = useRouter()
const material = useMaterial()
const palette = usePalette()
const theme = useTheme()
const toast = useToast()

/* The menu ranks by group order and cannot see the query, so the palette
   listens to the field itself: when what is typed names a material, palette
   or mode, that action goes first and Enter applies it. */
const typed = ref('')
function onInput(event: Event) {
  const t = event.target as HTMLElement | null
  if (t?.closest?.('.rk-command-input')) typed.value = (t as HTMLInputElement).value
}
/* Bubble, not capture: a capture listener runs before the field's own
   v-model, and the re-render its write schedules lands between the two and
   wipes what was just typed. */
onMounted(() => document.addEventListener('input', onInput))
onBeforeUnmount(() => document.removeEventListener('input', onInput))
watch(open, () => (typed.value = ''))

const RECENT_KEY = 'rei-recent'
function recent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}
function remember(name: string) {
  try {
    const next = [name, ...recent().filter((n) => n !== name)].slice(0, 6)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    // Storage refused: recents are a convenience.
  }
}

const groups = computed(() => {
  const recents = open.value
    ? recent().flatMap((name) => {
        const e = ENTRIES.find((x) => x.name === name)
        return e ? [e] : []
      })
    : []

  const q = typed.value.trim().toLowerCase()
  const rank = (items: { id: string; label: string }[]) => {
    if (q.length < 2) return 0
    const hit = items.filter((i) => {
      const name = i.label
        .toLowerCase()
        .replace(/^use /, '')
        .replace(/ mode$/, '')
      return name === q || (q.length >= 3 && name.startsWith(q))
    })
    return hit.length
  }

  const all = [
    {
      label: 'Pages',
      items: [
        { id: 'go:/', label: 'Home', keywords: ['start', 'hero'] },
        { id: 'go:/components', label: 'Components', keywords: ['catalog', 'all'] },
        { id: 'go:/themes', label: 'Themes', keywords: ['materials', 'palettes'] },
        { id: 'go:/docs', label: 'Docs', keywords: ['install', 'guide'] },
      ],
    },
    {
      label: 'Recent',
      items: recents.map((e) => ({ id: `c:${e.name}`, label: e.name, hint: plain(e.summary) })),
    },
    {
      label: 'Components',
      items: ENTRIES.map((e) => ({
        id: `c:${e.name}`,
        label: e.name,
        hint: plain(e.summary),
        keywords: [e.summary, e.category, ENTRY_LABEL[e.entry] ?? e.entry],
      })),
    },
    {
      label: 'Docs',
      items: DOC_PAGES.flatMap((p) => [
        { id: `doc:${p.slug}`, label: `Docs: ${p.title}`, keywords: [p.summary, 'install'] },
        ...p.sections.map((s) => ({
          id: `doc:${p.slug}#${s.id}`,
          label: `${p.title}: ${s.label}`,
        })),
      ]),
    },
    {
      label: 'Material',
      items: MATERIALS.map((m) => ({ id: `mat:${m}`, label: `Use ${m}`, keywords: ['material'] })),
    },
    {
      label: 'Palette',
      items: PALETTES.map((p) => ({
        id: `pal:${p.name}`,
        label: `Use ${p.label}`,
        keywords: ['palette', 'colour', 'color'],
      })),
    },
    {
      label: 'Mode',
      items: [
        { id: 'mode:light', label: 'Light mode', keywords: ['theme', 'light'] },
        { id: 'mode:dark', label: 'Dark mode', keywords: ['theme', 'dark', 'night'] },
        { id: 'mode:system', label: 'System mode', keywords: ['theme', 'auto', 'system'] },
      ],
    },
    {
      label: 'Actions',
      items: [
        { id: 'act:rtl', label: 'Toggle right-to-left', keywords: ['rtl', 'direction'] },
        { id: 'act:install', label: 'Copy install command', keywords: ['install', 'pnpm'] },
        { id: 'act:github', label: 'Open GitHub', keywords: ['source', 'repo'] },
        { id: 'act:npm', label: 'Open npm', keywords: ['package'] },
      ],
    },
  ].filter((g) => g.items.length > 0)

  const appearance = new Set(['Material', 'Palette', 'Mode'])
  const hit = all.filter((g) => appearance.has(g.label) && rank(g.items) > 0)
  if (hit.length === 0) return all
  const first = hit.map((g) => {
    const exact = (i: { label: string }) => {
      const name = i.label
        .toLowerCase()
        .replace(/^use /, '')
        .replace(/ mode$/, '')
      return name === q ? 0 : 1
    }
    return { ...g, items: [...g.items].sort((a, b) => exact(a) - exact(b)) }
  })
  return [...first, ...all.filter((g) => !hit.includes(g))]
})

async function onSelect(id: string) {
  const at = id.indexOf(':')
  const kind = id.slice(0, at)
  const value = id.slice(at + 1)

  if (kind === 'go') void router.push(value)
  else if (kind === 'c') {
    remember(value)
    void router.push(`/c/${value}`)
  } else if (kind === 'doc') {
    const [slug, hash] = value.split('#')
    void router.push({ path: `/docs/${slug}`, hash: hash ? `#${hash}` : '' })
  } else if (kind === 'mat') {
    seam(() => {
      material.value = value as (typeof MATERIALS)[number]
      applyMaterial(value as (typeof MATERIALS)[number])
    })
  } else if (kind === 'pal') {
    seam(() => {
      palette.value = value
      applyPalette(value)
    })
  } else if (kind === 'mode') {
    seam(() => {
      theme.value = value as ThemePreference
      applyTheme(value as ThemePreference)
    })
  } else if (id === 'act:rtl') {
    const root = document.documentElement
    root.dir = root.dir === 'rtl' ? 'ltr' : 'rtl'
  } else if (id === 'act:install') {
    try {
      await navigator.clipboard.writeText('pnpm add rei-kit')
      toast.success('Copied')
    } catch {
      toast.danger('Could not copy')
    }
  } else if (id === 'act:github') window.open(REPO, '_blank', 'noopener')
  else if (id === 'act:npm')
    window.open('https://www.npmjs.com/package/rei-kit', '_blank', 'noopener')
}
</script>

<template>
  <CommandMenu
    v-model="open"
    :groups="groups"
    label="Find anything in the kit"
    placeholder="Search components, docs and actions…"
    empty-label="Nothing matches that."
    hotkey="k"
    @select="onSelect"
  />
</template>
