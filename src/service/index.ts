import { reactive, provide, inject, unref } from "vue";
import { DesignWidget, LayoutOptions, PageRect, Point, SelectArea, WidgetOption } from "@/types";
import { WidgetState } from "@/enums";
import { Widget } from "./widget";
import { v4 as uuidv4 } from "uuid";
import { VNode, InjectionKey, Ref } from "vue";
import { onMouseMove } from "@/utils";
import { DragService } from "./dragService";

export interface Model {
  pageRect: PageRect;
  newWidget: Widget | null;
  widgets: Widget[];
  selectedArea: SelectArea | null;
}

export class FreeLayoutService {
  static token = Symbol() as InjectionKey<FreeLayoutService>;

  static inject = () => inject(FreeLayoutService.token);

  dragService?: DragService;

  options: Required<LayoutOptions> = {
    width: 500,
    height: 300,
    unit: "px",
    disableDrag: false,
    disableResize: false
  };

  model: Model;

  constructor(
    options: LayoutOptions,
    public container: Ref<HTMLElement | null>,
    public $emit: (
      event: "createWidget" | "attached" | "drag-start" | "moving" | "moved" | "delete",
      ...args: any[]
    ) => void,
    public renderWidget?: (widget: Widget) => VNode,
    dragService?: DragService
  ) {
    provide(FreeLayoutService.token, this);
    this.setDragService(dragService)
    this.options = Object.assign(this.options, options);
    this.model = reactive({
      pageRect: {
        x: 0,
        y: 0,
        width: this.options.width,
        height: this.options.height,
      },
      newWidget: null,
      widgets: [],
      selectedArea: null
    });
  }

  setDragService(dragService?: DragService) {
    this.dragService = dragService
    this.dragService?.registerFreeService(this);
  }

  getRect() {
    return this.model.pageRect;
  }

  setPosition(x?: number, y?: number) {
    if (x !== undefined) {
      this.model.pageRect.x = x;
    }
    if (y !== undefined) {
      this.model.pageRect.y = y;
    }
  }

  setSize(width?: number, height?: number) {
    if (width !== undefined) {
      this.model.pageRect.width = width;
    }
    if (height !== undefined) {
      this.model.pageRect.height = height;
    }
  }

  createNewWidget(option: WidgetOption, startEvent: MouseEvent) {
    const id = uuidv4();
    const options: DesignWidget = {
      ...option,
      id,
      x: 0,
      y: 0,
      state: WidgetState.notAdded,
      moving: true
    };
    const widget = new Widget(options, this);
    onMouseMove(
      undefined,
      (event) => {
        const { x, y } = this.mousePToPageP(event.clientX, event.clientY);
        options.x = x - (options.dragOffset?.x || 0);
        options.y = y - (options.dragOffset?.y || 0);
        const result = this.dragService
          ? this.dragService.newWidgetMove(options, {
              service: this,
              widget: this.model.newWidget || widget,
              event,
              startEvent
            })
          : options;
        if (!result) return;
        if (!this.model.newWidget) {
          widget.setOptions(result);
          this.model.newWidget = widget;
          this.$emit("createWidget", this.model.newWidget);
        } else {
          this.model.newWidget.setOptions(result);
        }
      },
      (event) => {
        const options = this.model.newWidget!.toJson();
        options.state = WidgetState.normal;
        options.moving = false;
        const result = this.dragService
          ? this.dragService.newWidgetMoveEnd(options, {
              service: this,
              widget: this.model.newWidget!,
              event,
              startEvent
            })
          : options;
        this.deleteNewWidget();
        if (!result) return;
        this.addWidget(result);
        this.$emit("attached", widget);
      }
    );
  }

  deleteNewWidget() {
    this.model.newWidget = null;
  }

  addWidget(options: DesignWidget) {
    const widget = new Widget(options, this);
    if (this.options.disableDrag !== undefined) {
      widget.disableDrag = this.options.disableDrag;
    } else {
      widget.disableDrag = options.disableDrag;
    }
    if (this.options.disableResize !== undefined) {
      widget.disableResize = this.options.disableResize;
    } else {
      widget.disableResize = options.disableResize;
    }
    this.model.widgets.push(widget);
    return widget
  }

  getWidgets() {
    return this.model.widgets;
  }

  getWidget(id: string) {
    return this.model.widgets.find((widget) => widget.id === id);
  }

  deleteWidget(id: string) {
    const idx = this.model.widgets.findIndex((widget) => widget.id === id);
    if (idx > -1) {
      this.model.widgets.splice(idx, 1);
      this.$emit("delete", id);
    }
  }

  clearWidget() {
    this.model.widgets = [];
  }

  createSelectedArea() {
    // 清除选中区域
    this.model.selectedArea = null;
    // 清除选中的widget
    this.clearSelectedWidgets();
    const startPoint = {
      x: 0,
      y: 0
    };
    onMouseMove(
      (event: MouseEvent) => {
        const { x, y } = this.mousePToPageP(event.clientX, event.clientY);
        startPoint.x = x;
        startPoint.y = y;
      },
      (event: MouseEvent) => {
        const { x, y } = this.mousePToPageP(event.clientX, event.clientY);
        const width = Math.abs(x - startPoint.x);
        const height = Math.abs(y - startPoint.y);
        const areaPoint = { x: 0, y: 0 };
        if (startPoint.x < x) {
          areaPoint.x = startPoint.x;
        } else {
          areaPoint.x = x;
        }
        if (startPoint.y < y) {
          areaPoint.y = startPoint.y;
        } else {
          areaPoint.y = y;
        }
        if (!this.model.selectedArea) {
          this.model.selectedArea = {
            x: areaPoint.x,
            y: areaPoint.y,
            width,
            height
          };
        } else {
          this.model.selectedArea.x = areaPoint.x;
          this.model.selectedArea.y = areaPoint.y;
          this.model.selectedArea.width = width;
          this.model.selectedArea.height = height;
        }
        this.setSelectedWidgets(this.model.selectedArea);
      },
      () => {
        this.model.selectedArea = null;
      }
    );
  }

  setSelectedWidgets(selectedArea: SelectArea) {
    this.model.widgets.forEach((widget) => {
      const { x, y, width, height } = selectedArea;
      if (
        !(
          widget.x > x + width ||
          widget.x + widget.width < x ||
          widget.y > y + height ||
          widget.y + widget.height < y
        )
      ) {
        widget.state = WidgetState.selected;
      } else {
        widget.state = WidgetState.normal;
      }
    });
  }

  getSelectedWidgets() {
    return this.model.widgets.filter((widget) => widget.state === WidgetState.selected);
  }

  clearSelectedWidgets() {
    this.model.widgets.forEach((widget) => (widget.state = WidgetState.normal));
  }

  mousePToPageP(mouseX: number, mouseY: number): Point {
    const { x, y } = unref(this.container)?.getBoundingClientRect() || {
      x: this.model.pageRect.x,
      y: this.model.pageRect.y
    };
    return {
      x: mouseX - x,
      y: mouseY - y
    };
  }
}
