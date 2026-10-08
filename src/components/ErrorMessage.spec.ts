import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorMessage from '@/components/ErrorMessage.vue'

describe('ErrorMessage', () => {
  it('renders the message and default title', () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        message: 'Could not load TV shows.',
      },
    })

    expect(wrapper.text()).toContain('Something went wrong')
    expect(wrapper.text()).toContain('Could not load TV shows.')
  })

  it('hides the retry button by default', () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        message: 'Network error',
      },
    })

    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('shows the retry button when showRetry is true', () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        message: 'Network error',
        showRetry: true,
      },
    })

    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.find('button').text()).toContain('Try again')
  })

  it('emits retry when the retry button is clicked', async () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        message: 'Network error',
        showRetry: true,
      },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('retry')).toBeTruthy()
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })
})
