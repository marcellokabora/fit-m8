<script module lang="ts">
  export const CAROUSEL_ACTIVITIES = [
    { id: "padel" },
    { id: "beachVolley" },
    { id: "jogging" },
    { id: "boxing" },
    { id: "tennis" },
    { id: "footVolley" },
    { id: "skateboard" },
    { id: "basketball" },
    { id: "surf" },
    { id: "soccer" },
    { id: "cycling" },
  ];
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import padelImg from "$lib/assets/homepage/padel.jpg?quality=35&enhanced";
  import footvolleyImg from "$lib/assets/homepage/footvolley.jpg?quality=35&enhanced";
  import joggingImg from "$lib/assets/homepage/jogging.png?quality=35&enhanced";
  import tennisImg from "$lib/assets/homepage/tennis.jpg?quality=35&enhanced";
  import basketballImg from "$lib/assets/homepage/bascketball.jpg?quality=35&enhanced";
  import cyclingImg from "$lib/assets/homepage/cycling.jpg?quality=35&enhanced";
  import beachVolleyImg from "$lib/assets/homepage/beachvolley.jpg?quality=35&enhanced";
  import boxingImg from "$lib/assets/homepage/boxing.jpg?quality=35&enhanced";
  import surfImg from "$lib/assets/homepage/surf.jpg?quality=35&enhanced";
  import soccerImg from "$lib/assets/homepage/football.jpg?quality=35&enhanced";
  import skateImg from "$lib/assets/homepage/skate.jpg?quality=35&enhanced";

  const ITEM_HEIGHT = 64;
  const PEEK_HEIGHT = 44; // how much of each neighbor is revealed above/below
  const INTERVAL = 5000;

  const shuffled = [...CAROUSEL_ACTIVITIES].sort(() => Math.random() - 0.5);

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
    skateboard: skateImg,
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
  let loaded = $state<boolean[]>(
    new Array(CAROUSEL_ACTIVITIES.length).fill(false),
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

  // click-triggered navigation also resets the autoplay clock
  function userGoTo(i: number) {
    if (i === pos) {
      advance(1);
    } else {
      pos = i;
      snapIfAtEdge();
    }
    restartAutoplay();
  }

  onMount(() => {
    startAutoplay();
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
  class="pointer-events-none absolute inset-0 z-0 bg-black/35"
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
    class="carousel-bg pointer-events-none absolute inset-0 z-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out blur-xs"
    style={`opacity: ${i === activeIndex && loaded[i] ? 0.3 : 0}`}
  />
{/each}
