import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },

  {
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // Configuración específica para archivos de Cypress
  {
    files: ['cypress/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        cy: 'readonly',
        Cypress: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        expect: 'readonly',
      },
    },
  },

  // Configuración específica para archivos de test
  {
    files: ['src/**/*.spec.js', 'src/**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
  },

  // Configuración para archivos de configuración
  {
    files: ['*.config.js', 'vite.config.js', 'cypress.config.js', 'lighthouserc.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        module: 'readonly',
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    rules: {
      // Permitir componentes de una sola palabra en Vue (común en proyectos pequeños)
      'vue/multi-word-component-names': 'off',
      // Hacer menos estrictos algunos warnings comunes
      'no-unused-vars': ['warn', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_'
      }],
      'vue/no-unused-vars': ['warn', { 
        'ignorePattern': '^_'
      }],
      // Permitir algunos errores comunes como warnings
      'no-undef': 'warn',
      'no-irregular-whitespace': 'warn',
      'no-case-declarations': 'warn',
      'no-dupe-else-if': 'warn',
      'vue/no-side-effects-in-computed-properties': 'warn',
      'vue/no-parsing-error': 'warn',
    },
  },
  skipFormatting,
]
