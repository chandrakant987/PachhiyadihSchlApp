// src/configPlugin.js
export default {
    async install(app) {
      const res = await fetch('/config.json');
      const config = await res.json();
      app.provide('appConfig', config);
    }
  }
  