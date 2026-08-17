<script lang="ts">
  import { User } from "@lucide/svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let t = $derived(createTranslator($activeLanguage));

  let { photos, alt }: { photos: string[]; alt: string } = $props();

  let photoIndex = $state(0);

  $effect(() => {
    photos;
    photoIndex = 0;
  });

  function prevPhoto() {
    photoIndex = (photoIndex - 1 + photos.length) % photos.length;
  }

  function nextPhoto() {
    photoIndex = (photoIndex + 1) % photos.length;
  }
</script>

<div
  class="relative aspect-4/5 w-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20"
>
  {#if photos.length > 1}
    <div class="absolute left-1/2 top-6 z-0 flex w-1/3 -translate-x-1/2 gap-1">
      {#each photos as _, i}
        <div class="h-1 flex-1 overflow-hidden rounded-full bg-white/40">
          <div
            class="h-full rounded-full bg-white"
            style="width: {i === photoIndex ? '100%' : '0%'}"
          ></div>
        </div>
      {/each}
    </div>
  {/if}
  {#if photos[photoIndex]}
    <img src={photos[photoIndex]} {alt} class="h-full w-full object-cover" />
  {:else}
    <div class="flex h-full w-full items-center justify-center">
      <User class="size-24 text-primary/40" />
    </div>
  {/if}
  {#if photos.length > 1}
    <button
      onclick={prevPhoto}
      aria-label={t.t("common.previousPhoto")}
      class="absolute inset-y-0 left-0 w-1/2"
    ></button>
    <button
      onclick={nextPhoto}
      aria-label={t.t("common.nextPhoto")}
      class="absolute inset-y-0 right-0 w-1/2"
    ></button>
  {/if}
</div>
