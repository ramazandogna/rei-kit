import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { RouterLinkStub } from '@vue/test-utils'

import {
  BaseButton,
  BaseCheckbox,
  BaseInput,
  BaseRadioGroup,
  BaseSelect,
  PasswordInput,
  BaseTextarea,
  FormField,
} from '../index'

/**
 * The layer that was making every app write markup by hand.
 *
 * The kit had one button that could only ever be a `<button>`, and one form
 * control. Across three consumers that came to 136 hand-written `<button>`
 * elements, five `<select>`s, six `<textarea>`s and seven checkboxes — every
 * one of them a place where the kit's focus ring, its disabled state and its
 * error wiring had to be remembered rather than inherited.
 *
 * What is pinned here is the part that fails quietly: an element that is the
 * wrong element, a disabled link that is still clickable, a field whose error
 * is invisible to a screen reader.
 */
describe('BaseButton as an element', () => {
  it('is a button until told otherwise', () => {
    const wrapper = mount(BaseButton, { slots: { default: 'Kaydet' } })

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('becomes a real anchor rather than a button inside one', () => {
    // The bug this replaces: `<RouterLink><BaseButton>` renders an <a> around
    // a <button>. Invalid HTML, two stops in the tab order, two controls
    // announced for one thing on screen.
    const wrapper = mount(BaseButton, {
      props: { as: 'a', href: '/fiyatlandirma' },
      slots: { default: 'Fiyatlar' },
    })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/fiyatlandirma')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('resolves router-link by name, so vue-router stays optional', () => {
    // Nothing in this component imports vue-router. An app that never passes
    // `as="router-link"` never needs it installed.
    const wrapper = mount(BaseButton, {
      props: { as: 'router-link', to: '/kurslar' },
      slots: { default: 'Kurslar' },
      global: { stubs: { 'router-link': RouterLinkStub } },
    })

    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/kurslar')
  })

  it('takes the href away when a link is disabled', () => {
    // `disabled` is not a thing an anchor has. Left with its href it stays
    // focusable and activatable, so the attribute is removed outright -- which
    // is the whole of what disabled means for a link.
    const wrapper = mount(BaseButton, {
      props: { as: 'a', href: '/kurslar', disabled: true },
      slots: { default: 'Kurslar' },
    })

    expect(wrapper.attributes('href')).toBeUndefined()
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })

  it('does not put aria-disabled on a button, which has the real thing', () => {
    const wrapper = mount(BaseButton, { props: { disabled: true } })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('aria-disabled')).toBeUndefined()
  })

  it('is square when it holds only an icon', () => {
    const wrapper = mount(BaseButton, { props: { icon: true, size: 'md' } })

    expect(wrapper.classes()).toContain('size-11')
    // Horizontal padding would stop it being square.
    expect(wrapper.classes().some((c) => c.startsWith('px-'))).toBe(false)
  })

  it('forwards the accessible name an icon button cannot do without', () => {
    const wrapper = mount(BaseButton, {
      props: { icon: true },
      attrs: { 'aria-label': 'Ayarlar' },
    })

    expect(wrapper.attributes('aria-label')).toBe('Ayarlar')
  })

  it('reports that it is working while it loads', () => {
    const wrapper = mount(BaseButton, { props: { loading: true } })

    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})

describe('FormField wiring', () => {
  it('points the label at the control it names', () => {
    const wrapper = mount(FormField, {
      props: { label: 'E-posta' },
      slots: { default: `<template #default="{ id }"><input :id="id" /></template>` },
    })

    const forAttr = wrapper.get('label').attributes('for')

    expect(forAttr).toBeTruthy()
    expect(wrapper.get('input').attributes('id')).toBe(forAttr)
  })

  it('describes the field by its error, not by its hint', () => {
    // Both at once buries the reason the field was rejected under advice the
    // reader has already had.
    const wrapper = mount(FormField, {
      props: { label: 'E-posta', hint: 'İş adresi olabilir', error: 'Geçerli değil' },
      slots: {
        default: `<template #default="{ describedBy }"><input :aria-describedby="describedBy" /></template>`,
      },
    })

    const describedBy = wrapper.get('input').attributes('aria-describedby')

    expect(wrapper.get(`#${describedBy}`).text()).toBe('Geçerli değil')
    expect(wrapper.text()).not.toContain('İş adresi olabilir')
  })

  it('keeps the label for assistive tech when it is hidden from the eye', () => {
    // Dropping it entirely would leave the control with no accessible name.
    const wrapper = mount(FormField, {
      props: { label: 'Ara', labelHidden: true },
      slots: { default: `<template #default="{ id }"><input :id="id" /></template>` },
    })

    expect(wrapper.get('label').classes()).toContain('sr-only')
    expect(wrapper.get('label').text()).toBe('Ara')
  })
})

describe('the controls built on it', () => {
  it('BaseSelect offers a placeholder nobody can choose', () => {
    // An empty option that can be selected lets someone go back to having
    // answered nothing, which no form wants.
    const wrapper = mount(BaseSelect, {
      props: {
        label: 'Para birimi',
        placeholder: 'Seçin',
        options: [
          { value: 'TRY', label: 'Türk lirası' },
          { value: 'JPY', label: 'Japon yeni' },
        ],
      },
    })

    const first = wrapper.findAll('option')[0]!

    expect(first.text()).toBe('Seçin')
    expect(first.attributes('disabled')).toBeDefined()
  })

  it('BaseTextarea carries the field wiring a bare textarea has to be given', () => {
    const wrapper = mount(BaseTextarea, {
      props: { label: 'Not', error: 'Çok uzun' },
    })

    expect(wrapper.get('textarea').attributes('aria-invalid')).toBe('true')
    const describedBy = wrapper.get('textarea').attributes('aria-describedby')
    expect(wrapper.get(`#${describedBy}`).text()).toBe('Çok uzun')
  })

  it('BaseCheckbox makes the words part of the hit target', () => {
    // On a phone, a 16px box on its own is the difference between a control
    // and a coin toss.
    const wrapper = mount(BaseCheckbox, { props: { label: 'Beni hatırla' } })

    expect(wrapper.get('label').attributes('for')).toBe(wrapper.get('input').attributes('id'))
    expect(wrapper.get('label').text()).toContain('Beni hatırla')
  })

  it('BaseRadioGroup names the question, not one of the answers', () => {
    // A label points at one element; what is being named here is the question.
    // Left as a label, a screen reader reads the options with no idea what
    // they are options for.
    const wrapper = mount(BaseRadioGroup, {
      props: {
        legend: 'Tema',
        options: [
          { value: 'light', label: 'Açık' },
          { value: 'dark', label: 'Koyu' },
        ],
      },
    })

    expect(wrapper.element.tagName).toBe('FIELDSET')
    expect(wrapper.get('legend').text()).toBe('Tema')
  })

  it('BaseRadioGroup keeps its radios in one group', () => {
    // Without a shared name they are independent checkboxes that look round.
    const wrapper = mount(BaseRadioGroup, {
      props: {
        legend: 'Tema',
        options: [
          { value: 'light', label: 'Açık' },
          { value: 'dark', label: 'Koyu' },
        ],
      },
    })

    const names = wrapper.findAll('input').map((input) => input.attributes('name'))

    expect(new Set(names).size).toBe(1)
    expect(names[0]).toBeTruthy()
  })
})

describe('the size scale', () => {
  it('states the input type size the kit had been leaving to the host page', () => {
    // Two consumers force 16px on form elements to stop iOS zooming and a
    // third does not, so `BaseInput` rendered at two different sizes
    // depending on which app it was in. `md` now says which it is.
    const wrapper = mount(BaseInput, { props: { label: 'E-posta' } })

    expect(wrapper.get('input').classes()).toContain('text-base')
    expect(wrapper.get('input').classes()).toContain('h-11')
  })

  it('never shrinks a typing target below 16px, whatever the size', () => {
    // iOS zooms the viewport when it focuses a text field under 16px, and the
    // page does not zoom back. Both phone consumers had written
    // `input { font-size: 16px }` into their base layer to stop it, and a
    // `text-sm` from here would have overridden that in every app at once.
    for (const size of ['sm', 'md'] as const) {
      expect(
        mount(BaseInput, { props: { label: 'Tarih', size } })
          .get('input')
          .classes(),
      ).toContain('text-base')
      expect(
        mount(BaseTextarea, { props: { label: 'Not', size } })
          .get('textarea')
          .classes(),
      ).toContain('text-base')
    }
  })

  it('lets a select shrink, because a select does not zoom', () => {
    // It opens a native picker rather than a caret.
    expect(
      mount(BaseSelect, {
        props: { label: 'Sırala', size: 'sm', options: [{ value: 'a', label: 'A' }] },
      })
        .get('select')
        .classes(),
    ).toContain('text-sm')
  })

  it('is every type a text field can be', () => {
    // `date` and `search` were hand-written three times each and `url` twice,
    // in files that already imported this component.
    for (const type of ['date', 'search', 'url', 'tel', 'time'] as const) {
      expect(
        mount(BaseInput, { props: { label: 'Alan', type } })
          .get('input')
          .attributes('type'),
      ).toBe(type)
    }
  })

  it('gives a control that filters rather than answers a smaller one', () => {
    // Every hand-written select across the three apps was this one, and the
    // kit only had the large one — which is why none of them used it.
    const wrapper = mount(BaseSelect, {
      props: { label: 'Sırala', size: 'sm', options: [{ value: 'new', label: 'Yeni' }] },
    })

    expect(wrapper.get('select').classes()).toContain('text-sm')
    // The height does not change with it: both sizes keep the 44px touch
    // target, because a select that filters is pressed with the same thumb as
    // one that answers a form.
    expect(wrapper.get('select').classes()).toContain('h-11')
  })

  it('quiets the label of a small field so it does not outweigh its control', () => {
    const wrapper = mount(BaseSelect, {
      props: { label: 'Sırala', size: 'sm', options: [{ value: 'new', label: 'Yeni' }] },
    })

    expect(wrapper.get('label').classes()).toContain('text-xs')
    expect(wrapper.get('label').classes()).toContain('text-ink-soft')
  })

  it('separates a checkbox that is a setting from one that is an aside', () => {
    // Four of the five hand-written checkboxes were the aside; one was the
    // setting. They differed in exactly the gap and the ink.
    const setting = mount(BaseCheckbox, { props: { label: 'Bildirimler' } })
    const aside = mount(BaseCheckbox, { props: { label: 'Beni hatırla', size: 'sm' } })

    expect(setting.get('label').classes()).toContain('gap-3')
    expect(setting.get('span').classes()).toContain('text-ink')

    expect(aside.get('label').classes()).toContain('gap-2')
    expect(aside.get('span').classes()).toContain('text-ink-soft')
  })
})

describe('BaseSelect over its value type', () => {
  it('takes numbers without the caller converting on both sides', () => {
    // A day of the month is a number. Typed to `string`, this component made
    // every consumer with numbered options write glue in and glue out -- and a
    // component you have to wrap is one you write yourself instead.
    const wrapper = mount(BaseSelect, {
      props: {
        label: 'Ayın günü',
        modelValue: 3,
        options: [
          { value: 1, label: '1' },
          { value: 3, label: '3' },
        ],
      },
    })

    expect((wrapper.get('select').element as HTMLSelectElement).value).toBe('3')
  })
})

describe('the shapes a button has to be able to take', () => {
  it('drops its surface entirely for a text action', () => {
    // "Clear this note", "remove", "change category" — 10 of these were hand
    // written across the three apps. `ghost` cannot stand in: it has a hover
    // surface and a radius, so it reads as a button that happens to be empty.
    const wrapper = mount(BaseButton, { props: { variant: 'link' } })

    expect(wrapper.classes()).toContain('underline')
    // No height and no padding: those are what make a surface.
    expect(wrapper.classes().some((c) => /^h-\d/.test(c))).toBe(false)
    expect(wrapper.classes().some((c) => c.startsWith('px-'))).toBe(false)
    expect(wrapper.classes()).not.toContain('rounded-card')
  })

  it('rounds fully when it is the action inside a prompt', () => {
    // Every install prompt, update prompt and nudge used the same pair: a
    // filled pill to act and a quiet one to dismiss. None could use this
    // component, which knew one radius.
    const act = mount(BaseButton, { props: { pill: true, size: 'xs' } })
    const dismiss = mount(BaseButton, { props: { pill: true, size: 'xs', variant: 'ghost' } })

    expect(act.classes()).toContain('rounded-full')
    expect(act.classes()).toContain('h-8')
    expect(act.classes()).toContain('text-xs')
    expect(dismiss.classes()).toContain('rounded-full')
  })

  it('keeps the card corner when nothing asks otherwise', () => {
    expect(mount(BaseButton).classes()).toContain('rounded-card')
  })
})

describe('quiet, which is not ghost', () => {
  it('starts soft where ghost starts at full strength', () => {
    // `text-ink-soft hover:text-ink` was hand-written 47 times across the three
    // apps. Both fill on hover; the difference is the ink it starts at, which
    // is the difference between a control waiting to be used and one that is
    // merely available.
    const quiet = mount(BaseButton, { props: { variant: 'quiet' } })
    const ghost = mount(BaseButton, { props: { variant: 'ghost' } })

    expect(quiet.classes()).toContain('text-ink-soft')
    expect(quiet.classes()).toContain('hover:text-ink')

    expect(ghost.classes()).toContain('text-ink')
    expect(ghost.classes()).not.toContain('text-ink-soft')
  })
})

describe('the button as a primitive rather than a look', () => {
  it('can be every colour role the kit declares', () => {
    // tokens.css names five roles and this component exposed two, so an app
    // that wanted a success-coloured action hand-wrote the button. A component
    // that cannot use a role its own design system declares is incomplete.
    for (const [variant, expected] of [
      ['positive', 'bg-positive'],
      ['warning', 'bg-warning'],
      ['accent', 'bg-accent'],
    ] as const) {
      expect(mount(BaseButton, { props: { variant } }).classes()).toContain(expected)
    }
  })

  it('gives everything but the paint when asked', () => {
    // 58 raw <button> elements sat in 24 files that already used BaseButton.
    // The kit offered all of its appearance or none of itself, and those
    // places needed everything except the appearance.
    const wrapper = mount(BaseButton, { props: { variant: 'unstyled' } })
    const classes = wrapper.classes()

    expect(classes.some((c) => c.startsWith('bg-'))).toBe(false)
    expect(classes.some((c) => c.startsWith('rounded'))).toBe(false)
    expect(classes.some((c) => /^h-\d|^px-/.test(c))).toBe(false)
    expect(classes).not.toContain('inline-flex')

    // The floor stays. A raw <button> is what happens when these are optional.
    expect(classes).toContain('focus-visible:outline-primary')
    expect(classes).toContain('disabled:opacity-50')
  })

  it('is an action until it is told it is a switch', () => {
    expect(mount(BaseButton).attributes('aria-pressed')).toBeUndefined()
    expect(mount(BaseButton, { props: { pressed: false } }).attributes('aria-pressed')).toBe(
      'false',
    )
    expect(mount(BaseButton, { props: { pressed: true } }).attributes('aria-pressed')).toBe('true')
  })

  it('fills a variant that has an off look when the switch is on', () => {
    // 18 hand-written toggles across the apps, and almost none said
    // aria-pressed: a screen reader met a row of identical buttons with no way
    // to know which was chosen.
    const off = mount(BaseButton, { props: { variant: 'ghost', pressed: false } })
    const on = mount(BaseButton, { props: { variant: 'ghost', pressed: true } })

    expect(off.classes()).toContain('bg-transparent')
    expect(on.classes()).toContain('bg-primary')
  })

  it('leaves an unstyled toggle entirely to the app, except the semantics', () => {
    const on = mount(BaseButton, { props: { variant: 'unstyled', pressed: true } })

    expect(on.attributes('aria-pressed')).toBe('true')
    expect(on.classes().some((c) => c.startsWith('bg-'))).toBe(false)
  })
})

describe('the hover it was not animating', () => {
  it('transitions colour, not only transform', () => {
    // Every variant changes colour on hover and none of them animated it, so
    // every button in every consuming app snapped while the hand-written
    // controls beside them faded. `transition-colors` appears 106 times across
    // the three apps; this component was the one thing not following it.
    const classes = mount(BaseButton).classes().join(' ')

    // The list grew to include the material's depth and press, but colour has
    // to stay in it -- that was the whole point of this test.
    expect(classes).toMatch(/transition-\[[^\]]*\bcolor\b[^\]]*background-color/)
  })

  it('still imposes no transition on an unstyled button', () => {
    const classes = mount(BaseButton, { props: { variant: 'unstyled' } })
      .classes()
      .join(' ')

    expect(classes).not.toContain('transition-')
  })
})

describe('the fields without their surface', () => {
  it('keeps the wiring and drops the paint', () => {
    // A search box inside a bordered row, a url field in an editor popover:
    // those places hand-wrote the whole field to avoid the appearance, and
    // lost the label wiring with it.
    const wrapper = mount(BaseInput, {
      props: { label: 'Ara', variant: 'unstyled', error: 'Geçersiz' },
    })
    const input = wrapper.get('input')

    expect(input.classes().some((c) => c.startsWith('border'))).toBe(false)
    expect(input.classes().some((c) => c.startsWith('rounded'))).toBe(false)
    expect(input.classes().some((c) => /^h-\d/.test(c))).toBe(false)

    // What a field actually is, still here.
    expect(input.attributes('id')).toBe(wrapper.get('label').attributes('for'))
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(wrapper.get(`#${input.attributes('aria-describedby')}`).text()).toBe('Geçersiz')
  })

  describe('an addon attached to the field', () => {
    /* Both of these were hand-written inside this kit before they were a
       slot — the password toggle and the number steppers — and an app that
       wanted a currency mark had to rebuild the field to get one, losing
       the label wiring with it. */
    it('moves the surface to a wrapper so the edge encloses the addon', () => {
      const wrapper = mount(BaseInput, {
        props: { label: 'Ağırlık' },
        slots: { suffix: '<span aria-hidden="true">kg</span>' },
      })

      const input = wrapper.get('input')
      expect(input.classes()).toContain('bg-transparent')
      expect(input.classes()).not.toContain('control')
      expect(wrapper.get('div.control').classes()).toContain('rounded-card')
      expect(wrapper.text()).toContain('kg')
    })

    it('keeps the label wired to the input, not to the wrapper', () => {
      /* The whole reason this is a slot rather than something the app
         rebuilds: the field's wiring survives having something attached. */
      const wrapper = mount(BaseInput, {
        props: { label: 'Tutar', hint: 'Vergi dahil' },
        slots: { prefix: '<span aria-hidden="true">₺</span>' },
      })

      const input = wrapper.get('input')
      expect(wrapper.get('label').attributes('for')).toBe(input.attributes('id'))
      expect(wrapper.get(`#${input.attributes('aria-describedby')}`).text()).toBe('Vergi dahil')
    })

    it('renders the plain field when no addon is given', () => {
      /* The shape only changes for a caller who asked for it; this is what
         keeps the slots from being a breaking change. */
      const input = mount(BaseInput, { props: { label: 'E-posta' } }).get('input')

      expect(input.classes()).toContain('control')
      expect(input.classes()).not.toContain('bg-transparent')
    })

    it('does not grow a surface for `unstyled` to hang it on', () => {
      // `unstyled` is the wiring without the paint; an addon's border would
      // be the paint coming back.
      const wrapper = mount(BaseInput, {
        props: { label: 'Ara', variant: 'unstyled' },
        slots: { suffix: '<span>↵</span>' },
      })

      expect(wrapper.find('div.control').exists()).toBe(false)
    })
  })

  it('holds the 16px line even with no surface', () => {
    // The zoom is caused by the font size, not by the border.
    expect(
      mount(BaseInput, { props: { label: 'Ara', variant: 'unstyled' } })
        .get('input')
        .classes(),
    ).toContain('text-base')
  })

  it('does it for the select and the textarea too', () => {
    const select = mount(BaseSelect, {
      props: { label: 'Sırala', variant: 'unstyled', options: [{ value: 'a', label: 'A' }] },
    })
    const textarea = mount(BaseTextarea, { props: { label: 'Not', variant: 'unstyled' } })

    expect(
      select
        .get('select')
        .classes()
        .some((c) => c.startsWith('border')),
    ).toBe(false)
    expect(
      textarea
        .get('textarea')
        .classes()
        .some((c) => c.startsWith('border')),
    ).toBe(false)
  })
})

describe('BaseInput over its value', () => {
  it('holds a number for a number field', () => {
    // Typed to `string` alone, `type="number"` forced the caller to keep a
    // string ref and convert on both sides.
    const wrapper = mount(BaseInput, {
      props: { label: 'Ofset', type: 'number', modelValue: 1200 },
    })

    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('1200')
  })
})

describe('the shapes the apps were painting by hand', () => {
  it('fills on hover whether it holds a glyph or a word', () => {
    // 0.11.0 filled only icons, on the theory that a square hit area has bounds
    // the reader cannot see. Reading the third app said otherwise: an editor
    // toolbar's buttons carry text and fill identically. The shape is "a
    // control in a strip". A text action that should have no surface is `link`.
    for (const props of [{ variant: 'quiet' }, { variant: 'quiet', icon: true }] as const) {
      expect(mount(BaseButton, { props }).classes()).toContain('hover:bg-muted')
    }

    expect(
      mount(BaseButton, { props: { variant: 'link' } })
        .classes()
        .some((c) => c.startsWith('hover:bg-')),
    ).toBe(false)
  })

  it('is a row when the control is a line in a list', () => {
    // `.tree-row`, `.row`, `.header-action` — every app had written this,
    // because a button that centres its content cannot be a row.
    const wrapper = mount(BaseButton, { props: { variant: 'row' } })

    expect(wrapper.classes()).toContain('w-full')
    expect(wrapper.classes()).toContain('justify-start')
    expect(wrapper.classes()).toContain('text-left')
    expect(wrapper.classes()).not.toContain('justify-center')
  })

  it('sizes a row by its padding, so it can hold two lines', () => {
    // A settings line holds one line of text and a tree node can hold two; a
    // fixed height turns the second into an overflow.
    const wrapper = mount(BaseButton, { props: { variant: 'row' } })

    expect(wrapper.classes().some((c) => /^h-\d/.test(c))).toBe(false)
    expect(wrapper.classes()).toContain('py-2.5')
  })

  it('does not let a row flinch when pressed', () => {
    // Scaling a full-width line looks like the list itself moved.
    // The press is the material's now (`--press-scale`), but a row still opts
    // out of it entirely.
    expect(mount(BaseButton, { props: { variant: 'row' } }).classes()).not.toContain(
      'active:scale-(--press-scale)',
    )
    expect(mount(BaseButton).classes()).toContain('active:scale-(--press-scale)')
  })

  it('already had the chip, and nobody had noticed', () => {
    // `.chip-off` was `border-hair bg-surface text-ink hover:bg-muted` on a
    // `rounded-full px-3 py-1.5 text-xs` box. That is this, exactly.
    const chip = mount(BaseButton, { props: { variant: 'secondary', pill: true, size: 'xs' } })

    expect(chip.classes()).toContain('rounded-full')
    expect(chip.classes()).toContain('text-xs')
    // A control surface since 1.1.0, so the material decides its fill and edge.
    expect(chip.classes()).toContain('control')
    expect(chip.classes().join(' ')).toContain('hover:bg-muted')
  })
})

describe('destructive, which is not danger', () => {
  it('stays quiet until it is reached for', () => {
    // `danger` is filled and shouts before it is needed: a red button at the
    // end of every row makes the list look like a warning.
    const wrapper = mount(BaseButton, { props: { variant: 'destructive' } })

    expect(wrapper.classes()).toContain('text-ink-soft')
    expect(wrapper.classes()).toContain('hover:text-negative')
    expect(wrapper.classes()).toContain('bg-transparent')
  })

  it('settles a coin toss the apps were all losing', () => {
    // They wrote `variant="quiet"` with a `hover:text-negative` class beside
    // it. That class and quiet's own `hover:text-ink` set the same property at
    // the same specificity, so the winner depended on stylesheet order.
    const wrapper = mount(BaseButton, { props: { variant: 'destructive' } })

    expect(wrapper.classes()).not.toContain('hover:text-ink')
  })

  it('tints its own fill rather than borrowing the neutral one', () => {
    // A red glyph on a neutral grey wash reads as two different states.
    const wrapper = mount(BaseButton, { props: { variant: 'destructive' } })

    expect(wrapper.classes()).toContain('hover:bg-negative/10')
    expect(wrapper.classes()).not.toContain('hover:bg-muted')
    expect(wrapper.classes()).toContain('hover:text-negative')
  })
})

describe('a row that can be chosen', () => {
  it('fills rather than recolours when it is the selected one', () => {
    // A list says "this one" with a fill. Painting the row in the primary
    // colour instead makes one line of a list shout.
    const on = mount(BaseButton, { props: { variant: 'row', pressed: true } })
    const off = mount(BaseButton, { props: { variant: 'row', pressed: false } })

    expect(on.classes()).toContain('bg-muted')
    expect(on.classes()).toContain('justify-start')
    expect(on.attributes('aria-pressed')).toBe('true')

    expect(off.classes()).toContain('bg-transparent')
  })
})

describe('BaseCheckbox, neither on nor off', () => {
  /**
   * `indeterminate` is a DOM property and not an attribute: there is no
   * markup for it, so it cannot be set the way everything else in a
   * template is. That is why a "select all" box is the one control every
   * app writes by hand — the kit's own DataTable did, until this landed.
   */
  it('sets the property, which is the only way there is to set it', () => {
    const box = mount(BaseCheckbox, {
      props: { label: 'Hepsini seç', indeterminate: true },
    }).get('input').element as HTMLInputElement

    expect(box.indeterminate).toBe(true)
    // There is no attribute to look for, and asserting on one would pass
    // while the box looked unchecked to everybody.
    expect(box.hasAttribute('indeterminate')).toBe(false)
  })

  it('leaves the value alone: the mark is presentation, not a third state', () => {
    const wrapper = mount(BaseCheckbox, {
      props: { label: 'Hepsini seç', modelValue: false, indeterminate: true },
    })

    expect((wrapper.get('input').element as HTMLInputElement).checked).toBe(false)
  })

  it('drops the mark when it is told to', async () => {
    const wrapper = mount(BaseCheckbox, {
      props: { label: 'Hepsini seç', indeterminate: true },
    })

    await wrapper.setProps({ indeterminate: false })

    expect((wrapper.get('input').element as HTMLInputElement).indeterminate).toBe(false)
  })

  it('keeps its label as a name when it hides the words', () => {
    const wrapper = mount(BaseCheckbox, {
      props: { label: 'Hepsini seç', labelHidden: true },
    })

    // Hidden, not absent: dropping the words would leave the box named
    // nothing at all, which is what a raw box in a table header usually is.
    expect(wrapper.get('span').classes()).toContain('sr-only')
    expect(wrapper.get('span').text()).toBe('Hepsini seç')
  })

  it('shows its words by default', () => {
    const wrapper = mount(BaseCheckbox, { props: { label: 'Beni hatırla' } })

    expect(wrapper.get('span').classes()).not.toContain('sr-only')
  })
})

/**
 * Every field built on `FormField` can be linked to from `ErrorSummary`.
 *
 * `FormField` has taken a `fieldId` since 2.22.0 and the summary needs one
 * on both sides — "give each `FormField` a `fieldId` and hand the summary
 * the same function, or its links point at nothing" is what `AGENTS.md`
 * says. What it did not say is that only `FormField` and `PasswordInput`
 * accepted one, so a form built from `BaseInput` and `BaseSelect` could not
 * be summarised at all. The proof it was a gap rather than a preference is
 * in this repository: `showcase/examples/ErrorSummary.vue` hand-wrote its
 * `<input>` inside a bare `FormField`, in a file that imports the kit's
 * own field.
 */
describe('a field can be linked to from a summary', () => {
  const FIELDS = [
    ['BaseInput', BaseInput, {}],
    ['BaseTextarea', BaseTextarea, {}],
    ['BaseSelect', BaseSelect, { options: [{ value: 'a', label: 'A' }] }],
  ] as const

  it.each(FIELDS)('%s hands the chosen id to the control', (_name, component, extra) => {
    const wrapper = mount(component, {
      props: { label: 'Email', fieldId: 'signup-email', ...extra },
    })

    /* The id has to be on the control and the label has to point at the same
       one, or the summary's link lands on something that is not a field. */
    const control = wrapper.get('input, select, textarea')
    expect(control.attributes('id')).toBe('signup-email')
    expect(wrapper.get('label').attributes('for')).toBe('signup-email')
  })

  it('still generates one when no name is given', () => {
    const wrapper = mount(BaseInput, { props: { label: 'Email' } })
    const id = wrapper.get('input').attributes('id')

    expect(id).toBeTruthy()
    expect(wrapper.get('label').attributes('for')).toBe(id)
  })
})

/**
 * A field can be focused by the screen that owns it.
 *
 * A `ref` on a component gives the component, not the element, so until this
 * there was no way to focus one of these at all. A real consumer hit it and
 * wrote the whole field by hand rather than lose the ability — with the
 * reason in a comment above it: "the sheet focuses this input on open and
 * again after an error, and `BaseInput` exposes no way to reach it". That is
 * the gap test with its own explanation attached.
 *
 * `ErrorSummary` has exposed `focus` since it existed. This is the same need
 * from the other end: the summary moves focus *to* itself, and a sheet moves
 * focus *into* its first field.
 */
describe('focusing a field from outside it', () => {
  const FIELDS = [
    ['BaseInput', BaseInput, {}, 'input'],
    ['BaseTextarea', BaseTextarea, {}, 'textarea'],
    ['BaseSelect', BaseSelect, { options: [{ value: 'a', label: 'A' }] }, 'select'],
    ['PasswordInput', PasswordInput, { toggleLabel: 'Show' }, 'input'],
  ] as const

  it.each(FIELDS)('%s focuses its control, not its wrapper', (_name, component, extra, tag) => {
    const wrapper = mount(component, {
      props: { label: 'Amount', ...extra },
      attachTo: document.body,
    })

    ;(wrapper.vm as unknown as { focus: () => void }).focus()

    /* The control itself: focusing the field's outer div would look like it
       worked and leave the keyboard nowhere useful. */
    expect(document.activeElement).toBe(wrapper.get(tag).element)
    wrapper.unmount()
  })

  it('reaches the control inside a grouped field too', () => {
    /* The addon shape renders a different branch, and a ref bound on only
       one of them is the kind of miss that passes every other check. */
    const wrapper = mount(BaseInput, {
      props: { label: 'Weight' },
      slots: { suffix: '<span aria-hidden="true">kg</span>' },
      attachTo: document.body,
    })

    ;(wrapper.vm as unknown as { focus: () => void }).focus()

    expect(document.activeElement).toBe(wrapper.get('input').element)
    wrapper.unmount()
  })
})

/**
 * Painting the control you asked to have stripped.
 *
 * `class` lands on the field, which is right — it is where Vue puts a
 * component's class, and a layout class means "space this field". But it
 * left `variant="unstyled"` unable to reach the control it had just
 * stripped, which is the one thing somebody choosing `unstyled` is trying to
 * do. An app with a large amount field — 64px tall, because that field is
 * why its sheet exists — wrote the whole thing by hand for want of this, and
 * lost the label wiring and the material with it.
 */
describe('styling the control rather than the field', () => {
  const FIELDS = [
    ['BaseInput', BaseInput, {}, 'input'],
    ['BaseTextarea', BaseTextarea, {}, 'textarea'],
    ['BaseSelect', BaseSelect, { options: [{ value: 'a', label: 'A' }] }, 'select'],
    ['PasswordInput', PasswordInput, { toggleLabel: 'Show' }, 'input'],
  ] as const

  it.each(FIELDS)('%s puts controlClass on the control', (_name, component, extra, tag) => {
    const wrapper = mount(component, {
      props: { label: 'Amount', controlClass: 'h-16 text-3xl', ...extra },
    })

    expect(wrapper.get(tag).classes()).toContain('h-16')
    /* And not on the field, or it would resize the label's column instead of
       the thing being typed into. */
    expect(wrapper.classes()).not.toContain('h-16')
  })

  it('reaches the control that an addon moved into a wrapper', () => {
    const wrapper = mount(BaseInput, {
      props: { label: 'Weight', controlClass: 'text-right' },
      slots: { suffix: '<span aria-hidden="true">kg</span>' },
    })

    expect(wrapper.get('input').classes()).toContain('text-right')
  })

  it('is separate from the class that spaces the field', () => {
    /* Both at once, because the two answers are to two different questions
       and an app that needs one usually needs the other. */
    const wrapper = mount(BaseInput, {
      props: { label: 'Amount', controlClass: 'h-16' },
      attrs: { class: 'mt-4' },
    })

    expect(wrapper.classes()).toContain('mt-4')
    expect(wrapper.classes()).not.toContain('h-16')
    expect(wrapper.get('input').classes()).toContain('h-16')
    expect(wrapper.get('input').classes()).not.toContain('mt-4')
  })
})

describe('the 16px floor and who owns it', () => {
  /* iOS zooms the viewport when it focuses a field under 16px and never
     zooms back, which is why every control here carries `text-base`. It is a
     floor, but a utility cannot express one: `text-base` beats `text-3xl` in
     either order, measured in a real build. So a caller who takes the
     control's classes takes the floor too — and only then. */
  it('is stated for a plain unstyled field', () => {
    const wrapper = mount(BaseInput, { props: { label: 'Search', variant: 'unstyled' } })

    expect(wrapper.get('input').classes()).toContain('text-base')
  })

  it('steps aside when the caller paints the control', () => {
    const wrapper = mount(BaseInput, {
      props: { label: 'Amount', variant: 'unstyled', controlClass: 'control h-16 text-3xl' },
    })

    const classes = wrapper.get('input').classes()
    expect(classes).toContain('text-3xl')
    expect(classes).not.toContain('text-base')
  })

  it('still states it for a styled field, whatever else is passed', () => {
    /* The default variant keeps its own surface, so the floor is still the
       kit's to hold. */
    const wrapper = mount(BaseInput, { props: { label: 'Amount', controlClass: 'text-right' } })

    expect(wrapper.get('input').classes()).toContain('text-base')
  })
})
