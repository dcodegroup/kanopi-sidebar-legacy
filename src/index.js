import Vue from "vue";
import KanopiSidebar from "./components/KanopiSidebar.vue";

new Vue({
  el: "#kanopi-sidebar-container",
  components: {
    "kanopi-sidebar": KanopiSidebar,
  },
});