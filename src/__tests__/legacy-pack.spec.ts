import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, ref } from 'vue'

import {
  EmptyState,
  GoogleButton,
  LocaleLinks,
  PageHeader,
  SectionHeading,
  SegmentedControl,
  SettingsGroup,
  SettingsRow,
  StatCard,
  TabBar,
  ToneDot,
} from '../index'

/**
 * The twelve components that had no behaviour test.
 *
 * They are the oldest parts of the kit, which is exactly why they had none: the
 * ones written first were written before there was a habit of testing them, and
 * nothing since then has failed loudly enough to notice. Every assertion here is
 * about something a reader would feel — a name that reaches assistive tech, a
 * control that is a button when it does something and a `div` when it does not,
 * a state that is not carried by colour alone.
 */

const RouterLinkStub = { props: ['to'], template: '<a :href="to"><slot /></a>' }
const stubs = { RouterLink: RouterLinkStub }

describe('EmptyState', () => {
  it('always says something, because a blank area reads as a broken page', () => {
    const w = mount(EmptyState, { props: { title: 'Henüz kayıt yok' } })

    expect(w.find('h3').text()).toBe('Henüz kayıt yok')
  })

  it('leaves out the icon and the action when nothing fills them', () => {
    const bare = mount(EmptyState, { props: { title: 'x' } })
    expect(bare.findAll('div')).toHaveLength(1)

    const full = mount(EmptyState, {
      props: { title: 'x', description: 'y' },
      slots: { icon: '<i />', action: '<button>Ekle</button>' },
    })
    expect(full.find('button').exists()).toBe(true)
    expect(full.text()).toContain('y')
  })
})

describe('GoogleButton', () => {
  it('is a button that does not submit the form it sits in', () => {
    // A bare <button> inside a form submits it, which on a sign-in screen means
    // the form posts instead of the OAuth redirect running.
    expect(
      mount(GoogleButton, { props: { label: 'Google' } })
        .find('button')
        .attributes('type'),
    ).toBe('button')
  })

  it('hides the mark from assistive tech, since the label already says it', () => {
    const w = mount(GoogleButton, { props: { label: 'Google ile devam et' } })

    expect(w.find('svg').attributes('aria-hidden')).toBe('true')
    expect(w.text()).toBe('Google ile devam et')
  })

  it('stops answering while a sign-in is already in flight', async () => {
    const w = mount(GoogleButton, { props: { label: 'Google', disabled: true } })
    await w.find('button').trigger('click')

    expect(w.emitted('click')).toBeUndefined()
  })
})

describe('LocaleLinks', () => {
  const props = {
    locales: ['tr', 'en'] as const,
    labels: { tr: 'Türkçe', en: 'English' },
    label: 'Dil',
  }

  it('names each language in its own language', () => {
    // An endonym is the one label a reader who cannot read the current
    // interface can still recognise.
    const w = mount(LocaleLinks, { props, global: { stubs } })

    expect(w.text()).toContain('Türkçe')
    expect(w.text()).toContain('English')
  })

  it('names the group, so the links are not loose in the page', () => {
    const w = mount(LocaleLinks, { props, global: { stubs } })

    expect(w.find('[aria-label="Dil"]').exists()).toBe(true)
  })
})

describe('PageHeader', () => {
  it('centres the title on the screen rather than on what is left over', () => {
    // Three fixed columns: a back arrow on one side and nothing on the other
    // would otherwise push every title off centre by half a button.
    const w = mount(PageHeader, { props: { title: 'Ayarlar' } })

    expect(w.find('header').classes().join(' ')).toContain('grid-cols-[2.5rem_1fr_2.5rem]')
  })

  it("is the page's one h1", () => {
    const w = mount(PageHeader, { props: { title: 'Ayarlar' } })

    expect(w.find('h1').text()).toBe('Ayarlar')
  })

  it('lets a screen replace the title without losing the layout', () => {
    const w = mount(PageHeader, {
      props: { title: 'unused' },
      slots: { title: '<span>Eylül</span>', left: '<button>geri</button>' },
    })

    expect(w.find('h1').text()).toBe('Eylül')
    expect(w.text()).not.toContain('unused')
  })
})

describe('SectionHeading', () => {
  const tone = { fill: 'bg-positive', card: 'bg-positive/5', text: 'text-positive' }

  it('is a heading, not a styled row', () => {
    // It is how somebody moves through a long screen without reading all of it.
    const w = mount(SectionHeading, { props: { tone, label: 'Bugün' } })

    expect(w.find('h2').exists()).toBe(true)
  })

  it('stays quiet when the group is empty', () => {
    // A heading reading "Bugün 0" is a count nobody asked for.
    expect(mount(SectionHeading, { props: { tone, label: 'Bugün' } }).text()).toBe('Bugün')
    expect(mount(SectionHeading, { props: { tone, label: 'Bugün', count: 3 } }).text()).toContain(
      '3',
    )
  })

  it('takes its colours as whole class names', () => {
    // Tailwind reads source as plain text, so a class assembled at runtime
    // never reaches the stylesheet. The app writes them out.
    const w = mount(SectionHeading, { props: { tone, label: 'Bugün' } })

    expect(w.find('h2').classes()).toContain('bg-positive/5')
  })
})

describe('SegmentedControl', () => {
  const options = [
    { value: 'all', label: 'Hepsi' },
    { value: 'free', label: 'Ücretsiz' },
  ]

  it('is a real radio group rather than a row of buttons', () => {
    // The choice is one of several, and a native radio already carries that:
    // the arrow keys move between them and a screen reader says "1 of 2".
    // Painted buttons with `aria-pressed` would be three things to remember
    // and the keyboard would still be wrong.
    const w = mount(SegmentedControl, { props: { options, modelValue: 'free' } })
    const radios = w.findAll('input[type="radio"]')

    expect(radios).toHaveLength(2)
    expect((radios[1]!.element as HTMLInputElement).checked).toBe(true)
  })

  it('keeps the label reachable while hiding the control', () => {
    // `sr-only` rather than `display: none`: a hidden input is not focusable,
    // and the whole row is the label so the words are part of the hit target.
    const w = mount(SegmentedControl, { props: { options, modelValue: 'all' } })

    expect(w.find('input').classes()).toContain('sr-only')
    expect(w.findAll('label')).toHaveLength(2)
  })

  it('emits the value rather than the index', async () => {
    const w = mount(SegmentedControl, { props: { options, modelValue: 'all' } })
    await w.findAll('input')[1]!.setValue()

    expect(w.emitted('update:modelValue')?.[0]).toEqual(['free'])
  })
})

describe('SettingsGroup and SettingsRow', () => {
  it('gives the group a real heading', () => {
    const w = mount(SettingsGroup, {
      props: { title: 'Görünüm' },
      slots: { default: '<p>row</p>' },
    })

    expect(w.find('h2').text()).toBe('Görünüm')
  })

  it('is a button when the row does something, and not when it does not', () => {
    // A row that navigates has to be operable by keyboard; a row that only
    // holds a switch must not add a second, larger control around it.
    expect(
      mount(SettingsRow, { props: { label: 'Dil', interactive: true } })
        .find('button')
        .exists(),
    ).toBe(true)
    expect(
      mount(SettingsRow, { props: { label: 'Dil' } })
        .find('button')
        .exists(),
    ).toBe(false)
  })

  it('emits nothing when it is not interactive', async () => {
    const w = mount(SettingsRow, { props: { label: 'Dil' } })
    await w.trigger('click')

    expect(w.emitted('click')).toBeUndefined()
  })
})

describe('StatCard', () => {
  it('carries the direction in the arrow, not only in the colour', () => {
    // A reader who cannot separate the positive and negative hues still gets
    // the answer from the shape.
    const up = mount(StatCard, { props: { value: '₺1.200', label: 'Bu ay', trend: 'up' } })
    const flat = mount(StatCard, { props: { value: '₺1.200', label: 'Bu ay', trend: 'flat' } })

    expect(up.find('svg').exists()).toBe(true)
    expect(up.html()).not.toBe(flat.html())
  })

  it('treats no comparison as a real state rather than a flat one', () => {
    const none = mount(StatCard, { props: { value: '₺0', label: 'Bu ay' } })

    expect(none.find('svg').exists()).toBe(false)
  })
})

describe('TabBar', () => {
  const items = [
    { key: 'month', to: '/ay', label: 'Ay', icon: { render: () => h('i') } },
    { key: 'ledger', to: '/defter', label: 'Defter', icon: { render: () => h('i') } },
  ]

  it('marks the current tab for a screen reader, not only with paint', () => {
    const w = mount(TabBar, { props: { items, active: 'ledger' }, global: { stubs } })
    const links = w.findAll('a')

    expect(links[1]!.attributes('aria-current')).toBe('page')
    expect(links[0]!.attributes('aria-current')).toBeUndefined()
  })

  it('names the landmark, since a bare nav is announced as "navigation"', () => {
    const w = mount(TabBar, { props: { items, label: 'Ana gezinme' }, global: { stubs } })

    expect(w.find('nav').attributes('aria-label')).toBe('Ana gezinme')
  })

  it('answers a tap with a haptic, before the route has resolved', async () => {
    const vibrate = vi.fn<(pattern: number | number[]) => boolean>()
    Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true })

    const w = mount(TabBar, { props: { items }, global: { stubs } })
    await w.findAll('a')[0]!.trigger('click')

    expect(vibrate).toHaveBeenCalled()
  })
})

describe('ToneDot', () => {
  it('is decoration when it is alone, and text when it is not', () => {
    // A bare marker beside a label that already says it would be announced
    // twice; a marker standing on its own has to say what it means.
    const bare = mount(ToneDot, { props: { fill: 'bg-positive' } })
    const labelled = mount(ToneDot, { props: { fill: 'bg-positive', label: 'Tamamlandı' } })

    expect(bare.text()).toBe('')
    expect(labelled.text()).toContain('Tamamlandı')
  })
})

describe('InstallSettings', () => {
  const props = {
    title: 'Uygulama',
    label: 'Ana ekrana ekle',
    installedLabel: 'Yüklü',
    body: 'Çevrimdışı da açılır.',
    iosBody: 'Paylaş menüsünden ekle.',
    action: 'Ekle',
  }

  /** The composable decides what the row says; the component only renders it. */
  const withInstall = async (state: Record<string, unknown>) => {
    vi.resetModules()
    vi.doMock('../pwa/use-install', () => ({
      useInstall: () => ({
        isInstalled: ref(false),
        canPrompt: ref(false),
        needsManualSteps: ref(false),
        prompt: vi.fn<() => Promise<void>>(),
        ...state,
      }),
    }))

    const { default: InstallSettings } = await import('../pwa/InstallSettings.vue')

    return mount(InstallSettings, { props })
  }

  it('renders nothing when there is nothing to offer', async () => {
    // Already installed is a state; a browser that cannot install and is not
    // iOS is not -- and a settings group explaining an impossible action is
    // worse than no group.
    const w = await withInstall({})

    expect(w.text()).toBe('')
  })

  it('offers the button only where there is an API to call', async () => {
    const prompt = vi.fn<() => Promise<void>>()
    const w = await withInstall({ canPrompt: ref(true), prompt })

    expect(w.text()).toContain('Ana ekrana ekle')
    await w.find('button').trigger('click')
    expect(prompt).toHaveBeenCalled()
  })

  it('explains the Share menu on iOS, where there is no API at all', async () => {
    const w = await withInstall({ needsManualSteps: ref(true) })

    expect(w.text()).toContain('Paylaş menüsünden ekle.')
    expect(w.find('button').exists()).toBe(false)
  })

  it('says it is done rather than offering it again', async () => {
    const w = await withInstall({ isInstalled: ref(true) })

    expect(w.text()).toContain('Yüklü')
    expect(w.text()).not.toContain('Çevrimdışı da açılır.')
  })
})
