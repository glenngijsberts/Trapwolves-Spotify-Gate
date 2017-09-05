import Vue from 'vue'
import App from './App.vue'
import router from './router.js'
import Welcome from './components/Welcome.vue'

new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App, Welcome }
})
