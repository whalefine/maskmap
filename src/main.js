// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
//origin
import App from './App';

//outside
import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import router from './router';
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

Vue.config.productionTip = false;
Vue.use(VueAxios, axios);
Vue.component('Loading',Loading);

new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
