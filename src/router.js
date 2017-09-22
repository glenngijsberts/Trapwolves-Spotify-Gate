import Vue from 'vue'
import Router from 'vue-router'
import Welcome from './components/Welcome.vue'
import Callback from './components/Callback.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Welcome',
      component: Welcome
    },
    {
      path: '/callback',
      name: 'Callback',
      component: Callback
    }
  ]
})
