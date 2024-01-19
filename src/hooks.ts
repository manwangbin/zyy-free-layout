import { ref, Ref, onMounted, onBeforeUnmount } from "vue";
import { FreeLayoutService } from "./service";
import { PageRect } from "./types";

interface Options {
  // 宽度填充容器
  autoWidth?: boolean;
  // 宽度固定时水平居中
  horizontalCenter?: boolean;
  // 高度填充容器
  autoHeight?: boolean;
  // 高度固定时水平居中
  verticalCenter?: boolean;
  padding?: [number, number, number, number];
  onRegister?: (freeService: FreeLayoutService) => void;
  onUnRegister?: () => void;
  onResize?: (pageRect: PageRect) => void;
}

// 设置画板与父元素的位置大小关系
export function useFreeLayoutResize(options?: Options) {

  const containerRef: Ref<HTMLElement | null> = ref(null)
  const freeLayoutRef: Ref<{service: FreeLayoutService} | null> = ref(null);

  const getSizeHandler = () => {
    if (!containerRef.value || !freeLayoutRef.value) return;
    const [top, right, bottom, left] = options?.padding || [0, 0, 0, 0]

    const freeService = freeLayoutRef.value.service;
    const rect = containerRef.value.getBoundingClientRect()
    const pageRect = freeService.model.pageRect

    pageRect.x = left;
    pageRect.y = top;
    if (options?.autoWidth) {
      pageRect.width = rect.width - right - left;
    } else if (options?.horizontalCenter) {
      const surplus = rect.width - pageRect.width - left - right
      pageRect.x = surplus < 0 ? left : left + Math.floor(surplus / 2);
    }

    if (options?.autoHeight) {
      pageRect.height = rect.height - top - bottom;
    } else if (options?.verticalCenter) {
      const surplus = rect.height - pageRect.height - top - bottom
      pageRect.y = surplus < 0 ? top : top + Math.floor(surplus / 2);
    }
    options?.onResize && options.onResize(pageRect)
  };

  onMounted(() => {
    if (!containerRef.value || !freeLayoutRef.value) return;
    register(freeLayoutRef.value.service)
  });

  onBeforeUnmount(() => unRegister())

  function registerContainer(container: HTMLElement | null) {
    if (!container) {
      containerRef.value = container;
      unRegister()
      return;
    }
    if (!freeLayoutRef.value) {
      console.warn("[FreeLayout registerContainer] freeLayoutRef 不存在")
      return;
    }
    if (!containerRef.value) {
      containerRef.value = container;
      register(freeLayoutRef.value.service)
    }
  }

  function register(freeService: FreeLayoutService) {
    window.addEventListener("resize", getSizeHandler);
    getSizeHandler()
    options?.onRegister && options.onRegister(freeService)
  }

  function unRegister() {
    window.removeEventListener("resize", getSizeHandler);
    options?.onUnRegister && options.onUnRegister()
  }

  return {
    containerRef,
    freeLayoutRef,
    registerContainer,
    getSizeHandler
  }
}
