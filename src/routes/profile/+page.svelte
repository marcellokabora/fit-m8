<script lang="ts">
  import { authUser, userProfile } from "$lib/stores/auth";
  import { ACTIVITIES, formatLabel } from "$lib/types";
  import BottomNav from "$lib/components/BottomNav.svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import PhotoGallery from "$lib/components/PhotoGallery.svelte";
  import { MapPin } from "@lucide/svelte";

  let photos = $derived(
    $userProfile?.photos ??
      ($userProfile?.photoURL ? [$userProfile.photoURL] : []),
  );

  async function logout() {
    await authUser.signOut();
  }
</script>

<div class="flex min-h-screen flex-col bg-bg pb-24">
  <!-- Header -->
  <div class="flex items-center justify-between px-5 pb-3 pt-5">
    <h1 class="text-2xl font-black text-text">Profile</h1>
    <a
      href="/profile/edit"
      class="rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary active:scale-95"
    >
      Edit
    </a>
  </div>

  <!-- Photos + basic info -->
  <PhotoGallery {photos} alt={$userProfile?.displayName ?? "Profile photo"} />
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
      My Sports
    </h3>
    {#if ($userProfile?.activities?.length ?? 0) === 0}
      <p class="text-sm text-muted">No activities set</p>
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
              <p class="font-bold text-text">{info?.label ?? act.id}</p>
              <p class="text-sm text-muted">
                {formatLabel(act.format)} · {act.level}
              </p>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Logout -->
  <div class="mt-auto px-5 pt-8">
    <button
      onclick={logout}
      class="w-full rounded-2xl border-2 border-error/30 py-4 text-base font-semibold text-error active:scale-95"
    >
      Sign out
    </button>
  </div>

  <BottomNav active="profile" />
</div>
