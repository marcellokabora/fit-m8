<script lang="ts">
  import { goto } from "$app/navigation";
  import { authUser, userProfile } from "$lib/stores/auth";
  import { ACTIVITIES, formatLabel } from "$lib/types";
  import BottomNav from "$lib/components/BottomNav.svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import PhotoGallery from "$lib/components/PhotoGallery.svelte";
  import LanguagePicker from "$lib/components/LanguagePicker.svelte";
  import { MapPin } from "@lucide/svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let t = $derived(createTranslator($activeLanguage));

  let photos = $derived(
    $userProfile?.photos ??
      ($userProfile?.photoURL ? [$userProfile.photoURL] : []),
  );

  async function logout() {
    // Navigate explicitly instead of relying on the layout's auth-state
    // redirect, which can lag (or never fire) on some mobile browsers.
    try {
      await authUser.signOut();
    } finally {
      goto("/", { replaceState: true });
    }
  }
</script>

<div class="flex min-h-dvh flex-col bg-bg pb-24">
  <!-- Header -->
  <div
    class="sticky top-0 z-10 flex items-center justify-between bg-bg px-5 pb-3 pt-5"
  >
    <h1 class="text-2xl font-black text-text">{t.t("nav.profile")}</h1>
    <a
      href="/profile/edit"
      class="rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary active:scale-95"
    >
      {t.t("profile.edit")}
    </a>
  </div>

  <!-- Photos + basic info -->
  <PhotoGallery
    {photos}
    alt={$userProfile?.displayName ?? t.t("common.profilePhoto")}
  />
  <div class="flex flex-col items-center gap-3 px-5 pb-6 pt-4">
    <h2 class="text-xl font-black text-text">
      {$userProfile?.displayName ?? "—"}
    </h2>
    {#if $userProfile?.city}
      <p class="flex items-center gap-1 text-sm text-muted">
        <MapPin class="size-4" />
        {$userProfile.city}
      </p>
    {/if}
    {#if $userProfile?.bio}
      <p class="text-center text-sm text-muted text-balance">
        {$userProfile.bio}
      </p>
    {/if}
  </div>

  <!-- Activities -->
  <div class="px-5">
    <h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
      {t.t("common.mySports")}
    </h3>
    {#if ($userProfile?.activities?.length ?? 0) === 0}
      <p class="text-sm text-muted">{t.t("common.noActivities")}</p>
    {:else}
      <div class="flex flex-col gap-3">
        {#each $userProfile?.activities ?? [] as act}
          {@const info = ACTIVITIES.find((a) => a.id === act.id)}
          <div
            class="flex items-center gap-4 rounded-2xl bg-surface p-4 shadow-sm"
          >
            <span
              class="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <ActivityIcon id={act.id} class="size-5" />
            </span>
            <div class="flex-1">
              <p class="font-bold text-text">{t.activity(act.id)}</p>
              <p class="text-sm text-muted">
                {t.format(act.format)} · {t.skill(act.level)}
              </p>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Logout -->
  <div class="mt-auto px-5 pt-8">
    <div class="pb-6">
      <LanguagePicker />
    </div>
    <button
      onclick={logout}
      class="mt-5 w-full rounded-2xl border-2 border-error/30 py-4 text-base font-semibold text-error active:scale-95"
    >
      {t.t("profile.signOut")}
    </button>
  </div>

  <BottomNav active="profile" />
</div>
