import { VNode, defineComponent, PropType, Ref, h, ref, onMounted, watch } from "vue";
import { FreeLayoutService } from "@/service";
import { Widget } from "@/service/widget";
import DragContainer from "./DragContainer";
import { DragService } from "@/service/dragService";
import "../style.less";

export default defineComponent({
  components: { DragContainer },
  props: {
    widgets: {
      type: Array as PropType<Widget[]>,
      default: () => []
    },
    renderWidget: {
      type: Function as PropType<(widget: Widget) => VNode>,
      default: () => h("div", "请重写 renderWidget 方法")
    },
    dragService: {
      type: Object as PropType<DragService>
    },
    width: {
      type: Number
    },
    height: {
      type: Number
    },
    background: {
      type: String,
      default: "#ffffff"
    },
    disableDrag: {
      type: Boolean,
      default: false
    },
    disableResize: {
      type: Boolean,
      default: false
    },
    selectedArea: {
      type: Object as PropType<{
        disabled?: boolean;
        border?: string;
        background?: string;
      }>,
      default: () => ({
        disabled: false,
        border: "1px solid #ffffff",
        background: "rgba(255,255,255,0.3)"
      })
    }
  },
  emits: ["createWidget", "attached", "drag-start", "moving", "moved", "delete"],
  setup(props, { emit }) {
    const container: Ref<HTMLElement | null> = ref(null);

    const service = new FreeLayoutService(
      {
        width: props.width,
        height: props.height,
        disableDrag: props.disableDrag,
        disableResize: props.disableResize
      },
      container,
      emit,
      props.renderWidget,
      props.dragService
    );

    onMounted(() => {
      service.dragService && service.dragService.onMounted();
    });

    watch([() => props.width, () => props.height], ([width, height]) => {
      service.setSize(width, height);
    });

    function renderNewWidget() {
      if (!service.model.newWidget) return h("div");
      return h(DragContainer, {
        key: service.model.newWidget.id,
        widget: service.model.newWidget
      });
    }

    function renderWidgets() {
      return service.model.widgets.map((widget) =>
        h(DragContainer, {
          key: widget.id,
          widget
        })
      );
    }

    function renderSelectedArea() {
      return h("div", {
        style: {
          position: "absolute",
          left: `${service.model.selectedArea!.x}px`,
          top: `${service.model.selectedArea!.y}px`,
          width: `${service.model.selectedArea!.width}px`,
          height: `${service.model.selectedArea!.height}px`,
          border: props.selectedArea!.border,
          background: props.selectedArea!.background
        }
      });
    }

    return {
      service,
      container,
      renderNewWidget,
      renderWidgets,
      renderSelectedArea
    };
  },
  render() {
    return h(
      "div",
      {
        ref: "container",
        class: "free-layout",
        style: {
          left: this.service.model.pageRect.x + this.service.options.unit,
          top: this.service.model.pageRect.y + this.service.options.unit,
          width: this.service.model.pageRect.width + this.service.options.unit,
          height: this.service.model.pageRect.height + this.service.options.unit,
          background: this.$props.background
        },
        onmousedown: (e: any) => {
          if (e.target !== this.container || this.$props.selectedArea?.disabled) return;
          this.service.createSelectedArea();
        }
      },
      [
        this.$slots.widgetBefore && this.$slots.widgetBefore(),
        this.renderNewWidget(),
        this.renderWidgets(),
        this.$slots.widgetAfter && this.$slots.widgetAfter(),
        this.service.model.selectedArea && this.renderSelectedArea()
      ]
    );
  }
});
