// Some fullscreen mobile browsers deliver TouchEvents without matching PointerEvents
// or compatibility clicks. Accept either gesture stream, once per physical tap.
let lastTouchGesture = -Infinity;
export function bindActivation(button, activate) {
  if (!button) return;
  let pointer = null,
    touch = null,
    handled = false;
  const moved = (gesture, x, y) =>
    Math.hypot(x - gesture.x, y - gesture.y) > 12;
  const finish = (event, gesture, x, y) => {
    lastTouchGesture = performance.now();
    if (handled) return;
    handled = true;
    if (button.disabled || gesture.moved || moved(gesture, x, y)) return;
    if (event.cancelable) event.preventDefault();
    activate(event);
  };
  button.addEventListener("pointerdown", (event) => {
    if (button.disabled || !["touch", "pen"].includes(event.pointerType))
      return;
    handled = false;
    pointer = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    };
  });
  button.addEventListener("pointermove", (event) => {
    if (
      pointer?.id === event.pointerId &&
      moved(pointer, event.clientX, event.clientY)
    )
      pointer.moved = true;
  });
  button.addEventListener("pointercancel", () => {
    pointer = null;
  });
  button.addEventListener("pointerup", (event) => {
    if (pointer?.id !== event.pointerId) return;
    const gesture = pointer;
    pointer = null;
    finish(event, gesture, event.clientX, event.clientY);
  });
  button.addEventListener(
    "touchstart",
    (event) => {
      if (button.disabled || touch || event.touches.length !== 1) return;
      const point = event.changedTouches[0];
      handled = false;
      touch = {
        id: point.identifier,
        x: point.clientX,
        y: point.clientY,
        moved: false,
      };
    },
    { passive: true },
  );
  button.addEventListener(
    "touchmove",
    (event) => {
      if (!touch) return;
      for (const point of event.changedTouches) {
        if (
          point.identifier === touch.id &&
          moved(touch, point.clientX, point.clientY)
        )
          touch.moved = true;
      }
    },
    { passive: true },
  );
  button.addEventListener("touchcancel", () => {
    touch = pointer = null;
    handled = true;
    lastTouchGesture = performance.now();
  });
  button.addEventListener(
    "touchend",
    (event) => {
      if (!touch) return;
      for (const point of event.changedTouches) {
        if (point.identifier !== touch.id) continue;
        const gesture = touch;
        touch = null;
        finish(event, gesture, point.clientX, point.clientY);
        break;
      }
    },
    { passive: false },
  );
  button.addEventListener("click", (event) => {
    if (button.disabled) return;
    const touchClick =
      event.pointerType === "touch" ||
      event.pointerType === "pen" ||
      event.sourceCapabilities?.firesTouchEvents ||
      (!event.pointerType && event.detail > 0);
    if (touchClick && performance.now() - lastTouchGesture < 700) {
      event.preventDefault();
      return;
    }
    activate(event);
  });
}
