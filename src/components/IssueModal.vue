<template>
  <div v-show="modalOpen" @click.self="closeModal">
    <article v-if="ticketType === null">
      <div>
        <header>
          <h3>Select a ticket type</h3>
        </header>
        <section class="ticket-types">
          <label v-for="(type, id) in ticketTypeOptions" :key="id">
            <input
                :value="type.id"
                name="ticketType"
                type="radio"
                @click="ticketType = type"
            />
            <span>
              <component :is="type.icon" />
              <h3 v-html="type.name" />
              <p v-html="type.subHeading" />
            </span>
          </label>
        </section>
      </div>
    </article>
    <article v-if="ticketType">
      <div>
        <header>
          <div>
            <component :is="ticketType.icon" />
            <h3>Send a {{ ticketType.name }} ticket</h3>
          </div>
          <button v-if="!loading" @click="resetModal">
            <chevron-circle-left />
            <span>back</span>
          </button>
          <span v-else class="spinner" />
        </header>
        <p v-html="ticketType.subHeading" />

      </div>
      <small v-show="selectClientProjectError" class="error"
      >Please select a project.</small
      >
      <div class="field">
        <input
            v-model="title"
            :placeholder="ticketType.title.placeholder"
        />
      </div>
      <div :class="{ error: descriptionError }" class="field">
        <textarea
            v-model="description"
            :placeholder="ticketType.textarea.placeholder"
            :rows="ticketType.textarea.rows"
            @focus="descriptionError = false"
        />
        <vueDropzone
            id="dz"
            ref="dz"
            :include-styling="false"
            :options="dzOptions"
            :use-custom-slot="true"
            @vdropzone-complete="afterComplete"
            @vdropzone-removed-file="fileRemoved"
        >
          <paperclip />
          <span v-show="!attachments.length">Add attachments here...</span>
        </vueDropzone>
      </div>
      <small v-show="descriptionError" class="error"
      >Please include a description.</small
      >
      <div
          v-if="ticketType.secondTextarea"
          :class="{ error: secondDescriptionError }"
          class="field"
      >
        <textarea
            v-model="secondDescription"
            :placeholder="ticketType.secondTextarea.placeholder"
            :rows="ticketType.secondTextarea.rows"
            @focus="secondDescriptionError = false"
        />
      </div>
      <small v-show="secondDescriptionError" class="error"
      >Please include details.</small
      >
      <div
          v-if="ticketType.thirdTextarea"
          :class="{ error: thirdDescriptionError }"
          class="field"
      >
        <textarea
            v-model="thirdDescription"
            :placeholder="ticketType.thirdTextarea.placeholder"
            :rows="ticketType.thirdTextarea.rows"
            @focus="thirdDescriptionError = false"
        />
      </div>
      <small v-show="thirdDescriptionError" class="error"
      >Please include details.</small
      >
      <section class="options">
        <div class="field">
          <select v-model="severity">
            <option disabled>-- Select Severity --</option>
            <option v-for="(severity, id) in severities" :key="id" :value="id">
              {{ severity | ucFirst }}
            </option>
          </select>
        </div>
<!--        <div class="field">-->
<!--          <select v-model="projects">-->
<!--            <option disabled>&#45;&#45; Select Ticket Status &#45;&#45;</option>-->
<!--            <option value="0">Backlog</option>-->
<!--          </select>-->
<!--        </div>-->

<!--        <div-->
<!--            v-if="!currentProject && clientProjects.length"-->
<!--            :class="{ error: selectClientProjectError }"-->
<!--            class="field"-->
<!--        >-->
<!--          <select-->
<!--              v-model="selectedClientProject"-->
<!--              @focus="selectClientProjectError = false"-->
<!--          >-->
<!--            <option disabled value="">&#45;&#45; Select Project &#45;&#45;</option>-->
<!--            <template-->
<!--                v-for="clientProject in clientProjects"-->
<!--                :key="clientProject.id"-->
<!--            >-->
<!--              <option :value="clientProject.id">-->
<!--                {{ clientProject.name }}-->
<!--              </option>-->
<!--            </template>-->
<!--          </select>-->
<!--        </div>-->
        <div class="field">
          <select v-model="selectedClientProject">
            <template v-for="item in clientProjects" :key="item.id">
              <option v-if="item.id === ''" disabled value="">
                {{ item.name }}
              </option>
              <option v-else :key="item.id" :value="item.id">
                {{ item.name }}
              </option>
            </template>
            <option disabled>-- Select Ticket Status --</option>
            <option value="0">Backlog test</option>
          </select>
        </div>
        <div class="field">
          <select v-model="assignedUser">
            <template v-for="(user, id) in availableUsers" :key="id">
              <option v-if="id === ''" disabled value="">
                {{ user }}
              </option>
              <option v-else :key="id" :value="id">
                {{ user | ucFirst }}
              </option>
            </template>
          </select>
        </div>
      </section>
      <div v-if="screenShot" class="alert">
        <aside>
          <camera />
          <small>Screenshot captured successfully</small>
        </aside>
        <nav>
          <button :disabled="loading" @click="$emit('addAnnotation')">
            <edit />
            <span>Add annotation</span>
          </button>
        </nav>
      </div>
      <div v-else-if="screenshotError" class="alert error">
        <span>⚠</span>
        <small v-html="screenshotError" />
      </div>
      <footer>
        <button :disabled="loading" type="button" @click="submit">
          <span>Send</span>
        </button>
        <button type="button" @click="closeModal">
          <span>Cancel</span>
        </button>
      </footer>
    </article>
  </div>
</template>

<script>
import paperclip from "./svgs/Paperclip.vue";
import camera from "./svgs/Camera.vue";
import edit from "./svgs/Edit.vue";
import featureIcon from "./svgs/FeatureIcon.vue";
import bugIcon from "./svgs/BugIcon.vue";
import childIcon from "./svgs/ChildIcon.vue";
import lightBulbIcon from "./svgs/LightBulbIcon.vue";
import chevronCircleLeft from "./svgs/ChevronCircleLeft.vue";
import vueDropzone from "vue2-dropzone";
import axios from "axios";

export default {
  name: "IssueModal",
  components: {
    vueDropzone,
    paperclip,
    camera,
    edit,
    featureIcon,
    bugIcon,
    childIcon,
    chevronCircleLeft,
    lightBulbIcon,
  },
  filters: {
    ucFirst(value) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
  },
  props: {
    modalOpen: {
      type: Boolean,
      required: true,
    },
    screenShot: {
      type: String,
      required: true,
    },
    ticketApiEndpoint: {
      type: String,
      required: true,
    },
    fileApiEndpoint: {
      type: String,
      required: true,
    },
    documentIcon: {
      type: String,
      required: true,
    },
    videoIcon: {
      type: String,
      required: true,
    },
    severities: {
      type: Object,
      required: true,
    },
    ticketTypes: {
      type: Array,
      required: true,
    },
    availableUsers: {
      type: Object,
      required: true,
    },
    screenshotError: {
      type: String,
      required: false,
      default: null,
    },
    clientProjects: {
      type: Array,
      required: true,
    },
    currentProject: {
      type: String,
    },
  },
  data() {
    return {
      title: null,
      description: null,
      descriptionError: false,
      secondDescription: null,
      secondDescriptionError: false,
      thirdDescription: null,
      thirdDescriptionError: false,
      selectedClientProject: "",
      selectClientProjectError: false,
      severity: Object.keys(this.severities)[0],
      ticketStatus: 0,
      ticketTypeOptions: null,
      ticketType: null,
      assignedUser: null,
      loading: false,
      dzOptions: {
        url: this.fileApiEndpoint,
        previewTemplate: this.template(),
        thumbnailWidth: 80,
        thumbnailHeight: 80,
        paramName: "uploadFile",
        withCredentials: true,
        headers: {
          "X-CSRF-TOKEN": window._kpi.csrf,
        },
      },
      attachments: [],
      attachmentsFileIds: [],
    };
  },
  created() {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal();
        this.$emit("closeModal");
      }
    });
    this.assignedUser = "";
    this.ticketTypeOptions = this.ticketTypes.map((type) => {
      switch (type.name) {
        case "Feature":
          return {
            ...type,
            icon: "featureIcon",
            subHeading: "Feature - a new feature or function",
            title: {
              placeholder: "Please enter ticket title",
            },
            textarea: {
              placeholder: "Please describe the feature you require.",
              rows: 10,
            },
          };
        case "Bug":
          return {
            ...type,
            icon: "bugIcon",
            subHeading: "Bug - report an issue or problem with this software",
            title: {
              placeholder: "Please enter ticket title",
            },
            textarea: {
              placeholder: "Please describe the issue you are experiencing.",
              rows: 4,
            },
            secondTextarea: {
              placeholder: "Include the steps to reproduce the bug.",
              rows: 3,
            },
            thirdTextarea: {
              placeholder: "Provide details of the desired outcome.",
              rows: 3,
            },
          };
        case "Customer Request":
          return {
            ...type,
            icon: "childIcon",
            subHeading:
                "Customer Request - ask for assistance, an export, or help",
            title: {
              placeholder: "Please enter ticket title",
            },
            textarea: {
              placeholder: "Please describe the request.",
              rows: 10,
            },
          };
        case "Opportunity":
          return {
            ...type,
            icon: "lightBulbIcon",
            subHeading:
                "Opportunity - record an idea or opportunity to consider",
            title: {
              placeholder: "Please enter ticket title",
            },
            textarea: {
              placeholder:
                  "Please describe the opportunity you are requesting.",
              rows: 10,
            },
          };

        default:
          return {};
      }
    });
  },

  methods: {
    template() {
      return `<div class="dz-preview dz-file-preview">
                <div class="dz-details">
                  <div class="dz-filename"><span data-dz-name></span></div>
                  <a href="#" data-dz-remove><span class="dicon-delete"></span></a>
                </div>
                <div class="dz-error-message"><span data-dz-errormessage></span></div>
              </div>`;
    },
    afterComplete(file) {
      const response = JSON.parse(file.xhr.response);
      this.attachments.push(response);
      this.attachmentsFileIds.push(response.file.id);
      if (response.file.mime_type.startsWith("video")) {
        file.previewElement.querySelector("img").src = this.videoIcon;
      }
      if (
          response.file.mime_type.startsWith("application") ||
          response.file.mime_type.startsWith("text")
      ) {
        file.previewElement.querySelector("img").src = this.documentIcon;
      }
    },
    fileRemoved(file) {
      const response = JSON.parse(file.xhr.response);
      axios
          .delete(response.removeFileUrl, {
            headers: {
              "X-CSRF-TOKEN": window._kpi.csrf,
            },
          })
          .then(({ data }) => {
            this.$delete(
                this.attachments,
                this.attachments.findIndex((a) => {
                  return a.file.id === data.file.id;
                })
            );
            this.$delete(
                this.attachmentsFileIds,
                this.attachmentsFileIds.findIndex((a) => {
                  return a === data.file.id;
                })
            );
          })
          .catch((error) => {
            console.error(error);
          });
    },
    submit() {
      if (!this.currentProject && !this.selectedClientProject) {
        return (this.selectClientProjectError = true);
      } else if (this.description === null) {
        return (this.descriptionError = true);
      } else if (
          this.ticketType.secondTextarea &&
          this.secondDescription === null
      ) {
        return (this.secondDescriptionError = true);
      } else if (
          this.ticketType.thirdTextarea &&
          this.thirdDescription === null
      ) {
        return (this.thirdDescriptionError = true);
      }

      this.loading = true;
      let descriptionContent = `<b>${this.ticketType.textarea.placeholder}</b> \n ${this.description}`;
      descriptionContent += this.ticketType.secondTextarea
          ? `\n\n <b>${this.ticketType.secondTextarea.placeholder}</b> \n ${this.secondDescription}`
          : "";
      descriptionContent += this.ticketType.thirdTextarea
          ? `\n\n <b>${this.ticketType.thirdTextarea.placeholder}</b> \n ${this.thirdDescription}`
          : "";

      this.$refs.dz.disable();
      const data = {
        ticketName: this.title ? this.title : this.thirdDescription
            ? this.thirdDescription
            : this.description,
        description: descriptionContent,
        severity: this.severity,
        ticketType: this.ticketType.id,
        ticketStatus: this.ticketStatus,
        assignedUser: this.assignedUser,
        url: window.location.href,
        attachments: this.attachmentsFileIds,
        _token: window._kpi.csrf,
        client: window._kpi.client,
        // project: window._kpi.project || this.selectedClientProject,
        project: this.selectedClientProject || window._kpi.project,
        environment: window._kpi.environment,
      };
      if (this.screenShot) {
        data.screenshot = this.screenShot;
      }
      const axiosConfig = {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": window._kpi.csrf,
        },
        withCredentials: true,
      };
      axios.post(this.ticketApiEndpoint, data, axiosConfig).then((res) => {
        this.loading = false;
        this.$refs.dz.enable();
        this.closeModal();
      });
    },
    closeModal() {
      this.resetModal();
      this.$emit("closeModal");
    },
    resetModal() {
      this.ticketType = null;
      this.title = null;
      this.descriptionError = false;
      this.description = null;
      this.secondDescriptionError = false;
      this.secondDescription = null;
      this.thirdDescriptionError = false;
      this.thirdDescription = null;
      this.selectedClientProject = "";
      this.selectClientProjectError = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../sass/kanopi-sidebar.scss";
</style>
