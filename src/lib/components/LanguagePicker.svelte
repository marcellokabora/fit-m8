<script lang="ts">
  import {
    activeLanguage,
    createTranslator,
    LANGUAGES,
  } from "$lib/stores/language";
  import { Languages } from "@lucide/svelte";

  let t = $derived(createTranslator($activeLanguage));
</script>

<div
  class="flex flex-col items-center gap-4"
  role="group"
  aria-label={t.t("onboarding.chooseLanguage")}
  title={t.t("onboarding.chooseLanguage")}
>
  <Languages class="size-4 text-muted" aria-hidden="true" />
  <div class="flex rounded-xl border-2 border-border bg-surface p-1">
    {#each LANGUAGES as option}
      <button
        type="button"
        onclick={() => activeLanguage.selectLanguage(option.code)}
        aria-label={t.t(`language.${option.code}` as any)}
        aria-pressed={$activeLanguage === option.code}
        class="rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors {$activeLanguage ===
        option.code
          ? 'bg-primary text-white'
          : 'text-muted'}"
      >
        {option.code.toUpperCase()}
      </button>
    {/each}
  </div>
</div>
