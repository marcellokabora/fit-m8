<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import type { Snippet } from "svelte";

  let {
    open = $bindable(false),
    onClose,
    closeLabel = "Close",
    bgClass = "bg-bg",
    maxHeightClass = "max-h-[90dvh]",
    children,
  }: {
    open?: boolean;
    onClose: () => void;
    closeLabel?: string;
    // callers own their own padding/layout inside — this only provides the shell
    bgClass?: string;
    maxHeightClass?: string;
    children: Snippet;
  } = $props();

  // Drag state for dismissing the sheet by pulling the handle down
  let dragging = $state(false);
  let dragY = $state(0);
  let dragStartY = 0;

  function onHandleDragStart(e: PointerEvent) {
    dragging = true;
    dragY = 0;
    dragStartY = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onHandleDragMove(e: PointerEvent) {
    if (!dragging) return;
    dragY = Math.max(0, e.clientY - dragStartY);
  }

  function onHandleDragEnd() {
    if (!dragging) return;
    dragging = false;
    // dragged more than a third of the way down counts as an intentional dismiss
    if (dragY > 120) onClose();
    dragY = 0;
  }

  // Pressing back while the sheet is open should dismiss it and stay on the
  // current route, so push a dummy history entry to intercept the back button.
  let historyPushed = false;

  function handlePopState() {
    if (!open) return;
    // the browser already consumed the entry we pushed, don't pop it again
    historyPushed = false;
    onClose();
  }

  $effect(() => {
    if (open) {
      history.pushState({ bottomSheetOpen: true }, "");
      historyPushed = true;
    } else if (historyPushed) {
      historyPushed = false;
      history.back();
    }
  });

  $effect(() => {
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  });
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 mx-auto flex w-full items-end bg-black/60 backdrop-blur-sm md:max-w-md"
    transition:fade={{ duration: 150 }}
    role="button"
    tabindex="0"
    aria-label={closeLabel}
    onclick={onClose}
    onkeydown={(e) => (e.key === "Enter" || e.key === " ") && onClose()}
  >
    <div
      class="flex w-full flex-col overflow-hidden rounded-t-3xl {bgClass} {maxHeightClass} shadow-2xl"
      style="transform: translateY({dragY}px); transition: {dragging
        ? 'none'
        : 'transform 200ms ease'};"
      transition:fly={{ y: 400, duration: 250 }}
      role="dialog"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <div
        class="mx-auto mt-3 h-1.5 w-10 shrink-0 touch-none rounded-full bg-border active:cursor-grabbing"
        role="button"
        tabindex="0"
        aria-label="Drag handle"
        onpointerdown={onHandleDragStart}
        onpointermove={onHandleDragMove}
        onpointerup={onHandleDragEnd}
        onpointercancel={onHandleDragEnd}
        onkeydown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClose();
          }
        }}
      ></div>
      {@render children()}
    </div>
  </div>
{/if}
