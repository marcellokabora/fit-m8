<script lang="ts">
  import { ArrowLeft } from "@lucide/svelte";
  import type { Snippet } from "svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let t = $derived(createTranslator($activeLanguage));

  let {
    href,
    title,
    class: className = "",
    children,
  }: {
    href?: string;
    title?: string;
    class?: string;
    children?: Snippet;
  } = $props();
</script>

<div
  class="sticky top-0 z-10 flex items-center gap-3 px-4 pb-3 pt-5 {className}"
>
  {#if href}
    <a
      {href}
      class="flex size-9 items-center justify-center rounded-full hover:bg-text/10"
      aria-label={t.t("common.back")}
    >
      <ArrowLeft class="size-5 text-text" />
    </a>
  {:else}
    <button
      onclick={() => history.back()}
      class="flex size-9 items-center justify-center rounded-full hover:bg-text/10"
      aria-label={t.t("common.back")}
    >
      <ArrowLeft class="size-5 text-text" />
    </button>
  {/if}
  {#if children}
    {@render children()}
  {:else if title}
    <h1 class="text-lg font-black text-text">{title}</h1>
  {/if}
</div>
