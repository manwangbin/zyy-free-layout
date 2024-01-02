import { FreeLayoutService } from "./service";
import { Widget } from "./service/widget";
import { WidgetState } from "./enums";

export interface WidgetOption {
  tag: string;
  width: number;
  height: number;
  dragOffset?: {
    x: number;
    y: number;
  };
  disableDrag?: boolean;
  disableResize?: boolean;
  customDragNode?: boolean;
  levels?: number;
  initState?: string;
}

export interface DesignWidget extends WidgetOption {
  id: string;
  x: number;
  y: number;
  state: WidgetState;
  moving?: boolean;
  resizing?: boolean;
}

export interface LayoutOptions {
  width?: number;
  height?: number;
  unit?: string;
  disableDrag?: boolean;
  disableResize?: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export interface PageRect extends Point {
  width: number;
  height: number;
}

export interface SelectArea extends PageRect {}

export interface MiddlewareParams {
  service: FreeLayoutService;
  widget: Widget;
  event: MouseEvent;
  startEvent: MouseEvent;
}
