export { default as FreeLayout } from "./components/FreeLayout";
export { default as DragContainer } from "./components/DragContainer"
export type {
  WidgetOption,
  DesignWidget,
  LayoutOptions,
  Point,
  PageRect,
  SelectArea,
  MiddlewareParams
} from "./types";

export { FreeLayoutService } from "./service/index";

export { Widget } from "./service/widget";

export { DragService } from "./service/dragService";

export { WidgetState } from "./enums";

export { onMouseMove } from "./utils"

export { useFreeLayoutResize } from "./hooks";
