<template>
  <div v-if="imageMarkupOpen" id="v-image-markup">
    <template v-if="bgImg">
      <div class="markup-container">
        <div ref="plansContainer" class="plans-container">
          <Editor
            ref="editor"
            :canvas-width="canvas.width"
            :canvas-height="canvas.height"
            editor-id="canvasId"
          />
        </div>
        <div class="side-bar tool-bar">
          <nav class="menu vertical">
            <button
              ref="drawBtn"
              :class="{ active: toolSelected === 'draw' }"
              @click="drawMode"
            >
              <draw-icon />
            </button>
            <button
              :class="{ active: toolSelected === 'text' }"
              @click="textMode"
            >
              <text-icon />
            </button>
            <button
              :class="{ active: toolSelected === 'rectangle' }"
              @click="rectangleMode"
            >
              <rectangle-icon />
            </button>
            <button
              :class="{ active: toolSelected === 'arrow' }"
              @click="arrowMode"
            >
              <arrow-icon />
            </button>
            <button
              :class="{ active: toolSelected === 'move' }"
              @click="moveMode"
            >
              <pointer-icon />
            </button>
            <button ref="clear" @click="clearMode">
              <trash-icon />
            </button>
            <div class="stroke">
              <span
                :style="{
                  borderBottomWidth: `${stroke}px`,
                  borderBottomColor: `${colourVal}`,
                }"
              />
            </div>
            <div class="colour-picker">
              <input
                v-model="colourVal"
                type="color"
                list="presetColours"
                @change="updateColour"
              />
              <datalist id="presetColours">
                <option v-for="colour in colourOptions" :key="colour">
                  {{ colour }}
                </option>
              </datalist>
            </div>
            <div class="stroke-size">
              <div class="btns">
                <button :disabled="stroke === 8" @click="increaseStroke">
                  <span>&plus;</span>
                </button>
                <button :disabled="stroke === 1" @click="decreaseStroke">
                  <span>&minus;</span>
                </button>
              </div>
            </div>
            <button class="save" @click="saveImg">
              <save-icon />
            </button>
            <button class="close" @click="cancelAnnotation">&Cross;</button>
          </nav>
        </div>
      </div>
    </template>
    <template v-else>
      <button>&Cross;</button>
      <p>There was an issue loading the screenshot.</p>
    </template>
  </div>
</template>

<script>
import Editor from "vue-image-markup";
import DrawIcon from "./svgs/Draw.vue";
import TextIcon from "./svgs/Text.vue";
import RectangleIcon from "./svgs/Rectangle.vue";
import ArrowIcon from "./svgs/Arrow.vue";
import SaveIcon from "./svgs/Save.vue";
import PointerIcon from "./svgs/Pointer.vue";
import TrashIcon from "./svgs/Trash.vue";

export default {
  components: {
    Editor: Editor,
    DrawIcon,
    TextIcon,
    SaveIcon,
    PointerIcon,
    TrashIcon,
    RectangleIcon,
    ArrowIcon,
  },
  props: {
    bgImg: {
      type: String,
      required: true,
    },
    imageMarkupOpen: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      canvas: {
        width: (90 * window.innerWidth) / 100,
        height: (90 * window.innerHeight) / 100,
      },
      selected: 0,
      toolSelected: null,
      colourVal: "#ff0000",
      colourOptions: [
        "#000000",
        "#ff0000",
        "#00ff00",
        "#0000ff",
        "#ffee00",
        "#ff8800",
      ],
      stroke: 2,
      saving: false,
      windowResizeTimeout: null,
    };
  },
  mounted() {
    this.clearMode();
  },
  methods: {
    increaseStroke() {
      this.stroke++;
      this.drawMode();
    },
    decreaseStroke() {
      this.stroke--;
      this.drawMode();
    },
    drawMode() {
      this.toolSelected = "draw";
      this.$refs.editor.set("freeDrawing", {
        stroke: this.colourVal,
        strokeWidth: this.stroke,
      });
      this.$refs.drawBtn.focus();
    },
    textMode() {
      this.toolSelected = "text";
      this.$refs.editor.set("text", { fill: this.colourVal });
    },
    rectangleMode() {
      this.toolSelected = "rectangle";
      this.$refs.editor.set("rect", {
        stroke: this.colourVal,
        strokeWidth: this.stroke,
      });
    },
    arrowMode() {
      this.toolSelected = "arrow";
      this.$refs.editor.set("arrow", {
        stroke: this.colourVal,
        strokeWidth: this.stroke,
      });
    },
    moveMode() {
      this.toolSelected = "move";
      this.$refs.editor.set("selectMode");
    },
    clearMode() {
      this.$refs.editor.clear();
      this.$refs.editor.setBackgroundImage(this.bgImg);
      this.drawMode();
    },
    updateColour(ev) {
      this.colourVal = ev.target.value;
      this.drawMode();
    },
    saveImg() {
      const encodedImg = { encodedImg: this.$refs.editor.saveImage() };
      // close the imageMarkup component and send the encodedImg
      this.$emit("annotateScreenshot", encodedImg);
      this.clearMode();
    },
    cancelAnnotation() {
      this.clearMode();
      this.$emit("cancelAnnotation");
    },
  },
};
</script>

<style scoped lang="scss">
@import "../../sass/kanopi-sidebar.scss";
// ToDo: Check styles are being applied
</style>
