import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import configPlugin from './configPlugin';
import configMixin from './configMixin';


const app = createApp(App);
app.use(createPinia());
app.use(router);
configPlugin.install(app).then(() => {
    app.mount('#app');
  });
app.mixin(configMixin);
