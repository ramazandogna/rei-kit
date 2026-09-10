import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { RouterLinkStub } from '@vue/test-utils'

import {
  BaseButton,
  BaseCheckbox,
  BaseInput,
  BaseRadioGroup,
  BaseSelect,
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

    expect(classes).toContain('transition-[transform,color,background-color,border-color]')
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
    expect(mount(BaseButton, { props: { variant: 'row' } }).classes()).not.toContain(
      'active:scale-95',
    )
    expect(mount(BaseButton).classes()).toContain('active:scale-95')
  })

  it('already had the chip, and nobody had noticed', () => {
    // `.chip-off` was `border-hair bg-surface text-ink hover:bg-muted` on a
    // `rounded-full px-3 py-1.5 text-xs` box. That is this, exactly.
    const chip = mount(BaseButton, { props: { variant: 'secondary', pill: true, size: 'xs' } })

    expect(chip.classes()).toContain('rounded-full')
    expect(chip.classes()).toContain('text-xs')
    expect(chip.classes().join(' ')).toContain('bg-surface')
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
