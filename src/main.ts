import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './style.css'
import { createPinia } from 'pinia'
import { initTheme } from './libs/theme'
const pinia = createPinia()

initTheme()

createApp(App)
  .use(router)
  .use(pinia)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
