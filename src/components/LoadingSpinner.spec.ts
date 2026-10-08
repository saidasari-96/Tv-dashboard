import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  it('renders the default loading message', () => {
    const wrapper = mount(LoadingSpinner)

    expect(wrapper.text()).toContain('Loading...')
  })

  it('renders a custom message when provided', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        message: 'Loading shows...',
      },
    })

    expect(wrapper.text()).toContain('Loading shows...')
  })
})
