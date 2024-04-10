import { FreeLayoutService } from "./service";
import { Widget } from "./service/widget";
import { WidgetState } from "./enums";

export interface WidgetOption<T = any> {
  id?: string;
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
  initState?: T;
}

export interface DesignWidget<T = any> extends WidgetOption<T> {
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

export interface MiddlewareParams<T = any> {
  service: FreeLayoutService;
  widget: Widget<T>;
  event: MouseEvent;
  startEvent: MouseEvent;
}
