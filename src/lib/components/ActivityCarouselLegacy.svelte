<script lang="ts">
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  type Activity = { id: string };

  let {
    activities,
    activeIndex,
    animate,
    offset,
    pos,
    track,
    itemHeight,
    peekHeight,
    onSelect,
  }: {
    activities: Activity[];
    activeIndex: number;
    animate: boolean;
    offset: number;
    pos: number;
    track: Activity[];
    itemHeight: number;
    peekHeight: number;
    onSelect: (index: number) => void;
  } = $props();

  let t = $derived(createTranslator($activeLanguage));
</script>

<div
  class="activity-carousel relative mx-auto w-full max-w-xs overflow-hidden"
  style={`height: ${itemHeight + peekHeight * 2}px`}
  role="group"
  aria-label={t.activity(activities[activeIndex].id)}
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
            : "flex cursor-pointer items-center justify-center transition-opacity duration-350"}
        style={`height: ${itemHeight}px; opacity: ${i === pos ? 1 : 0.76}`}
        role="button"
        tabindex="0"
        onclick={() => onSelect(i)}
        onkeydown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(i);
          }
        }}
      >
        <span
          class={i === pos
            ? "flex scale-100 items-center gap-2 rounded-full bg-surface/20 px-5 py-3 text-base font-semibold text-primary transition-transform duration-350 box-shadow-md"
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
  @media (max-height: 500px) {
    .activity-carousel {
      display: none;
    }
  }
</style>
