/**
 * Global keyboard navigation utilities:
 * - initGlobalRovingFocus: enables arrow key navigation between items in any container that has data-kb-nav
 * - Enter/Space activates an item (clicks [data-kb-activate] descendant, or the item itself if clickable)
 *
 * Usage:
 * 1) Call initGlobalRovingFocus() once (e.g., in App.jsx useEffect).
 * 2) Mark any container that should support arrow navigation with: data-kb-nav="1"
 * 3) Mark focusable items within with: data-kb-item and ensure they have tabIndex="0" (or are naturally focusable)
 * 4) Optionally mark a preferred activator within an item with: data-kb-activate (e.g., on a View button or Link)
 *
 * Optional container attributes:
 *  - data-kb-axis="vertical|horizontal|both" (default: vertical)
 *  - data-kb-wrap="true|false" (default: true)
 */

function isEditable(target) {
  if (!target) return false;
  const tag = (target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (target.isContentEditable) return true;
  // For inputs, also ignore when type is not button-like
  if (tag === "input") {
    const t = (target.getAttribute("type") || "").toLowerCase();
    const textTypes = new Set([
      "",
      "text",
      "email",
      "number",
      "password",
      "search",
      "tel",
      "url",
      "date",
      "datetime-local",
      "month",
      "time",
      "week",
    ]);
    return textTypes.has(t);
  }
  return false;
}

function isHidden(el) {
  if (!el) return true;
  const style = window.getComputedStyle(el);
  return style.display === "none" || style.visibility === "hidden";
}

function findContainer(startEl, selectorContainer) {
  if (!startEl) return null;
  return startEl.closest(selectorContainer);
}

function getItems(container, selectorItem) {
  if (!container) return [];
  const all = Array.from(container.querySelectorAll(selectorItem));
  return all.filter((el) => !isHidden(el) && !el.hasAttribute("disabled") && !el.getAttribute("aria-disabled"));
}

function clampIndex(i, len, wrap) {
  if (len === 0) return -1;
  if (wrap) {
    return (i + len) % len;
  }
  return Math.max(0, Math.min(len - 1, i));
}

function scrollIntoViewWithin(container, el) {
  try {
    if (!el) return;
    el.scrollIntoView({ block: "nearest", inline: "nearest" });
  } catch (_) {}
}

function activateItem(item) {
  if (!item) return false;

  // Prefer explicit activator
  let target =
    item.querySelector("[data-kb-activate]") ||
    item.querySelector("a,button,[role='button']") ||
    null;

  if (!target) {
    // If the item itself is clickable (has onclick), use it
    if (typeof item.onclick === "function" || item.getAttribute("role") === "button" || item.tagName.toLowerCase() === "a") {
      target = item;
    }
  }

  if (target) {
    try {
      target.click();
      return true;
    } catch (_) {}
  }
  return false;
}

export function initGlobalRovingFocus(options = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.__kbNavInitialized) return; // guard against double init
  window.__kbNavInitialized = true;

  const selectorContainer = options.selectorContainer || "[data-kb-nav]";
  const selectorItem = options.selectorItem || "[data-kb-item]";

  function handleKeyDown(e) {
    // Ignore if any modifier keys are pressed
    if (e.altKey || e.ctrlKey || e.metaKey) return;

    const target = e.target;

    // Ignore when typing in editable fields
    if (isEditable(target)) return;

    const container = findContainer(target, selectorContainer);
    if (!container) return;

    const axis = (container.getAttribute("data-kb-axis") || "vertical").toLowerCase();
    const wrapAttr = container.getAttribute("data-kb-wrap");
    const wrap = wrapAttr === null ? true : wrapAttr !== "false";

    const key = e.key;

    // Activation (Enter/Space) when focus is on an item (or inside one)
    if (key === "Enter" || key === " ") {
      let focusItem = target.closest(selectorItem);
      if (!focusItem && document.activeElement) {
        focusItem = document.activeElement.closest && document.activeElement.closest(selectorItem);
      }
      if (focusItem) {
        const activated = activateItem(focusItem);
        if (activated) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
      return;
    }

    // Navigation
    const items = getItems(container, selectorItem);
    if (!items.length) return;

    // Determine current index
    let activeEl = document.activeElement;
    let currentItem =
      (activeEl && activeEl.closest && activeEl.closest(selectorItem)) ||
      (target && target.closest && target.closest(selectorItem)) ||
      null;

    let index = items.indexOf(currentItem);
    if (index === -1) {
      // If nothing focused inside container, start at first
      index = 0;
    }

    let nextIndex = index;

    const isVerticalKey = key === "ArrowUp" || key === "ArrowDown";
    const isHorizontalKey = key === "ArrowLeft" || key === "ArrowRight";

    const allowVertical = axis === "vertical" || axis === "both" || axis === "grid";
    const allowHorizontal = axis === "horizontal" || axis === "both" || axis === "grid";

    if (key === "Home") {
      nextIndex = 0;
    } else if (key === "End") {
      nextIndex = items.length - 1;
    } else if ((isVerticalKey && allowVertical) || (isHorizontalKey && allowHorizontal)) {
      const dir =
        key === "ArrowDown" || key === "ArrowRight"
          ? 1
          : key === "ArrowUp" || key === "ArrowLeft"
          ? -1
          : 0;
      nextIndex = clampIndex(index + dir, items.length, wrap);
    } else {
      return; // not handled
    }

    if (nextIndex !== index) {
      const toFocus = items[nextIndex];
      if (toFocus && typeof toFocus.focus === "function") {
        e.preventDefault();
        e.stopPropagation();
        toFocus.focus();
        scrollIntoViewWithin(container, toFocus);
      }
    } else if (key === "Home" || key === "End") {
      const toFocus = items[nextIndex];
      if (toFocus && typeof toFocus.focus === "function") {
        e.preventDefault();
        e.stopPropagation();
        toFocus.focus();
        scrollIntoViewWithin(container, toFocus);
      }
    }
  }

  document.addEventListener("keydown", handleKeyDown, true);
}

/**
 * Optional helper for making any element "pressable" via Enter/Space,
 * while preserving click for mouse/touch. Use via JSX spread:
 * <div {...makePressableProps(() => doSomething())}>...</div>
 */
export function makePressableProps(onActivate, { role = "button", tabIndex = 0 } = {}) {
  return {
    role,
    tabIndex,
    onKeyDown: (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (isEditable(e.target)) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        if (typeof onActivate === "function") onActivate();
      }
    },
  };
}