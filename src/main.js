import { createApp } from 'vue';
import { createPinia } from 'pinia'; // 1. Import Pinia

import App from './App.vue';
import router from './router'; // 2. Import Router yang kita buat

import './assets/css/style.css'; // (Opsional) Jika style.css sudah dibuat

const app = createApp(App);

app.use(createPinia()); // 3. Gunakan Pinia
app.use(router);        // 4. Gunakan Router

app.mount('#app');