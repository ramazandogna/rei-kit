// @vitest-environment node

import { createSSRApp, h } from 'vue'
import type { Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import {
  BaseButton,
  BaseInput,
  BaseSheet,
  EmptyState,
  GoogleButton,
  LocaleLinks,
  PageHeader,
  SectionHeading,
  SegmentedControl,
  SettingsGroup,
  SettingsRow,
  SkeletonList,
  StatCard,
  ToneDot,
  applyTheme,
  createI18nRuntime,
  readStoredTheme,
  useToday,
} from '../index'

/**
 * The kit has to survive being imported and rendered without a DOM.
 *
 * The environment is the whole point of this file: under jsdom every assertion
 * here passes whether the guards exist or not, because jsdom supplies the very
 * `document` a server does not have. Run it in node and a stray `document` at
 * module scope fails at the import, before a single test body runs.
 *
 * Kakehashi prerenders its public pages, so this is not hypothetical: the
 * grammar archive is built by rendering these components in node.
 */

async function render(component: Component, props: Record<string, unknown> = {}) {
  const app = createSSRApp({ render: () => h(component, props) })

  return renderToString(app)
}

describe('server rendering', () => {
  it('renders the components that carry a page', async () => {
    // Each entry is the minimum that satisfies the component's required props.
    // `TabBar` is absent on purpose: it renders `RouterLink`, so it needs a
    // router provided, which is the app's job and not what this file proves.
    const cases: [string, Component, Record<string, unknown>][] = [
      ['BaseButton', BaseButton, {}],
      ['BaseInput', BaseInput, { label: 'E-posta' }],
      ['BaseSheet', BaseSheet, { title: 'Ayarlar' }],
      ['EmptyState', EmptyState, {}],
      ['GoogleButton', GoogleButton, { label: 'Google ile devam et' }],
      ['LocaleLinks', LocaleLinks, { locales: ['tr'], labels: { tr: 'Türkçe' } }],
      ['PageHeader', PageHeader, { title: 'Gramer' }],
      ['SectionHeading', SectionHeading, { tone: 'neutral', label: 'Bugün' }],
      ['SegmentedControl', SegmentedControl, { options: [{ value: 'a', label: 'A' }] }],
      ['SettingsGroup', SettingsGroup, { title: 'Genel' }],
      ['SettingsRow', SettingsRow, { label: 'Tema' }],
      ['SkeletonList', SkeletonList, {}],
      ['StatCard', StatCard, { value: '12', label: 'Gün' }],
      ['ToneDot', ToneDot, { fill: 'bg-primary' }],
    ]

    for (const [name, component, props] of cases) {
      await expect(render(component, props), `${name} threw`).resolves.toBeTypeOf('string')
    }
  })

  it('reads the theme without a document', () => {
    // Both are called during a prerender: `readStoredTheme` from the app's
    // startup, `applyTheme` from the controller's immediate watcher.
    expect(readStoredTheme()).toBe('system')
    expect(() => applyTheme('dark')).not.toThrow()
  })

  it('gives a date without arming a timer', () => {
    // Arming one would keep the node process alive past the last page, which
    // is how a prerender build hangs instead of finishing.
    expect(useToday().value).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('builds an i18n runtime without a browser to detect', () => {
    const { activeLocale, t } = createI18nRuntime({
      locales: ['tr', 'en'] as const,
      fallback: 'tr',
      intlTags: { tr: 'tr-TR', en: 'en-GB' },
      messages: { common: { save: 'Kaydet' } },
    })

    // `system` cannot be resolved without `navigator`, so it has to land on the
    // fallback — the one locale whose messages are already bundled.
    expect(activeLocale.value).toBe('tr')
    expect(t('common.save')).toBe('Kaydet')
  })
})
