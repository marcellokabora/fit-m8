<script lang="ts">
  import { onMount, untrack } from "svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";
  import padelImg from "$lib/assets/homepage/padel.jpg?enhanced";
  import footvolleyImg from "$lib/assets/homepage/footvolley.jpg?enhanced";
  import joggingImg from "$lib/assets/homepage/jogging.jpg?enhanced";
  import tennisImg from "$lib/assets/homepage/tennis.jpg?enhanced";
  import basketballImg from "$lib/assets/homepage/bascketball.jpg?enhanced";
  import cyclingImg from "$lib/assets/homepage/cycling.jpg?enhanced";
  import beachVolleyImg from "$lib/assets/homepage/beachvolley.jpg?enhanced";
  import boxingImg from "$lib/assets/homepage/boxing.jpg?enhanced";
  import surfImg from "$lib/assets/homepage/surf.jpg?enhanced";
  import soccerImg from "$lib/assets/homepage/football.jpg?enhanced";

  let t = $derived(createTranslator($activeLanguage));

  let { shuffle = true }: { shuffle?: boolean } = $props();

  const ACTIVITIES = [
    { id: "soccer" },
    { id: "surf" },
    { id: "boxing" },
    { id: "tennis" },
    { id: "footvolley" },
    { id: "jogging" },
    { id: "padel" },
    { id: "beachVolley" },
    { id: "basketball" },
    { id: "cycling" },
  ];

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
    shuffle ? shuffleArray(ACTIVITIES) : ACTIVITIES,
  );

  // pad with the last/first item so a peek is always visible on both sides, even at the loop seam
  let track = $derived([
    shuffled[shuffled.length - 1],
    ...shuffled,
    shuffled[0],
  ]);

  let pos = $state(1);
  let animate = $state(true);
  // center the current item, leaving PEEK_HEIGHT of room above/below for the neighbors
  let offset = $derived(PEEK_HEIGHT - pos * ITEM_HEIGHT);

  // background photo per activity, falling back to a cycling set when there's no dedicated image
  const IMAGE_MAP: Record<string, typeof padelImg> = {
    padel: padelImg,
    footvolley: footvolleyImg,
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

  // user-triggered navigation (click/scroll/swipe) also resets the autoplay clock
  function userAdvance(delta: number) {
    advance(delta);
    restartAutoplay();
  }
  function userGoTo(i: number) {
    if (i === pos) return;
    pos = i;
    snapIfAtEdge();
    restartAutoplay();
  }

  let wheelLocked = false;
  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    if (wheelLocked) return;
    wheelLocked = true;
    userAdvance(e.deltaY > 0 ? 1 : -1);
    setTimeout(() => (wheelLocked = false), 400);
  }

  let touchStartY = 0;
  function handleTouchStart(e: TouchEvent) {
    touchStartY = e.touches[0].clientY;
  }
  function handleTouchEnd(e: TouchEvent) {
    const deltaY = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(deltaY) > 20) {
      userAdvance(deltaY > 0 ? 1 : -1);
    }
  }

  onMount(() => {
    startAutoplay();
    return () => {
      if (timer) clearInterval(timer);
    };
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
    fetchpriority={i === 0 ? "high" : "low"}
    class="carousel-bg pointer-events-none fixed inset-0 z-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out blur-xs"
    style={`opacity: ${i === activeIndex ? 0.5 : 0}`}
  />
{/each}

<div
  class="activity-carousel relative mx-auto w-full max-w-xs overflow-hidden"
  style={`height: ${ITEM_HEIGHT + PEEK_HEIGHT * 2}px`}
  role="group"
  aria-label={t.activity(shuffled[activeIndex].id)}
  onwheel={handleWheel}
  ontouchstart={handleTouchStart}
  ontouchend={handleTouchEnd}
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
  .activity-carousel {
    touch-action: none;
  }

  /* hide on short viewports where the carousel would push other content off-screen */
  @media (max-height: 750px) {
    .activity-carousel {
      display: none;
    }
  }
</style>
