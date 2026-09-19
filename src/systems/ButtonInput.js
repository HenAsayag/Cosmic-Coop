// Activate touch controls from their actual pointer gesture, even when a browser
// suppresses the later compatibility click after a canceled/multi-touch gesture.
let lastTouchGesture = -Infinity;
export function bindActivation(button, activate) {
  if (!button) return;
  let gesture = null;
  button.addEventListener("pointerdown", (event) => {
    if (button.disabled || !["touch", "pen"].includes(event.pointerType))
      return;
    gesture = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    };
  });
  button.addEventListener("pointermove", (event) => {
    if (gesture?.id !== event.pointerId) return;
    if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 12)
      gesture.moved = true;
  });
  button.addEventListener("pointercancel", () => {
    gesture = null;
  });
  button.addEventListener("pointerup", (event) => {
    if (gesture?.id !== event.pointerId) return;
    const tap =
      !gesture.moved &&
      Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) <= 12;
    gesture = null;
    lastTouchGesture = performance.now();
    if (!tap || button.disabled) return;
    event.preventDefault();
    activate(event);
  });
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
    // Mouse and keyboard activation retain their native click behavior.
    activate(event);
  });
}
