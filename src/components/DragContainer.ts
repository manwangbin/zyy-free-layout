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
    },
    widgetClass: {
      type: Function as PropType<(widget: Widget) => string[]>
    },
    widgetStyle: {
      type: Function as PropType<(widget: Widget) => Record<string, keyof any>>
    }
  },

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
      if(props.widgetClass) {
        const classList = props.widgetClass(props.widget);
        className += " ";
        className += classList.join(" ");
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
    const style = this.$props.widgetStyle && this.$props.widgetStyle(this.$props.widget);

    return h(
      "div",
      {
        ref: (el) => (this.$props.widget.container = el as HTMLElement),
        class: this.containerClass,
        style: {
          transform: this.cssTransform(),
          width: `${this.$props.widget.width}px`,
          height: `${this.$props.widget.height}px`,
          zIndex: levels,
          ...style
        },
        onMousedown: (e) => {
          !this.$props.widget.customDragNode && this.$props.widget.startDrag(e)
        },
        onClick: (e) => this.service?.$emit("widgetClick", this.widget, e)
      },
      [this.service?.renderWidget && this.service.renderWidget(this.$props.widget)]
    );
  }
});

