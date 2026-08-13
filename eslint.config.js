import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

export default [
  // 1. Mengabaikan folder tertentu dari pemeriksaan linter
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**'],
  },

  // 2. Menggunakan konfigurasi dasar JavaScript yang direkomendasikan
  js.configs.recommended,

  // 3. Menggunakan konfigurasi rekomendasi untuk Vue 3 (Composition API)
  ...pluginVue.configs['flat/essential'], // Pilihan lain: 'flat/strongly-recommended' atau 'flat/recommended'

  // 4. Integrasi dengan Prettier agar tidak bentrok
  skipFormatting,

  // 5. Aturan kustom (Custom Rules) Anda sendiri
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'vue/multi-word-component-names': 'off', // Mematikan aturan nama komponen harus 2 kata
      'vue/no-unused-vars': 'warn',
    },
  },
];
