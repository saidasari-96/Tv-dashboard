<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { LOCALE_STORAGE_KEY, type AppLocale } from '@/i18n'

defineOptions({
  name: 'LanguageSwitcher',
})

const { locale, t } = useI18n()

const localeOptions: AppLocale[] = ['en', 'nl']

function onLocaleChange(event: Event) {
  const selectElement = event.target as HTMLSelectElement
  const nextLocale = selectElement.value

  if (nextLocale !== 'en' && nextLocale !== 'nl') {
    return
  }

  locale.value = nextLocale

  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
  } catch {
    // ignore quota / private mode errors
  }
}
</script>

<template>
  <label class="sr-only" for="language-switcher">{{ t('language') }}</label>
  <select
    id="language-switcher"
    class="h-10 shrink-0 rounded-xl border border-border bg-surface-elevated px-2.5 text-sm font-semibold text-ink shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
    :value="locale"
    :aria-label="t('language')"
    @change="onLocaleChange"
  >
    <option
      v-for="code in localeOptions"
      :key="code"
      :value="code"
    >
      {{ code.toUpperCase() }}
    </option>
  </select>
</template>
