<script lang="ts">
  import {
    Heart,
    Users,
    UserShield,
    CircleQuestionMark,
    Dumbbell,
    ListOrdered,
  } from "@lucide/svelte";
  import { fade, fly } from "svelte/transition";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let { class: className = "" }: { class?: string } = $props();

  let t = $derived(createTranslator($activeLanguage));
  let open = $state(false);

  const CONCEPT_ROWS = [
    {
      key: "sports",
      icon: Dumbbell,
      title: "discover.presetHintIntroTitle",
      body: "discover.presetHintIntroBody",
    },
    {
      key: "order",
      icon: ListOrdered,
      title: "discover.presetHintOrderTitle",
      body: "discover.presetHintOrderBody",
    },
  ] as const;

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
      icon: UserShield,
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
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 mx-auto flex w-full items-end bg-black/60 backdrop-blur-sm md:max-w-md"
    transition:fade={{ duration: 150 }}
    onclick={() => (open = false)}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div
      class="flex max-h-[85dvh] w-full flex-col rounded-t-3xl bg-surface pt-4 shadow-2xl"
      transition:fly={{ y: 400, duration: 250 }}
      onclick={(e) => e.stopPropagation()}
    >
      <div class="mx-auto mb-2 h-1.5 w-10 rounded-full bg-border"></div>

      <div class="flex flex-col gap-6 overflow-y-auto px-7 pb-4">
        <div>
          <h2 class="text-2xl font-black text-text">
            {t.t("discover.presetHintToggle")}
          </h2>
          <p class="mt-1 text-sm text-muted">
            {t.t("discover.presetHintSubtitle")}
          </p>
        </div>

        <div class="flex flex-col gap-4">
          {#each CONCEPT_ROWS as row}
            <div class="flex items-start gap-4">
              <div
                class="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                <row.icon class="size-5" />
              </div>
              <div>
                <p class="text-base font-bold text-text">{t.t(row.title)}</p>
                <p class="mt-0.5 text-sm text-muted">{t.t(row.body)}</p>
              </div>
            </div>
          {/each}
        </div>

        <div class="border-t border-border pt-5">
          <div class="flex flex-col gap-4">
            {#each ROWS as row}
              <div class="flex items-start gap-4">
                <div
                  class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                >
                  <row.icon class="size-4" />
                </div>
                <div>
                  <p class="text-sm font-bold text-text">{t.t(row.title)}</p>
                  <p class="mt-0.5 text-xs text-muted">{t.t(row.body)}</p>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div class="border-t border-border px-7 py-4">
        <button
          onclick={() => (open = false)}
          class="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-white active:scale-95"
        >
          {t.t("common.close")}
        </button>
      </div>
    </div>
  </div>
{/if}
