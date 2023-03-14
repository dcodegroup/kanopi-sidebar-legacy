import {createApp} from 'vue'
import VueHtml2Canvas from "vue-html2canvas";
import KanopiSidebar from "./components/KanopiSidebar.vue";

// Vue.use(VueHtml2Canvas);

let kanopiSidebarApp = createApp({});
kanopiSidebarApp.component('kanopi-sidebar', KanopiSidebar)

kanopiSidebarApp.use(VueHtml2Canvas)
kanopiSidebarApp.mount('#kanopi-sidebar-container')
