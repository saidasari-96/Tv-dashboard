import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { LOCALE_STORAGE_KEY, messages } from '@/i18n'

function createTestI18n(locale: 'en' | 'nl' = 'en') {
  return createI18n({
    legacy: false,
    globalInjection: true,
    locale,
    fallbackLocale: 'en',
    messages,
  })
}

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('renders EN and NL options', () => {
    const wrapper = mount(LanguageSwitcher, {
      global: {
        plugins: [createTestI18n('en')],
      },
    })

    const optionValues = wrapper.findAll('option').map((option) => option.attributes('value'))
    expect(optionValues).toEqual(['en', 'nl'])
  })

  it('updates the locale and persists the choice', async () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(LanguageSwitcher, {
      global: {
        plugins: [i18n],
      },
    })

    const select = wrapper.get('select')
    await select.setValue('nl')

    expect(i18n.global.locale.value).toBe('nl')
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('nl')
  })
})
