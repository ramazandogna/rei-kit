import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { readFileSync, readdirSync } from 'node:fs'
import { nextTick } from 'vue'

import { TourShell } from '../app/index'
import { BaseSheet } from '../index'
import { BaseModal } from '../web/index'

/**
 * Where keyboard focus can go, and whether anyone can see it get there.
 *
 * Both halves were found by reading, not by a failing test: a control whose
 * focus ring was never drawn, and two layers that trapped focus by taking
 * `#app` out of reach — the id Vite's template happens to use, not one the
 * kit can count on.
 */

const tourProps = {
  index: 0,
  total: 2,
  dialogLabel: 'Tanıtım',
  skipLabel: 'Geç',
  backLabel: 'Geri',
  nextLabel: 'İleri',
  lastLabel: 'Başla',
  stepLabel: (n: number) => `${n}. adım`,
}

/** An app mounted where Vite does not put it. */
function mountPoint(id = 'root') {
  const root = document.createElement('div')
  root.id = id
  document.body.append(root)

  return root
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('layers that trap focus', () => {
  it('takes the page out of reach whatever the app is mounted on', async () => {
    const root = mountPoint()
    const sheet = mount(BaseSheet, {
      props: { modelValue: false, title: 'Yeni kayıt', closeLabel: 'Kapat' },
      attachTo: root,
    })

    await sheet.setProps({ modelValue: true })
    await nextTick()

    expect(root.hasAttribute('inert')).toBe(true)
    expect(document.getElementById('sheet-root')?.hasAttribute('inert')).toBe(false)

    await sheet.setProps({ modelValue: false })
    expect(root.hasAttribute('inert')).toBe(false)

    sheet.unmount()
  })

  it('gives focus back to what opened it', async () => {
    const root = mountPoint()
    const trigger = document.createElement('button')
    root.append(trigger)
    trigger.focus()

    const sheet = mount(BaseSheet, {
      props: { modelValue: false, title: 'Yeni kayıt', closeLabel: 'Kapat' },
      attachTo: root,
    })
    await sheet.setProps({ modelValue: true })
    await nextTick()
    await sheet.setProps({ modelValue: false })

    expect(document.activeElement).toBe(trigger)
    sheet.unmount()
  })

  it('keeps the page held while an outer layer is still open', async () => {
    const root = mountPoint()
    const outer = mount(BaseSheet, {
      props: { modelValue: false, title: 'Dış', closeLabel: 'Kapat' },
      attachTo: root,
    })
    const inner = mount(BaseSheet, {
      props: { modelValue: false, title: 'İç', closeLabel: 'Kapat' },
      attachTo: root,
    })

    await outer.setProps({ modelValue: true })
    await inner.setProps({ modelValue: true })
    await inner.setProps({ modelValue: false })
    expect(root.hasAttribute('inert')).toBe(true)

    await outer.setProps({ modelValue: false })
    expect(root.hasAttribute('inert')).toBe(false)

    outer.unmount()
    inner.unmount()
  })

  it('never releases what the app made inert itself', async () => {
    const root = mountPoint()
    const aside = mountPoint('aside')
    aside.setAttribute('inert', '')

    const sheet = mount(BaseSheet, {
      props: { modelValue: false, title: 'Yeni kayıt', closeLabel: 'Kapat' },
      attachTo: root,
    })
    await sheet.setProps({ modelValue: true })
    await sheet.setProps({ modelValue: false })

    expect(aside.hasAttribute('inert')).toBe(true)
    sheet.unmount()
  })

  it('holds the page behind a modal the same way', async () => {
    const root = mountPoint()
    const modal = mount(BaseModal, {
      props: { modelValue: false, title: 'Sil', closeLabel: 'Kapat' },
      attachTo: root,
    })

    await modal.setProps({ modelValue: true })
    await nextTick()
    expect(root.hasAttribute('inert')).toBe(true)

    await modal.setProps({ modelValue: false })
    expect(root.hasAttribute('inert')).toBe(false)
    modal.unmount()
  })

  it('holds the page behind the guide the same way', async () => {
    const root = mountPoint()
    const tour = mount(TourShell, { props: { ...tourProps, modelValue: true }, attachTo: root })
    await nextTick()
    await nextTick()

    expect(root.hasAttribute('inert')).toBe(true)

    tour.unmount()
    expect(root.hasAttribute('inert')).toBe(false)
  })
})

describe('focus you can see', () => {
  const files = ['components', 'web', 'app', 'pwa'].flatMap((dir) =>
    readdirSync(`src/${dir}`)
      .filter((name) => name.endsWith('.vue'))
      .map((name) => ({
        name: `${dir}/${name}`,
        source: readFileSync(`src/${dir}/${name}`, 'utf8'),
      })),
  )

  /** The markup alone — an example in a doc comment is not a control. */
  const template = (source: string) => {
    const start = source.indexOf('\n<template')
    const end = source.indexOf('\n<style')

    return source.slice(start, end === -1 ? undefined : end)
  }

  /* A raw control is one the kit draws itself rather than through
     `BaseButton`, which carries its own ring. */
  const RAW_CONTROL = /<(button|a|RouterLink|input|select|textarea)[\s>]/

  it('draws a ring on every control the kit renders by hand', () => {
    const bare = files
      .filter(({ source }) => RAW_CONTROL.test(template(source)))
      .filter(({ source }) => !/focus-visible|focus-ring/.test(source))
      .map(({ name }) => name)

    expect(bare).toEqual([])
  })

  it('passes a hidden input’s focus on to what is visible', () => {
    // An `sr-only` input takes focus and shows nothing. Its visible stand-in
    // has to be told, or Tab moves through the control invisibly.
    const silent = files
      .filter(({ source }) => /<input[^>]*sr-only/.test(source))
      .filter(
        ({ source }) => !/peer-focus-visible|has-focus-visible|has-\[:focus-visible\]/.test(source),
      )
      .map(({ name }) => name)

    expect(silent).toEqual([])
  })
})
