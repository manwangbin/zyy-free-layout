import { DesignWidget } from "@/types";
import { WidgetState } from "@/enums";
import { FreeLayoutService } from "./index";
import { onMouseMove } from "@/utils";

export class Widget implements DesignWidget {
  container: HTMLElement | null = null;

  id: string;

  tag: string;

  x: number;

  y: number;

  width: number;

  height: number;

  state: WidgetState;

  disableDrag?: boolean;

  disableResize?: boolean;

  moving?: boolean;

  resizing?: boolean;

  customDragNode?: boolean;

  levels: number = 0

  initState: string = "{}";

  dragOffset = {
    x: 0,
    y: 0
  };

  constructor(options: DesignWidget, public service: FreeLayoutService) {
    this.id = options.id;
    this.tag = options.tag;
    this.x = Math.floor(options.x);
    this.y = Math.floor(options.y);
    this.width = Math.floor(options.width);
    this.height = Math.floor(options.height);
    this.state = options.state;
    this.disableDrag = options.disableDrag;
    this.disableResize = options.disableResize;
    this.moving = options.moving;
    this.resizing = options.resizing;
    this.customDragNode = options.customDragNode;
    options.levels !== undefined && (this.levels = options.levels);
    options.dragOffset && (this.dragOffset = options.dragOffset);
    options.initState && (this.initState = options.initState);
  }

  setOptions(options: DesignWidget) {
    Object.assign(this, {
      ...options,
      x: Math.floor(options.x),
      y: Math.floor(options.y),
      width: Math.floor(options.width),
      height: Math.floor(options.height)
    })
  }

  setPosition(x: number, y: number) {
    this.x = Math.floor(x);
    this.y = Math.floor(y);
  }

  setSize(width: number, height: number) {
    this.width = Math.floor(width);
    this.height = Math.floor(height);
  }

  toJson(): DesignWidget {
    return {
      id: this.id,
      tag: this.tag,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      state: this.state,
      disableDrag: this.disableDrag,
      disableResize: this.disableResize,
      moving: this.moving,
      resizing: this.resizing,
      dragOffset: this.dragOffset,
      levels: this.levels,
      customDragNode: this.customDragNode,
      initState: this.initState
    };
  }

  startDrag(startEvent: MouseEvent) {
    if (this.disableDrag) return;
    const res = !this.service.dragService || this.service.dragService.widgetMouseDown({
      service: this.service,
      widget: this,
      event: startEvent,
      startEvent
    })
    if(!res) return;
    onMouseMove(
      () => {
        const { x, y } = this.service.mousePToPageP(startEvent.clientX, startEvent.clientY);
        // 设置拖动的偏移量
        this.dragOffset.x = x - this.x;
        this.dragOffset.y = y - this.y;
        this.moving = true;
        this.service.dragService &&
          this.service.dragService.widgetMoveStart(this.toJson(), {
            service: this.service,
            widget: this,
            event: startEvent,
            startEvent
          });
        this.service.$emit("drag-start", this);
      },
      (event: MouseEvent) => {
        const { x, y } = this.service.mousePToPageP(event.clientX, event.clientY);
        const option = this.toJson();
        option.x = x - this.dragOffset.x;
        option.y = y - this.dragOffset.y;
        const result = this.service.dragService
          ? this.service.dragService.widgetMove(option, {
              service: this.service,
              widget: this,
              event,
              startEvent
            })
          : option;
        if (!result) return;
        this.setOptions(result)
        this.service.$emit("moving", this);
      },
      (event: MouseEvent) => {
        const { x, y } = this.service.mousePToPageP(event.clientX, event.clientY);
        const option = this.toJson();
        option.x = x - this.dragOffset.x;
        option.y = y - this.dragOffset.y;
        option.moving = false;
        const result = this.service.dragService
          ? this.service.dragService.widgetMoveEnd(option, {
              service: this.service,
              widget: this,
              event,
              startEvent
            })
          : option;
        if (!result) return;
        this.setOptions(result)
        this.service.$emit("moved", this);
      }
    );
  }
}
