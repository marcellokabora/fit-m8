<script lang="ts">
  import { page } from "$app/state";
  import { db } from "$lib/firebase/client";
  import { doc, getDoc } from "firebase/firestore";
  import { ACTIVITIES, type UserProfile } from "$lib/types";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import { ArrowLeft, User, MapPin, LoaderCircle } from "@lucide/svelte";

  let uid = $derived(page.params.uid as string);
  let profile = $state<UserProfile | null>(null);
  let loading = $state(true);
  let notFound = $state(false);

  $effect(() => {
    loading = true;
    notFound = false;
    profile = null;
    getDoc(doc(db, "users", uid)).then((snap) => {
      if (snap.exists()) {
        profile = { uid, ...(snap.data() as Omit<UserProfile, "uid">) };
      } else {
        notFound = true;
      }
      loading = false;
    });
  });
</script>

<div class="flex min-h-screen flex-col bg-bg pb-12">
  <div class="flex items-center gap-3 px-4 pb-3 pt-12">
    <button
      onclick={() => history.back()}
      class="flex size-9 items-center justify-center rounded-full hover:bg-gray-100"
    >
      <ArrowLeft class="size-5 text-text" />
    </button>
    <h1 class="text-lg font-black text-text">Profile</h1>
  </div>

  {#if loading}
    <div class="flex flex-1 items-center justify-center text-muted">
      <LoaderCircle class="size-10 animate-spin" />
    </div>
  {:else if notFound || !profile}
    <div class="flex flex-1 items-center justify-center text-muted">
      <p>User not found</p>
    </div>
  {:else}
    <div class="flex flex-col items-center gap-3 px-5 pb-6">
      <div
        class="flex size-24 items-center justify-center rounded-full bg-primary/20 text-6xl"
      >
        {#if profile.photoURL}
          <img
            src={profile.photoURL}
            alt={profile.displayName}
            class="h-full w-full rounded-full object-cover"
          />
        {:else}
          <User class="size-12 text-primary" />
        {/if}
      </div>
      <h2 class="text-xl font-black text-text">{profile.displayName}</h2>
      <div class="flex items-center gap-2 text-sm text-muted">
        {#if profile.age}
          <span>{profile.age}</span>
        {/if}
        {#if profile.city}
          <span class="flex items-center gap-0.5">
            <MapPin class="size-3.5" />
            {profile.city}
          </span>
        {/if}
      </div>
      {#if profile.bio}
        <p class="text-center text-sm text-muted">{profile.bio}</p>
      {/if}
    </div>

    <div class="px-5">
      <h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
        Sports
      </h3>
      {#if (profile.activities?.length ?? 0) === 0}
        <p class="text-sm text-muted">No activities set</p>
      {:else}
        <div class="flex flex-col gap-3">
          {#each profile.activities as act}
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
                <p class="text-sm text-muted">{act.format} · {act.level}</p>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
