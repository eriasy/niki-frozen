import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { seedDatabaseIfEmpty, ensureDefaultRoles } from './db/LocalDb'

const app = createApp(App)
app.use(router)

seedDatabaseIfEmpty()
  .then(ensureDefaultRoles)
  .finally(() => {
    app.mount('#app')
  })