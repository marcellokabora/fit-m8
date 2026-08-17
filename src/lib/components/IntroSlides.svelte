<script lang="ts">
  import { fade } from "svelte/transition";
  import { Heart, Users, GraduationCap } from "@lucide/svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let { onclose }: { onclose: () => void } = $props();

  let t = $derived(createTranslator($activeLanguage));

  const SLIDES = [
    { key: "dating", icon: Heart },
    { key: "friends", icon: Users },
    { key: "experts", icon: GraduationCap },
  ] as const;

  let index = $state(0);
  let slide = $derived(SLIDES[index]);

  function next() {
    if (index < SLIDES.length - 1) index++;
    else onclose();
  }
</script>

<div
  class="fixed inset-0 z-50 flex flex-col bg-bg px-6 pb-10 pt-10"
  transition:fade={{ duration: 150 }}
>
  <div class="mb-8 flex items-center gap-2">
    {#each SLIDES as _, i}
      <div
        class="h-1.5 flex-1 rounded-full transition-all {i <= index
          ? 'bg-primary'
          : 'bg-border'}"
      ></div>
    {/each}
  </div>

  {#key index}
    <div
      class="flex flex-1 flex-col items-center justify-center gap-6 text-center"
      in:fade={{ duration: 200 }}
    >
      <div class="rounded-3xl bg-primary/10 p-6">
        <slide.icon class="size-14 text-primary" />
      </div>
      <h2 class="text-2xl font-black text-text">
        {t.t(`intro.${slide.key}.title`)}
      </h2>
      <p class="max-w-sm text-base leading-relaxed text-muted">
        {t.t(`intro.${slide.key}.body`)}
      </p>
    </div>
  {/key}

  <div class="mt-auto flex gap-3 pt-8">
    <button
      onclick={onclose}
      class="flex-1 rounded-2xl border-2 border-border py-4 text-base font-semibold text-text active:scale-95"
    >
      {t.t("intro.skip")}
    </button>
    <button
      onclick={next}
      class="flex-1 rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-md active:scale-95"
    >
      {index < SLIDES.length - 1 ? t.t("intro.next") : t.t("common.letsGo")}
    </button>
  </div>
</div>
