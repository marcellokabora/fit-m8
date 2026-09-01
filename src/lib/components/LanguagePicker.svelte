<script lang="ts">
  import { slide } from "svelte/transition";
  import { Languages } from "@lucide/svelte";
  import {
    activeLanguage,
    createTranslator,
    LANGUAGES,
  } from "$lib/stores/language";

  let {
    class: positionClass = "left-1/2 -translate-x-1/2",
  }: {
    class?: string;
  } = $props();

  let t = $derived(createTranslator($activeLanguage));
  let open = $state(false);
  let containerEl: HTMLDivElement | undefined = $state();

  function selectLanguage(code: (typeof LANGUAGES)[number]["code"]) {
    activeLanguage.selectLanguage(code);
    open = false;
  }

  function handleOutsideClick(event: MouseEvent) {
    if (open && containerEl && !containerEl.contains(event.target as Node)) {
      open = false;
    }
  }
</script>

<svelte:window onclick={handleOutsideClick} />

<div
  bind:this={containerEl}
  class="absolute z-20 flex flex-col items-center gap-5 {positionClass}"
  role="group"
  aria-label={t.t("onboarding.chooseLanguage")}
  title={t.t("onboarding.chooseLanguage")}
>
  <div
    class="flex flex-col rounded-2xl border-2 border-primary/50 bg-surface/0 p-1.5 backdrop-blur-sm shadow-sm"
  >
    {#each LANGUAGES as option}
      {#if option.code === $activeLanguage}
        <button
          type="button"
          onclick={() => (open = !open)}
          aria-expanded={open}
          aria-label={t.t(`language.${option.code}` as any)}
          aria-pressed="true"
          class="flex items-center gap-2 rounded-xl bg-primary/0 px-3.5 py-2 text-sm font-bold text-primary transition-colors"
        >
          <Languages class="size-4.5" />
          {option.code.toUpperCase()}
        </button>
      {:else if open}
        <button
          type="button"
          transition:slide={{ duration: 150 }}
          onclick={() => selectLanguage(option.code)}
          aria-label={t.t(`language.${option.code}` as any)}
          aria-pressed="false"
          class="rounded-xl px-3.5 py-2 text-sm font-bold text-muted transition-colors"
        >
          {option.code.toUpperCase()}
        </button>
      {/if}
    {/each}
  </div>
</div>
