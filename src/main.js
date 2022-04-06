// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
//origin
import App from "./App";

//outside
import Vue from "vue";
import axios from "axios";
import VueAxios from "vue-axios";
import router from "./router";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";
import "leaflet/dist/leaflet.css";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});
Vue.config.productionTip = false;
Vue.use(VueAxios, axios);
Vue.component("Loading", Loading);

new Vue({
  el: "#app",
  router,
  components: { App },
  template: "<App/>"
});
