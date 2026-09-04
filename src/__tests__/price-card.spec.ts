// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import PriceCard from '../components/PriceCard.vue'

const base = {
  name: 'Yıllık',
  price: '₺0',
  features: ['Bir', 'İki'] as const,
}

/**
 * A kit component that reaches for its consumer's translations is not shared,
 * it is one app's furniture parked somewhere else — so every string here
 * arrives as a prop, and this is what keeps it that way.
 */
describe('PriceCard', () => {
  it('renders only what it was given', () => {
    const wrapper = mount(PriceCard, { props: { ...base, lead: 'Açıklama', period: '/ yıl' } })

    expect(wrapper.text()).toContain('Yıllık')
    expect(wrapper.text()).toContain('₺0')
    expect(wrapper.text()).toContain('/ yıl')
    expect(wrapper.text()).toContain('Bir')
    expect(wrapper.text()).toContain('İki')
  })

  it('keeps the badge off a card that is not recommended', () => {
    // The badge is a comparison between cards, so a table where every column
    // claims it is the recommendation is a table with no recommendation.
    const plain = mount(PriceCard, { props: { ...base, badge: 'Önerilen' } })
    const picked = mount(PriceCard, { props: { ...base, badge: 'Önerilen', recommended: true } })

    expect(plain.text()).not.toContain('Önerilen')
    expect(picked.text()).toContain('Önerilen')
  })

  it('tints without shouting', () => {
    // Three tones so three columns can be told apart; not three hues, which
    // would read as three products from three companies.
    const warm = mount(PriceCard, { props: { ...base, tone: 'warm' } }).html()
    const cool = mount(PriceCard, { props: { ...base, tone: 'cool' } }).html()

    expect(warm).not.toBe(cool)
    expect(warm).toContain('b8862c')
    expect(cool).toContain('4a86a8')
  })

  it('leaves the action to the consumer', () => {
    // The kit has no idea whether this leads to a checkout, a sign-up or
    // nothing at all, and guessing would make it wrong in every app but one.
    const wrapper = mount(PriceCard, {
      props: base,
      slots: { action: '<button>Devam</button>' },
    })

    expect(wrapper.find('button').text()).toBe('Devam')
  })

  it('omits the parts it was not given', () => {
    const wrapper = mount(PriceCard, { props: base })

    expect(wrapper.find('article > div:last-child button').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('undefined')
  })
})
