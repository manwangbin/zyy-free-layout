import {defineComponent, Ref, ref, h, computed, reactive, onMounted} from "vue";
import './style.less'
import {FreeLayout, FreeLayoutService, useFreeLayoutResize} from "@/index";

// import { FreeLayout } from "../dist/test-free-layout.esm";
// import { FreeLayoutService } from "../dist/index";
// import "../dist/test-free-layout.esm.css"

export default defineComponent({
  name: 'ExamplePanel',
  components: {
  },

  setup () {

    // const freeLayoutRef: Ref<{service: FreeLayoutService;} | null> = ref(null);

    const { containerRef, freeLayoutRef } = useFreeLayoutResize({
      // autoWidth: true,
      horizontalCenter: true,
      verticalCenter: true,
      onRegister: (freeService) => { },
      onUnRegister: () => { },
      // onResize: ({ width }) => service.dragService.resizeHandler(width)
    });

    const service = reactive({
      model: {
        template: null
      }
    })

    let freeLayoutService: FreeLayoutService | null = null

    const height = ref(800)

    const position = ref([841, 1189])

    const padding = ref([10, 10, 10, 10])


    onMounted(() => {
      console.log("freeLayoutRef", freeLayoutRef.value!.service)
      freeLayoutService = freeLayoutRef.value!.service
    })

    const createNewWidget = (e: any) => {
      freeLayoutService?.createNewWidget({
        tag: "string",
        width: 100,
        height: 100,
        dragOffset: {
          x: 50,
          y: 50,
        },
        customDragNode: true
      }, e)
    }

    return {
      containerRef,
      freeLayoutRef,
      height,
      position,
      padding,
      createNewWidget
    }
  },

  render () {
    return (
      <div ref="containerRef" style="width: 100vw;height: 100vh">
        <FreeLayout ref="freeLayoutRef" width={600} height={this.height}></FreeLayout>
        <button onClick={(e) => this.createNewWidget(e)}>createNewWidget</button>
      </div>
    )
  }
})
