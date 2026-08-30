<script lang="ts">
  import { onMount } from "svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import type { Translator } from "$lib/stores/language";

  let {
    activities,
    t,
    interval = 3000,
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

  // background photo per activity, falling back to a cycling set when there's no dedicated image
  const IMAGE_MAP: Record<string, string> = {
    jogging: "/homepage/jogging.jpg",
    padel: "/homepage/padel.jpg",
    tennis: "/homepage/tennis.jpg",
    basketball: "/homepage/bascketball.jpg",
    cycling: "/homepage/cycling.jpg",
    "beach-volley": "/homepage/beachvolley.jpg",
  };
  const FALLBACK_IMAGES = [
    "/homepage/jogging.jpg",
    "/homepage/padel.jpg",
    "/homepage/tennis.jpg",
    "/homepage/bascketball.jpg",
    "/homepage/beachvolley.jpg",
    "/homepage/cycling.jpg",
  ];
  let backgrounds = $derived(
    activities.map(
      (activity, i) =>
        IMAGE_MAP[activity.id] ?? FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
    ),
  );
  // maps track position back to the real activity index, including the wrap-around duplicates
  let activeIndex = $derived(
    (((pos - 1) % activities.length) + activities.length) % activities.length,
  );

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

{#each backgrounds as src, i}
  <img
    {src}
    alt=""
    aria-hidden="true"
    class="carousel-bg pointer-events-none fixed inset-0 z-0 h-full w-full object-cover opacity-50 transition-opacity duration-700 ease-in-out"
    style={`opacity: ${i === activeIndex ? 0.5 : 0}`}
  />
{/each}

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
  @media (max-height: 800px) {
    .activity-carousel {
      display: none;
    }
  }
</style>
