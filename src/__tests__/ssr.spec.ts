// @vitest-environment node

import { createSSRApp, h } from 'vue'
import type { Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import {
  BaseAlert,
  BaseBadge,
  BaseButton,
  BaseInput,
  BaseSheet,
  BaseCard,
  BaseCheckbox,
  BaseRadioGroup,
  BaseSelect,
  BaseTextarea,
  EmptyState,
  ErrorBoundary,
  FormField,
  GoogleButton,
  LocaleLinks,
  PageContainer,
  PageHeader,
  ProgressBar,
  SectionHeading,
  SegmentedControl,
  SettingsGroup,
  SettingsRow,
  SkeletonList,
  StatCard,
  ToastHost,
  ToneDot,
  applyTheme,
  createI18nRuntime,
  readStoredTheme,
  useMediaQuery,
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
      ['BaseAlert', BaseAlert, {}],
      ['BaseBadge', BaseBadge, {}],
      ['BaseButton', BaseButton, {}],
      ['BaseInput', BaseInput, { label: 'E-posta' }],
      ['BaseSheet', BaseSheet, { title: 'Ayarlar' }],
      ['BaseCard', BaseCard, {}],
      ['BaseCheckbox', BaseCheckbox, { label: 'Beni hatırla' }],
      [
        'BaseRadioGroup',
        BaseRadioGroup,
        { legend: 'Tema', options: [{ value: 'light', label: 'Açık' }] },
      ],
      [
        'BaseSelect',
        BaseSelect,
        { label: 'Para birimi', options: [{ value: 'TRY', label: 'Türk lirası' }] },
      ],
      ['BaseTextarea', BaseTextarea, { label: 'Not' }],
      ['EmptyState', EmptyState, {}],
      ['ErrorBoundary', ErrorBoundary, {}],
      ['FormField', FormField, { label: 'E-posta' }],
      ['GoogleButton', GoogleButton, { label: 'Google ile devam et' }],
      ['LocaleLinks', LocaleLinks, { locales: ['tr'], labels: { tr: 'Türkçe' } }],
      ['PageContainer', PageContainer, {}],
      ['PageHeader', PageHeader, { title: 'Gramer' }],
      ['ProgressBar', ProgressBar, { value: 7, max: 28 }],
      ['SectionHeading', SectionHeading, { tone: 'neutral', label: 'Bugün' }],
      ['SegmentedControl', SegmentedControl, { options: [{ value: 'a', label: 'A' }] }],
      ['SettingsGroup', SettingsGroup, { title: 'Genel' }],
      ['SettingsRow', SettingsRow, { label: 'Tema' }],
      ['SkeletonList', SkeletonList, {}],
      ['StatCard', StatCard, { value: '12', label: 'Gün' }],
      // Renders nothing until mounted: Teleport needs a body and a server has
      // none, and a prerendered page has no toasts to hydrate anyway.
      ['ToastHost', ToastHost, { closeLabel: 'Kapat' }],
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

  it('answers a media query without a window to ask', () => {
    // Called during setup on a prerendered page. `matchMedia` does not exist
    // in node, and the honest answer there is "not yet" rather than a throw —
    // it resolves on mount, in the browser, where the question has an answer.
    const app = createSSRApp({
      setup() {
        const wide = useMediaQuery('(min-width: 64rem)')

        return () => h('i', String(wide.value))
      },
    })

    return expect(renderToString(app)).resolves.toContain('false')
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

describe('server rendering, rei-kit/motion', () => {
  /* The finished state, always: a counter at zero, a sentence half typed or
     a section at opacity 0 is what a prerendered page — and anyone reading
     it before JavaScript runs — would be left with. */
  it('renders every moving part at rest', async () => {
    const { BaseMarquee, BaseReveal, CountUp, NumberTicker, TextRotate, TypeWriter } =
      await import('../motion/index')

    const ticker = await render(NumberTicker, { value: 1234, from: 0, locale: 'en-GB' })
    expect(ticker).toContain('1,234')

    const count = await render(CountUp, { value: 1500, locale: 'en-GB' })
    expect(count.match(/1,500/g)).toHaveLength(2)

    expect(await render(TextRotate, { words: ['glass', 'brutal'] })).toContain('glass')
    expect(await render(TypeWriter, { text: ['Build it once.'] })).toMatch(
      /aria-hidden="true"[^>]*>Build it once\.</,
    )

    const reveal = await render(BaseReveal, {})
    expect(reveal).not.toContain('is-hidden')

    expect(await render(BaseMarquee, {})).toContain('rk-marquee-track')
  })
})

describe('server rendering, the second wave', () => {
  it('renders the popover closed, and the new fields and indicators at rest', async () => {
    const { BasePopover, BaseStepper, CircularProgress, NumberInput, PinInput, ToggleGroup } =
      await import('../index')

    expect(await render(BasePopover, { label: 'Filtreler' })).not.toContain('role="dialog"')
    expect(
      await render(ToggleGroup, { label: 'Biçim', options: [{ value: 'b', label: 'Kalın' }] }),
    ).toContain('aria-pressed="false"')
    expect(
      await render(NumberInput, {
        label: 'Adet',
        decrementLabel: 'Azalt',
        incrementLabel: 'Artır',
        modelValue: 3,
      }),
    ).toContain('role="spinbutton"')
    expect(
      await render(PinInput, { label: 'Kod', cellLabel: (n: number) => `${n}. hane` }),
    ).toContain('one-time-code')
    expect(await render(CircularProgress, { label: 'Yükleme', value: 40 })).toContain(
      'aria-valuenow="40"',
    )
    expect(
      await render(BaseStepper, {
        label: 'Kayıt',
        steps: [{ key: 'a', label: 'Hesap' }],
        modelValue: 'a',
      }),
    ).toContain('aria-current="step"')
  })
})

describe('server rendering, the calendar', () => {
  it('renders a month without a browser, and a picker with its panel closed', async () => {
    const { BaseCalendar, BaseDatePicker } = await import('../index')
    const labels = { previousLabel: 'Önceki', nextLabel: 'Sonraki' }

    const month = await render(BaseCalendar, { ...labels, today: '2026-09-17' })
    expect(month).toContain('role="grid"')

    const picker = await render(BaseDatePicker, { ...labels, label: 'Tarih' })
    expect(picker).toContain('aria-haspopup="dialog"')
    expect(picker).not.toContain('role="grid"')
  })
})

describe('server rendering, the basics', () => {
  it('renders the small parts without a browser', async () => {
    const kit = await import('../index')

    expect(await render(kit.BaseSeparator, { label: 'veya' })).toContain('veya')
    expect(await render(kit.BaseSkeleton, { height: '2rem' })).toContain('height:2rem')
    expect(await render(kit.BaseKbd, { keys: ['⌘', 'K'] })).toContain('<kbd')
    expect(await render(kit.BaseChip, { label: 'tasarım' })).toContain('tasarım')
    expect(
      await render(kit.AvatarStack, { people: [{ name: 'Aiko' }], label: '1 kişi' }),
    ).toContain('aria-label="1 kişi"')
    expect(await render(kit.BaseLink, { href: '/a' })).toContain('href="/a"')
    expect(
      await render(kit.CopyButton, { text: 'x', copyLabel: 'Kopyala', copiedLabel: 'Kopyalandı' }),
    ).toContain('aria-label="Kopyala"')
    expect(
      await render(kit.BaseRating, {
        label: 'Puan',
        valueLabel: (value: number, max: number) => `${max} üzerinden ${value}`,
        modelValue: 3,
      }),
    ).toContain('role="slider"')
    expect(
      await render(kit.FileDrop, { label: 'Bırakın', browseLabel: 'Gözat', removeLabel: 'Kaldır' }),
    ).toContain('type="file"')
    expect(
      await render(kit.TagsInput, { label: 'Etiketler', removeLabel: (tag: string) => tag }),
    ).toContain('Etiketler')
  })
})

describe('server rendering, the desk parts', () => {
  it('renders a table and a listbox, and a palette that is closed', async () => {
    const { BaseListbox } = await import('../index')
    const { CommandMenu, DataTable } = await import('../web/index')

    const table = await render(DataTable, {
      caption: 'Ödemeler',
      columns: [{ key: 'name', label: 'Ad', sortable: true }],
      rows: [{ name: 'Ada' }],
    })
    expect(table).toContain('aria-sort="none"')

    const list = await render(BaseListbox, {
      label: 'Kişiler',
      options: [{ value: 'a', label: 'Ada' }],
    })
    expect(list).toContain('role="listbox"')

    const palette = await render(CommandMenu, {
      groups: [{ items: [{ id: 'a', label: 'Bir' }] }],
      label: 'Komutlar',
      placeholder: 'Yazın',
      emptyLabel: 'Yok',
    })
    expect(palette).not.toContain('role="combobox"')
  })
})

describe('server rendering, the layout parts', () => {
  it('renders a tree, a splitter, a toolbar and a transfer list', async () => {
    const { BaseSplitter, BaseToolbar, BaseTree, TransferList } = await import('../web/index')

    expect(
      await render(BaseTree, { label: 'Dosyalar', nodes: [{ key: 'a', label: 'src' }] }),
    ).toContain('role="tree"')
    expect(await render(BaseSplitter, { label: 'Böl' })).toContain('role="separator"')
    expect(await render(BaseToolbar, { label: 'Biçim' })).toContain('role="toolbar"')
    expect(
      await render(TransferList, {
        options: [{ value: 'a', label: 'Okuma' }],
        availableLabel: 'Verilebilir',
        chosenLabel: 'Verilmiş',
        addLabel: 'Ekle',
        removeLabel: 'Çıkar',
      }),
    ).toContain('Verilebilir')
  })
})

describe('server rendering, asking and saying', () => {
  it('renders the confirmation, the time field and the pairs', async () => {
    const { BasePopconfirm, DescriptionList, TimePicker } = await import('../index')

    expect(
      await render(BasePopconfirm, {
        message: 'Silinsin mi?',
        confirmLabel: 'Sil',
        cancelLabel: 'Vazgeç',
      }),
    ).not.toContain('role="dialog"')
    expect(
      await render(TimePicker, { label: 'Saat', hoursLabel: 'Saat', minutesLabel: 'Dakika' }),
    ).toContain('aria-haspopup="dialog"')
    expect(
      await render(DescriptionList, { items: [{ term: 'Durum', description: 'Ödendi' }] }),
    ).toContain('<dt')
  })
})
