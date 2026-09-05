<script module lang="ts">
  export const CAROUSEL_ACTIVITIES = [
    { id: "soccer" },
    { id: "surf" },
    { id: "boxing" },
    { id: "tennis" },
    { id: "footVolley" },
    { id: "jogging" },
    { id: "padel" },
    { id: "beachVolley" },
    { id: "basketball" },
    { id: "cycling" },
  ];
</script>

<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/state";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";
  // lower quality is fine here - these render blurred at 50% opacity as fixed full-screen backgrounds
  // ("enhanced" must be last in the query string to match the "*?enhanced" ambient module type)
  import padelImg from "$lib/assets/homepage/padel.jpg?quality=45&enhanced";
  import footvolleyImg from "$lib/assets/homepage/footvolley.jpg?quality=45&enhanced";
  import joggingImg from "$lib/assets/homepage/jogging.jpg?quality=45&enhanced";
  import tennisImg from "$lib/assets/homepage/tennis.jpg?quality=45&enhanced";
  import basketballImg from "$lib/assets/homepage/bascketball.jpg?quality=45&enhanced";
  import cyclingImg from "$lib/assets/homepage/cycling.jpg?quality=45&enhanced";
  import beachVolleyImg from "$lib/assets/homepage/beachvolley.jpg?quality=45&enhanced";
  import boxingImg from "$lib/assets/homepage/boxing.jpg?quality=45&enhanced";
  import surfImg from "$lib/assets/homepage/surf.jpg?quality=45&enhanced";
  import soccerImg from "$lib/assets/homepage/football.jpg?quality=45&enhanced";

  let t = $derived(createTranslator($activeLanguage));

  let { shuffle = true }: { shuffle?: boolean } = $props();

  const ITEM_HEIGHT = 64;
  const PEEK_HEIGHT = 44; // how much of each neighbor is revealed above/below
  const INTERVAL = 5000;

  // shuffle once per mount so the carousel starts in a different order each visit
  function shuffleArray<T>(items: T[]): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  let shuffled = untrack(() =>
    shuffle ? shuffleArray(CAROUSEL_ACTIVITIES) : CAROUSEL_ACTIVITIES,
  );

  // ?activity=tennis picks the starting slide and, when matched, pauses autoplay
  // (reading searchParams is forbidden during prerendering, so skip it there)
  const activityParam = browser ? page.url.searchParams.get("activity") : null;
  const initialIndex = activityParam
    ? shuffled.findIndex((activity) => activity.id === activityParam)
    : -1;

  // pad with the last/first item so a peek is always visible on both sides, even at the loop seam
  let track = $derived([
    shuffled[shuffled.length - 1],
    ...shuffled,
    shuffled[0],
  ]);

  let pos = $state(initialIndex >= 0 ? initialIndex + 1 : 1);
  let animate = $state(true);
  // center the current item, leaving PEEK_HEIGHT of room above/below for the neighbors
  let offset = $derived(PEEK_HEIGHT - pos * ITEM_HEIGHT);

  // background photo per activity, falling back to a cycling set when there's no dedicated image
  const IMAGE_MAP: Record<string, typeof padelImg> = {
    padel: padelImg,
    footVolley: footvolleyImg,
    jogging: joggingImg,
    tennis: tennisImg,
    basketball: basketballImg,
    cycling: cyclingImg,
    beachVolley: beachVolleyImg,
    boxing: boxingImg,
    surf: surfImg,
    soccer: soccerImg,
  };
  const FALLBACK_IMAGES = [
    joggingImg,
    padelImg,
    tennisImg,
    basketballImg,
    beachVolleyImg,
    cyclingImg,
  ];
  let backgrounds = $derived(
    shuffled.map(
      (activity, i) =>
        IMAGE_MAP[activity.id] ?? FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
    ),
  );
  // maps track position back to the real activity index, including the wrap-around duplicates
  let activeIndex = $derived(
    (((pos - 1) % shuffled.length) + shuffled.length) % shuffled.length,
  );

  // tracks which background photos have actually finished loading, so the fade-in
  // reflects real readiness instead of popping in whenever the network happens to finish
  let loaded = $state<boolean[]>(new Array(shuffled.length).fill(false));

  // snaps the (invisible, non-animated) position back into the real range once a
  // duplicate item at either end has finished scrolling into view
  function snapIfAtEdge() {
    if (pos === track.length - 1) {
      setTimeout(() => {
        animate = false;
        pos = 1;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => (animate = true)),
        );
      }, 350);
    } else if (pos === 0) {
      setTimeout(() => {
        animate = false;
        pos = shuffled.length;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => (animate = true)),
        );
      }, 350);
    }
  }

  function advance(delta: number) {
    pos += delta;
    snapIfAtEdge();
  }

  let timer: ReturnType<typeof setInterval> | undefined;
  function startAutoplay() {
    timer = setInterval(() => advance(1), INTERVAL);
  }
  function restartAutoplay() {
    if (timer) clearInterval(timer);
    startAutoplay();
  }

  // click-triggered navigation also resets the autoplay clock
  function userGoTo(i: number) {
    if (i === pos) return;
    pos = i;
    snapIfAtEdge();
    restartAutoplay();
  }

  onMount(() => {
    if (initialIndex < 0) startAutoplay();
    return () => {
      if (timer) clearInterval(timer);
    };
  });

  // jumps to the picked activity when a link from the "all activities" sheet changes
  // the URL without remounting this component (same route, just a new ?activity=)
  $effect(() => {
    const id = page.url.searchParams.get("activity");
    if (!id) return;
    const index = shuffled.findIndex((activity) => activity.id === id);
    if (index < 0) return;
    userGoTo(index + 1);
  });
</script>

<div
  class="pointer-events-none fixed inset-0 z-0 bg-surface"
  aria-hidden="true"
></div>
{#each backgrounds as src, i}
  <enhanced:img
    {src}
    alt=""
    aria-hidden="true"
    sizes="100vw"
    loading="eager"
    fetchpriority={i === 0 ? "high" : "auto"}
    onload={() => (loaded[i] = true)}
    class="carousel-bg pointer-events-none fixed inset-0 z-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out blur-[2px]"
    style={`opacity: ${i === activeIndex && loaded[i] ? 0.5 : 0}`}
  />
{/each}

<div
  class="activity-carousel relative mx-auto w-full max-w-xs overflow-hidden"
  style={`height: ${ITEM_HEIGHT + PEEK_HEIGHT * 2}px`}
  role="group"
  aria-label={t.activity(shuffled[activeIndex].id)}
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
          ? "flex cursor-pointer items-end justify-center transition-opacity duration-350"
          : i > pos
            ? "flex cursor-pointer items-start justify-center transition-opacity duration-350"
            : "flex items-center justify-center transition-opacity duration-350"}
        style={`height: ${ITEM_HEIGHT}px; opacity: ${i === pos ? 1 : 0.75}`}
        role="button"
        tabindex={i === pos ? -1 : 0}
        onclick={() => userGoTo(i)}
        onkeydown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            userGoTo(i);
          }
        }}
      >
        <span
          class={i === pos
            ? "flex scale-120 items-center gap-2 rounded-full bg-surface/20 px-5 py-3 text-base font-semibold text-primary transition-transform duration-350 box-shadow-md"
            : "flex scale-75 items-center gap-2 px-5 py-3 text-base font-semibold text-muted transition-transform duration-350 text-shadow-2xs"}
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
  @media (max-height: 750px) {
    .activity-carousel {
      display: none;
    }
  }
</style>
