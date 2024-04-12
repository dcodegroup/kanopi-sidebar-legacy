<template>
  <aside id="kanopi-sidebar" :class="position">
    <div data-html2canvas-ignore>
      <button
        :class="{ loading: loadingScreenshot }"
        type="button"
        @click="handleClick"
      >
        <kanopi-logo/>
      </button>
      <issueModal
        v-if="modalOpen"
        :available-users="availableUsers"
        :client-projects="clientProjects"
        :current-project="project"
        :document-icon="documentIcon"
        :file-api-endpoint="routes.upload_file"
        :modal-open="modalOpen"
        :screen-shot="screenshot"
        :screenshot-error="screenshotError"
        :severities="severities"
        :ticket-api-endpoint="routes.create_ticket"
        :ticket-types="ticketTypes"
        :video-icon="videoIcon"
        @addAnnotation="handleAddAnnotation"
        @closeModal="closeModal"
      />
      <vImageMarkup
        v-if="imageMarkupOpen"
        :bg-img="screenshot"
        :image-markup-open="imageMarkupOpen"
        @annotateScreenshot="handleAnnotateScreenshot"
        @cancelAnnotation="handleCancelAnnotation"
      />
    </div>
  </aside>
</template>
<script>
import kanopiLogo from "./svgs/KanopiLogo.vue";
import issueModal from "./IssueModal.vue";
import vImageMarkup from "../components/VImageMarkup.vue";

export default {
  name: "KanopiSidebar",
  components: {
    kanopiLogo,
    issueModal,
    vImageMarkup,
  },
  data() {
    return {
      screenshot: null,
      screenshotError: null,
      loadingScreenshot: false,
      modalOpen: false,
      imageMarkupOpen: false,
      client: window._kpi.client,
      project: window._kpi.project,
      position: window._kpi.position,
      environment: window._kpi.environment,
      routes: window._kpi.routes,
      csrfToken: window._kpi.csrf,
      documentIcon: window._kpi.documentIcon,
      videoIcon: window._kpi.videoIcon,
      severities: window._kpi.severities,
      ticketTypes: window._kpi.ticketTypes,
      availableUsers: window._kpi.availableUsers,
      clientProjects: window._kpi.clientProjects,
    };
  },
  methods: {
    handleAddAnnotation() {
      if (this.screenshot) {
        this.imageMarkupOpen = true;
      }
    },
    handleCancelAnnotation() {
      this.imageMarkupOpen = false;
    },
    handleAnnotateScreenshot(payload) {
      this.imageMarkupOpen = false;
      this.screenshot = payload.encodedImg;
    },
    handleClick() {
      if (this.loadingScreenshot) {
        return;
      }

      this.loadingScreenshot = true;
      document.querySelector("body").classList.add("kanopi-screenshot");
      setTimeout(() => this.captureScreen(), 1500);
    },
    async captureScreen() {
      const options = {
        useCors: true,
        proxy: "https://widget.kanopi.live/html2canvasproxy.php",
        logging: true,
        letterRendering: 1,
        type: "dataURL",
        height: window.innerHeight,
        width: window.innerWidth,
        imageTimeout: 15000,
        y: window.pageYOffset,
        ignoreElements: (el) => {
          return !!(
            (el.nodeName.toLowerCase() === "link" &&
              el.getAttribute("href") &&
              el.getAttribute("href").indexOf("kanopi-sidebar.css") !== -1) ||
            (el.nodeName.toLowerCase() === "iframe" &&
              el.getAttribute("src") &&
              el.getAttribute("src").indexOf("https://js.stripe.com/") !== -1)
          );
        },
      };
      try {
        this.screenshot = await this.$html2canvas(
          document.querySelector("body"),
          options
        );
      } catch (err) {
        console.log(err);
        this.screenshot = "";
        this.screenshotError =
          "An issue occured while capturing the screenshot.";
      }
      this.loadingScreenshot = false;
      this.modalOpen = true;
    },
    closeModal() {
      document.querySelector("body").classList.remove("kanopi-screenshot");
      this.handleCancelAnnotation();
      this.modalOpen = false;
      this.screenshot = null;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../sass/kanopi-sidebar.scss";
</style>
