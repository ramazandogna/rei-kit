import { describe, expect, it } from 'vitest'

import { highlight } from '../../showcase/highlight'

/**
 * The showcase colours its code itself, and renders the result as HTML.
 *
 * That is only safe while every piece of the input is escaped before it is
 * wrapped, so this is the file that says so. It is also the reason there is
 * no highlighter dependency: the samples are a handful of shapes, and the
 * colours come from the palette's roles instead of a theme of their own.
 */
describe('the showcase highlighter', () => {
  it('escapes everything it is given, markup included', () => {
    const out = highlight('<script>alert("x")</script>', 'vue')

    expect(out).not.toContain('<script>')
    expect(out).toContain('&lt;script')
    // The only tags in the output are its own spans.
    expect(out.replace(/<\/?span[^>]*>/g, '')).not.toMatch(/[<>](?!amp)/)
  })

  it('tells markup, strings and comments apart', () => {
    const out = highlight('<BaseButton variant="ghost" /> <!-- a note -->', 'vue')

    expect(out).toContain('<span class="tok-tag">&lt;BaseButton</span>')
    expect(out).toContain('<span class="tok-attr">variant</span>')
    expect(out).toContain('<span class="tok-string">"ghost"</span>')
    expect(out).toContain('<span class="tok-comment">&lt;!-- a note --&gt;</span>')
  })

  it('knows a property from a value in CSS, and a flag in a command', () => {
    expect(highlight('@import "rei-kit/mobile.css";', 'css')).toContain(
      '<span class="tok-keyword">@import</span>',
    )
    expect(highlight('--color-primary: #6b4de6;', 'css')).toContain(
      '<span class="tok-attr">--color-primary</span>',
    )
    expect(highlight('pnpm add -D tailwindcss', 'sh')).toContain(
      '<span class="tok-keyword">pnpm</span>',
    )
  })

  it('changes not one character of the code it colours', () => {
    /* The bug this pins: an unanchored rule matched a keyword further along
       the line, and the scanner cut that many characters off the front. The
       samples came out as "importimportfromfrom" with the markup gone. */
    const code = [
      '<script setup lang="ts">',
      "import { ref } from 'vue'",
      '',
      'const deleting = ref(false)',
      '</script>',
      '',
      '<template>',
      '  <BaseButton variant="danger" :loading="deleting">Sil</BaseButton>',
      '</template>',
    ].join('\n')

    const plain = highlight(code, 'vue')
      .replace(/<\/?span[^>]*>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')

    expect(plain).toBe(code)
  })
})
