// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: {
      semi: false,
      quotes: 'single',
      indent: 2,
    },
  },
})
  .append(
    {
      rules: {
        'vue/multi-word-component-names': 'off',
        'vue/no-v-html': 'warn',
        '@typescript-eslint/no-explicit-any': 'warn',
        'no-console': ['warn', { allow: ['warn', 'error'] }],
      },
    },
  )
