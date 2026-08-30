<script lang="ts">
  import { onMount } from "svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import type { Translator } from "$lib/stores/language";

  let {
    activities,
    t,
    interval = 2200,
  }: {
    activities: { id: string }[];
    t: Translator;
    interval?: number;
  } = $props();

  const ITEM_HEIGHT = 64;
  const PEEK_HEIGHT = 44; // how much of each neighbor is revealed above/below
  // pad with the last/first item so a peek is always visible on both sides, even at the loop seam
  let track = $derived([
    activities[activities.length - 1],
    ...activities,
    activities[0],
  ]);

  let pos = $state(1);
  let animate = $state(true);
  // center the current item, leaving PEEK_HEIGHT of room above/below for the neighbors
  let offset = $derived(PEEK_HEIGHT - pos * ITEM_HEIGHT);

  onMount(() => {
    const timer = setInterval(() => {
      pos += 1;
      if (pos === track.length - 1) {
        // snap back to the real first item once the duplicate has scrolled in
        setTimeout(() => {
          animate = false;
          pos = 1;
          requestAnimationFrame(() =>
            requestAnimationFrame(() => (animate = true)),
          );
        }, 350);
      }
    }, interval);
    return () => clearInterval(timer);
  });
</script>

<div
  class="activity-carousel relative mx-auto w-full max-w-xs overflow-hidden"
  style={`height: ${ITEM_HEIGHT + PEEK_HEIGHT * 2}px`}
>
  <div
    class={animate
      ? "flex flex-col transition-transform duration-350 ease-in-out"
      : "flex flex-col"}
    style={`transform: translateY(${offset}px)`}
  >
    {#each track as activity, i}
      <div
        class={i < pos
          ? "flex items-end justify-center transition-opacity duration-350"
          : i > pos
            ? "flex items-start justify-center transition-opacity duration-350"
            : "flex items-center justify-center transition-opacity duration-350"}
        style={`height: ${ITEM_HEIGHT}px; opacity: ${i === pos ? 1 : 0.75}`}
      >
        <span
          class={i === pos
            ? "flex scale-110 items-center gap-2 rounded-full bg-primary/10 px-5 py-3 text-base font-semibold text-primary transition-transform duration-350"
            : "flex scale-75 items-center gap-2 px-5 py-3 text-base font-semibold text-muted transition-transform duration-350"}
        >
          <ActivityIcon
            id={activity.id}
            class={i === pos ? "size-5" : "size-4"}
          />
          {t.activity(activity.id)}
        </span>
      </div>
    {/each}
  </div>
</div>

<style>
  /* hide on short viewports where the carousel would push other content off-screen */
  @media (max-height: 700px) {
    .activity-carousel {
      display: none;
    }
  }
</style>
