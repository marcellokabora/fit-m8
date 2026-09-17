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
  class="mx-auto flex w-full max-w-4xl flex-1 flex-row items-center justify-center gap-24 text-left"
>
  <div class="flex flex-col items-start gap-4">
    <p class="text-xs font-semibold uppercase tracking-widest text-primary">
      How FIT-M8 works
    </p>
    <span
      class="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary"
    >
      <Icon class="size-10" />
    </span>
    <h2 class="text-4xl font-black text-text">{title}</h2>
    <p class="text-lg text-muted">{desc}</p>
  </div>
  <div
    class="w-96 shrink-0 overflow-hidden rounded-2xl shadow-2xl {index % 2 === 0
      ? 'rotate-3'
      : '-rotate-3'}"
  >
    <enhanced:img
      src={screen}
      alt=""
      aria-hidden="true"
      sizes="384px"
      class="aspect-431/886 w-full object-cover object-top"
    />
  </div>
</div>
