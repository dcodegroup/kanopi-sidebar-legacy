import Vue from "vue";
import VueHtml2Canvas from "vue-html2canvas";
import KanopiSidebar from "./components/KanopiSidebar.vue";

Vue.use(VueHtml2Canvas);

new Vue({
  el: "#kanopi-sidebar-container",
  components: {
    "kanopi-sidebar": KanopiSidebar,
  },
});