import { ref, watch } from 'vue'
import type { Ref } from 'vue'

import generated from '../palettes/palettes.generated.json'

/* ---------------------------------------------------------------------------
   Materials.

   How a surface is made — its fill, its edge, its depth — independent of what
   colour it is. The kit's own components never ask which one is active; they
   read the tokens, and the material redefines the tokens.
   --------------------------------------------------------------------------- */

export const MATERIALS = ['quiet', 'glass', 'brutal', 'soft'] as const
export type Material = (typeof MATERIALS)[number]

export function isMaterial(value: unknown): value is Material {
  return typeof value === 'string' && (MATERIALS as readonly string[]).includes(value)
}

/**
 * Switches the material for everything under `root`.
 *
 * `quiet` removes the attribute rather than writing it, because quiet is what
 * the tokens already are — there is nothing to override.
 *
 * Needs `rei-kit/materials.css` (or the one material file) imported after
 * `tokens.css`, or the attribute changes nothing.
 */
export function applyMaterial(material: Material, root?: HTMLElement): void {
  const el = root ?? (typeof document === 'undefined' ? undefined : document.documentElement)
  if (!el) return

  if (material === 'quiet') delete el.dataset['material']
  else el.dataset['material'] = material
}

/* ---------------------------------------------------------------------------
   Palettes.

   Generated from `src/palettes/palettes.source.json`, with the on-colours
   chosen by contrast and every text pairing measured against WCAG AA in both
   modes before a palette is allowed to ship.
   --------------------------------------------------------------------------- */

/** The eleven colour roles plus the five on-colours, for one mode. */
export interface PaletteRoles {
  primary: string
  accent: string
  positive: string
  negative: string
  warning: string
  canvas: string
  surface: string
  muted: string
  ink: string
  inkSoft: string
  hair: string
  onPrimary: string
  onAccent: string
  onPositive: string
  onNegative: string
  onWarning: string
}

export interface Palette {
  /** The value for `data-palette`. */
  name: string
  /** A display name. */
  label: string
  /** Who made it. Several are well-known open palettes, credited here. */
  origin: string
  /** Four colours for a picker to show at a glance. */
  swatch: readonly [string, string, string, string]
  light: PaletteRoles
  dark: PaletteRoles
}

export const PALETTES = generated as unknown as readonly Palette[]

export type PaletteName = string

export function isPaletteName(value: unknown): value is PaletteName {
  return typeof value === 'string' && PALETTES.some((p) => p.name === value)
}

/**
 * Switches the palette for everything under `root`.
 *
 * `rei` is the tokens' own palette, so it removes the attribute. Needs
 * `rei-kit/palettes.css` imported after `tokens.css`.
 */
export function applyPalette(name: PaletteName, root?: HTMLElement): void {
  const el = root ?? (typeof document === 'undefined' ? undefined : document.documentElement)
  if (!el) return

  if (name === 'rei') delete el.dataset['palette']
  else el.dataset['palette'] = name
}

/* ---------------------------------------------------------------------------
   Persisted preferences.

   The same shape as `useTheme`: a module-level ref, so every caller shares one
   answer, written through to storage and applied on every change.
   --------------------------------------------------------------------------- */

function stored<T extends string>(key: string, accept: (v: unknown) => v is T, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return accept(value) ? value : fallback
  } catch {
    return fallback
  }
}

function store(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Private mode or blocked storage: the choice just will not persist.
  }
}

let materialKey = 'rei-material'
let materialRef: Ref<Material> | null = null

/** Call once at startup, before `useMaterial`, to namespace the stored value. */
export function setMaterialStorageKey(key: string): void {
  materialKey = key
  if (materialRef) materialRef.value = stored(key, isMaterial, 'quiet')
}

/**
 * The active material, as a writable ref. Assigning it stores and applies it.
 *
 * @example
 * ```ts
 * const material = useMaterial()
 * material.value = 'glass'
 * ```
 */
export function useMaterial(): Ref<Material> {
  if (materialRef) return materialRef

  materialRef = ref<Material>(stored(materialKey, isMaterial, 'quiet'))
  watch(
    materialRef,
    (next) => {
      store(materialKey, next)
      applyMaterial(next)
    },
    { immediate: true },
  )

  return materialRef
}

let paletteKey = 'rei-palette'
let paletteRef: Ref<PaletteName> | null = null

/** Call once at startup, before `usePalette`, to namespace the stored value. */
export function setPaletteStorageKey(key: string): void {
  paletteKey = key
  if (paletteRef) paletteRef.value = stored(key, isPaletteName, 'rei')
}

/** The active palette's name, as a writable ref. Assigning it stores and applies it. */
export function usePalette(): Ref<PaletteName> {
  if (paletteRef) return paletteRef

  paletteRef = ref<PaletteName>(stored(paletteKey, isPaletteName, 'rei'))
  watch(
    paletteRef,
    (next) => {
      store(paletteKey, next)
      applyPalette(next)
    },
    { immediate: true },
  )

  return paletteRef
}
