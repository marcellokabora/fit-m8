<script lang="ts">
  import {
    Heart,
    Users,
    GraduationCap,
    ChevronDown,
    ChevronUp,
  } from "@lucide/svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let { class: className = "" }: { class?: string } = $props();

  let t = $derived(createTranslator($activeLanguage));
  let expanded = $state(false);

  const ROWS = [
    {
      key: "dating",
      icon: Heart,
      title: "discover.datingPreset",
      body: "discover.presetHintDatingBody",
    },
    {
      key: "friends",
      icon: Users,
      title: "discover.friendsPreset",
      body: "discover.presetHintFriendsBody",
    },
    {
      key: "trainer",
      icon: GraduationCap,
      title: "discover.trainerPreset",
      body: "discover.presetHintTrainerBody",
    },
  ] as const;
</script>

<div class="mb-5 rounded-2xl bg-surface shadow-sm {className}">
  <button
    onclick={() => (expanded = !expanded)}
    class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
    aria-expanded={expanded}
  >
    <span>
      <span class="block text-sm font-bold text-text"
        >{t.t("discover.presetHintToggle")}</span
      >
      <span class="block text-xs text-muted"
        >{t.t("discover.presetHintSubtitle")}</span
      >
    </span>
    {#if expanded}
      <ChevronUp class="size-4 shrink-0 text-muted" />
    {:else}
      <ChevronDown class="size-4 shrink-0 text-muted" />
    {/if}
  </button>
  {#if expanded}
    <div class="flex flex-col gap-3 px-4 pb-4">
      {#each ROWS as row}
        <div class="flex items-start gap-3">
          <div
            class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <row.icon class="size-4" />
          </div>
          <div>
            <p class="text-sm font-bold text-text">{t.t(row.title)}</p>
            <p class="text-xs text-muted">{t.t(row.body)}</p>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
