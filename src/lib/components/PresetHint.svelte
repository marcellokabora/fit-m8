<script lang="ts">
  import {
    Heart,
    Users,
    GraduationCap,
    CircleQuestionMark,
  } from "@lucide/svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let { class: className = "" }: { class?: string } = $props();

  let t = $derived(createTranslator($activeLanguage));
  let open = $state(false);

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

<button
  onclick={() => (open = true)}
  class="flex size-9 items-center justify-center rounded-full bg-surface text-text shadow-sm {className}"
  aria-label={t.t("discover.presetHintToggle")}
>
  <CircleQuestionMark class="size-5" />
</button>

{#if open}
  <div
    class="fixed inset-0 z-50 mx-auto flex w-full items-center justify-center bg-black/60 px-6 backdrop-blur-sm md:max-w-md"
  >
    <div
      class="flex w-full flex-col gap-4 rounded-3xl bg-surface p-6 shadow-2xl"
    >
      <div>
        <h2 class="text-lg font-black text-text">
          {t.t("discover.presetHintToggle")}
        </h2>
        <p class="text-xs text-muted">{t.t("discover.presetHintSubtitle")}</p>
      </div>
      <div class="flex flex-col gap-3">
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
      <button
        onclick={() => (open = false)}
        class="w-full rounded-2xl bg-primary py-3 text-xs font-bold text-white active:scale-95"
      >
        {t.t("common.close")}
      </button>
    </div>
  </div>
{/if}
