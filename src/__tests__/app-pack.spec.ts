import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'

import { AuthShell, LocaleSheet, TourShell, createTabTransition, useThemeSync } from '../app/index'
import { useSnooze } from '../pwa/use-snooze'
import InstallPrompt from '../pwa/InstallPrompt.vue'
import UpdatePrompt from '../pwa/UpdatePrompt.vue'
import { setThemeStorageKey, useTheme } from '../index'

/**
 * The parts two phone apps had written twice.
 *
 * `AuthShell` was thirty-seven lines with no difference at all between them;
 * the tab transition thirty-four; the install card 111, differing in a storage
 * key and a colour. None of that is a component nobody could have written — it
 * is a component nobody should have written twice, and then kept in step.
 */
describe('createTabTransition', () => {
  const tabs = () => createTabTransition(['today', 'week', 'year', 'profile'] as const)

  it('reads the direction off the order rather than being told', () => {
    // Reordering the tabs reorders the animation, because they are the same
    // list. Two apps derived this from index distance, identically.
    const t = tabs()

    t.resolve('year', 'week')
    expect(t.direction.value).toBe('forward')

    t.resolve('week', 'year')
    expect(t.direction.value).toBe('backward')
  })

  it('does not slide when there is nothing to slide from', () => {
    // A first load, or a route with no tab at all.
    const t = tabs()

    t.resolve('week', undefined)
    expect(t.direction.value).toBe('none')

    t.resolve('week', 'week')
    expect(t.direction.value).toBe('none')
  })

  it('lets a navigation that is not a tab change say so', () => {
    // Leaving a detail screen under the fourth tab for the first one should
    // slide back; arriving there should not slide forward.
    const t = tabs()

    t.force('backward')
    t.resolve('today', 'profile')

    expect(t.direction.value).toBe('backward')
  })

  it('forgets the override after one navigation', () => {
    const t = tabs()

    t.force('backward')
    t.resolve('today', 'profile')
    t.resolve('year', 'week')

    expect(t.direction.value).toBe('forward')
  })
})

describe('useThemeSync', () => {
  afterEach(() => {
    localStorage.clear()
    setThemeStorageKey('rei-kit-theme')
  })

  it('adopts the account theme when it arrives', async () => {
    // At the app root, not on the settings screen: otherwise a user on a fresh
    // device keeps the system theme until they happen to open Profile.
    const stored = ref<string | null>(null)
    useThemeSync(stored)

    stored.value = 'dark'
    await nextTick()

    expect(useTheme().value).toBe('dark')
  })

  it('never adopts twice', () => {
    // A refetch must not undo a choice the user just made locally — the theme
    // flipping back a second later reads as the app fighting them.
    const stored = ref<string | null>('dark')
    useThemeSync(stored)

    const theme = useTheme()
    theme.value = 'light'
    stored.value = 'dark'

    expect(theme.value).toBe('light')
  })
})

describe('useSnooze', () => {
  afterEach(() => localStorage.clear())

  it('stays quiet for the days it was given', () => {
    const nudge = useSnooze('test-nudge', 7)
    expect(nudge.isOver.value).toBe(true)

    nudge.snooze()
    expect(nudge.isOver.value).toBe(false)
  })

  it('survives storage being blocked entirely', () => {
    // A private window, or a browser set to block site data. The honest
    // failure is a nudge that reappears next session, not a screen that throws.
    const blocked = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    const nudge = useSnooze('blocked-nudge')

    expect(() => nudge.snooze()).not.toThrow()
    blocked.mockRestore()
  })
})

describe('the cards', () => {
  it('InstallPrompt says nothing the app did not give it', () => {
    // Every string is a prop: "Add to Home Screen" is a sentence about a
    // platform, and the kit does not know a language.
    const wrapper = mount(InstallPrompt, {
      props: {
        storageKey: 'x-install',
        title: 'Ana ekrana ekle',
        body: 'Tek dokunuşla aç.',
        action: 'Ekle',
        later: 'Sonra',
      },
    })

    // Not installable in jsdom, so it stays hidden — which is the correct
    // state, and the point: it does not offer what it cannot do.
    expect(wrapper.text()).toBe('')
  })

  it('UpdatePrompt leaves the service worker to the app', () => {
    // `virtual:pwa-register/vue` is a build-time module and a library cannot
    // import one. Whether an update waits is the app's business; what the card
    // looks like is this component's.
    const wrapper = mount(UpdatePrompt, {
      props: {
        open: true,
        title: 'Yeni sürüm hazır',
        body: 'Yenileyince uygulanır.',
        action: 'Yenile',
        dismissLabel: 'Kapat',
      },
    })

    expect(wrapper.text()).toContain('Yeni sürüm hazır')
    wrapper.findAll('button')[0]!.trigger('click')
    expect(wrapper.emitted('update')).toBeTruthy()
  })

  it('AuthShell draws a foot only when given one', () => {
    // Sign-in is the first screen a new user sees and Settings is behind it,
    // so the language links live here — but an app without them should not get
    // an empty box where they would be.
    const bare = mount(AuthShell, { slots: { default: 'form' } })
    const full = mount(AuthShell, { slots: { default: 'form', foot: 'diller' } })

    expect(bare.text()).toBe('form')
    expect(full.text()).toContain('diller')
  })
})

describe('TourShell', () => {
  const props = {
    modelValue: true,
    index: 0,
    total: 4,
    dialogLabel: 'Tanıtım',
    skipLabel: 'Geç',
    backLabel: 'Geri',
    nextLabel: 'İleri',
    lastLabel: 'Başla',
    stepLabel: (n: number) => `${n}. adım`,
  }

  it('takes the app behind it out of reach while it is open', () => {
    // Without `inert`, Tab walks into a screen the reader cannot see. Both
    // apps had written this, and both had to remember to undo it.
    const app = document.createElement('div')
    app.id = 'app'
    document.body.append(app)

    const wrapper = mount(TourShell, { props, attachTo: document.body })

    expect(app.hasAttribute('inert')).toBe(true)

    wrapper.unmount()
    expect(app.hasAttribute('inert')).toBe(false)

    app.remove()
  })

  /* It teleports, so the dialog is in the document rather than in the wrapper —
     which is the whole point: a phone shell clips its children and the guide
     has to cover the tab bar. */
  const shown = () => document.body.textContent ?? ''

  it('says Start on the last slide and Next on every other', () => {
    const middle = mount(TourShell, { props })
    expect(shown()).toContain('İleri')
    middle.unmount()

    const last = mount(TourShell, { props: { ...props, index: 3 } })
    expect(shown()).toContain('Başla')
    expect(shown()).not.toContain('İleri')
    last.unmount()
  })

  it('offers no way back from the first slide', () => {
    const first = mount(TourShell, { props })
    expect(shown()).not.toContain('Geri')
    first.unmount()

    const second = mount(TourShell, { props: { ...props, index: 1 } })
    expect(shown()).toContain('Geri')
    second.unmount()
  })

  it('draws a segment per slide, and names each one', () => {
    // A track rather than dots: ten slides is a sequence with a length, and the
    // reader deserves to see how much is left.
    const wrapper = mount(TourShell, { props: { ...props, index: 1 } })
    const tabs = [...document.querySelectorAll('[role="tab"]')]

    expect(tabs).toHaveLength(4)
    expect(tabs[1]!.getAttribute('aria-selected')).toBe('true')
    expect(tabs[2]!.getAttribute('aria-label')).toBe('3. adım')
    wrapper.unmount()
  })

  it('walks with the arrow keys, which is why the dialog takes focus', async () => {
    const wrapper = mount(TourShell, { props })
    const dialog = document.querySelector('[role="dialog"]')!

    for (const key of ['ArrowRight', 'ArrowLeft', 'Escape']) {
      dialog.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
    }

    expect(wrapper.emitted('next')).toBeTruthy()
    expect(wrapper.emitted('back')).toBeTruthy()
    expect(wrapper.emitted('dismiss')).toBeTruthy()
    wrapper.unmount()
  })
})

describe('LocaleSheet', () => {
  it('lists the system option first, and the endonyms after', () => {
    // A language is always listed in its own language, so someone who cannot
    // read the current interface can still find theirs. The kit cannot know
    // them, so they are the caller's.
    const wrapper = mount(LocaleSheet, {
      props: {
        modelValue: 'system',
        label: 'Dil',
        systemLabel: 'Sistem',
        options: [
          { value: 'tr', label: 'Türkçe' },
          { value: 'ja', label: '日本語' },
        ],
      },
    })

    // The row shows what is chosen without opening the sheet.
    expect(wrapper.text()).toContain('Sistem')
    wrapper.unmount()
  })
})
