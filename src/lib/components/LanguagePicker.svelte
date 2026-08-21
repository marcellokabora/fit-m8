<script lang="ts">
  import { slide } from "svelte/transition";
  import { Languages } from "@lucide/svelte";
  import {
    activeLanguage,
    createTranslator,
    LANGUAGES,
  } from "$lib/stores/language";

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
  class="flex flex-col items-center gap-4"
  role="group"
  aria-label={t.t("onboarding.chooseLanguage")}
  title={t.t("onboarding.chooseLanguage")}
>
  <div class="flex flex-col rounded-xl border-2 border-border bg-surface p-1">
    {#each LANGUAGES as option}
      {#if option.code === $activeLanguage}
        <button
          type="button"
          onclick={() => (open = !open)}
          aria-expanded={open}
          aria-label={t.t(`language.${option.code}` as any)}
          aria-pressed="true"
          class="flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-bold text-white transition-colors"
        >
          <Languages class="size-3.5" />
          {option.code.toUpperCase()}
        </button>
      {:else if open}
        <button
          type="button"
          transition:slide={{ duration: 150 }}
          onclick={() => selectLanguage(option.code)}
          aria-label={t.t(`language.${option.code}` as any)}
          aria-pressed="false"
          class="rounded-lg px-2.5 py-1.5 text-xs font-bold text-muted transition-colors"
        >
          {option.code.toUpperCase()}
        </button>
      {/if}
    {/each}
  </div>
</div>
