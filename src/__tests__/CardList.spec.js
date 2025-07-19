import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CardList from '../components/CardList.vue'

describe('CardList.vue', () => {
  const items = [
    { text: 'Item 1' },
    { text: 'Item 2' },
    { text: 'Item 3' }
  ]

  it('renderiza todos los items', () => {
    const wrapper = mount(CardList, {
      props: { items }
    })
    expect(wrapper.findAll('li').length).toBe(items.length)
  })

  it('emite el evento item-clicked con el item correcto', async () => {
    const wrapper = mount(CardList, {
      props: { items }
    })
    await wrapper.findAll('li')[1].trigger('click')
    expect(wrapper.emitted('item-clicked')).toBeTruthy()
    expect(wrapper.emitted('item-clicked')[0][0]).toEqual(items[1])
  })

  it('renderiza el contenido del slot', () => {
    const wrapper = mount(CardList, {
      props: { items },
      slots: {
        item: '<span class="custom">Custom Slot</span>'
      }
    })
    expect(wrapper.find('.custom').exists()).toBe(true)
  })
})