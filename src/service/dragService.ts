import { DesignWidget, MiddlewareParams } from "@/types";
import { FreeLayoutService } from "./index";

export abstract class DragService {
  freeService: FreeLayoutService | null = null;

  registerFreeService(freeService: FreeLayoutService | null) {
    this.freeService = freeService;
  }

  onMounted() {}

  widgetMouseDown(
    _: MiddlewareParams
  ) {
    return true
  }

  abstract newWidgetMove(
    result: DesignWidget | null,
    params: MiddlewareParams
  ): DesignWidget | null;

  abstract newWidgetMoveEnd(
    result: DesignWidget | null,
    params: MiddlewareParams
  ): DesignWidget | null;

  abstract widgetMoveStart(
    result: DesignWidget | null,
    params: MiddlewareParams
  ): DesignWidget | null;

  abstract widgetMove(result: DesignWidget | null, params: MiddlewareParams): DesignWidget | null;

  abstract widgetMoveEnd(
    result: DesignWidget | null,
    params: MiddlewareParams
  ): DesignWidget | null;
}
