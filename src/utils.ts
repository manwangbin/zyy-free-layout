export function onMouseMove(
  onMoveStart?: (event: MouseEvent) => void,
  onMove?: (event: MouseEvent) => void,
  onMoveEnd?: (event: MouseEvent) => void
) {
  let isFirst = true;
  let isMove = false;
  const moMouseMove = (event: MouseEvent) => {
    if (isFirst) {
      onMoveStart && onMoveStart(event);
      isFirst = false;
      isMove = true;
    }
    onMove && onMove(event);
  };
  const onMouseup = (event: MouseEvent) => {
    window.removeEventListener("mousemove", moMouseMove);
    window.removeEventListener("mouseup", onMouseup);
    isMove && onMoveEnd && onMoveEnd(event);
  };
  window.addEventListener("mousemove", moMouseMove);
  window.addEventListener("mouseup", onMouseup);
}
