<script lang="ts">
  import type { Component } from "svelte";
  import type { Picture } from "vite-imagetools";

  let {
    icon,
    title,
    desc,
    screen,
    index,
  }: {
    icon: Component<any>;
    title: string;
    desc: string;
    screen: Picture;
    index: number;
  } = $props();

  let Icon = $derived(icon);
</script>

<div
  class="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8 text-center md:flex-row md:gap-24 md:text-left"
>
  <div class="flex flex-col items-center gap-4 md:items-start">
    <p class="text-xs font-semibold uppercase tracking-widest text-primary">
      How FIT-M8 works
    </p>
    <span
      class="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary md:size-20"
    >
      <Icon class="size-8 md:size-10" />
    </span>
    <h2 class="text-2xl font-black text-text md:text-4xl">{title}</h2>
    <p class="text-base text-muted md:text-lg">{desc}</p>
  </div>
  <div
    class="w-64 shrink-0 overflow-hidden rounded-2xl shadow-2xl md:w-96 {index %
      2 ===
    0
      ? 'rotate-3'
      : '-rotate-3'}"
  >
    <enhanced:img
      src={screen}
      alt=""
      aria-hidden="true"
      sizes="(min-width: 768px) 384px, 256px"
      class="aspect-431/886 w-full object-cover object-top"
    />
  </div>
</div>
