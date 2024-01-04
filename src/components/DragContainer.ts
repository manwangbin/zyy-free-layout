import { computed, defineComponent, h, PropType } from "vue";
import { Widget } from "@/service/widget";
import { WidgetState } from "@/enums";
import { FreeLayoutService } from "@/service";

export default defineComponent({
  name: "DragContainer",
  props: {
    widget: {
      type: Object as PropType<Widget>,
      required: true
    }
  },

  emits: ["drag-start", "drag-moving", "drag-end", "state-changed"],
  setup(props) {
    const service = FreeLayoutService.inject();
    const containerClass = computed(() => {
      let className = "drag_container";
      if (props.widget.state === WidgetState.selected) {
        className += " selected";
      }
      if (props.widget.moving) {
        className += " moving";
      }
      return className;
    });

    const cssTransform = () => {
      const panelPoint = { x: props.widget.x, y: props.widget.y };

      return `translate(${panelPoint.x}px,${panelPoint.y}px)`;
    };

    return {
      containerClass,
      cssTransform,
      service
    };
  },

  render() {
    const levels = this.$props.widget.moving ? 99999: this.$props.widget.levels;

    return h(
      "div",
      {
        ref: (el) => {this.$props.widget.container = el as HTMLElement},
        class: this.containerClass,
        style: {
          transform: this.cssTransform(),
          width: `${this.$props.widget.width}px`,
          height: `${this.$props.widget.height}px`,
          zIndex: levels
        },
        onMousedown: (e: MouseEvent ) => {
          !this.$props.widget.customDragNode && this.$props.widget.startDrag(e)
        }
      },
      [this.service?.renderWidget && this.service.renderWidget(this.$props.widget)]
    );
  }
});
