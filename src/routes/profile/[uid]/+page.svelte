<script lang="ts">
  import { page } from "$app/state";
  import { db } from "$lib/firebase/client";
  import { doc, getDoc } from "firebase/firestore";
  import { ACTIVITIES, type UserProfile } from "$lib/types";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import BackHeader from "$lib/components/BackHeader.svelte";
  import PhotoGallery from "$lib/components/PhotoGallery.svelte";
  import { userProfile } from "$lib/stores/auth";
  import { distanceKm } from "$lib/location";
  import { MapPin, LoaderCircle } from "@lucide/svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let t = $derived(createTranslator($activeLanguage));

  let uid = $derived(page.params.uid as string);
  let profile = $state<UserProfile | null>(null);
  let loading = $state(true);
  let notFound = $state(false);
  let distanceAway = $derived.by(() => {
    if (
      !$userProfile ||
      $userProfile.lat === undefined ||
      $userProfile.lng === undefined ||
      !profile ||
      profile.lat === undefined ||
      profile.lng === undefined
    )
      return null;
    return Math.round(
      distanceKm($userProfile.lat, $userProfile.lng, profile.lat, profile.lng),
    );
  });

  let photos = $derived(
    profile?.photos?.length
      ? profile.photos
      : profile?.photoURL
        ? [profile.photoURL]
        : [],
  );

  let mySportIds = $derived(
    new Set(($userProfile?.activities ?? []).map((a) => a.id)),
  );
  // Stable sort keeps each group in its original order, shared sports just move to the front
  let sortedActivities = $derived(
    [...(profile?.activities ?? [])].sort(
      (a, b) => Number(!mySportIds.has(a.id)) - Number(!mySportIds.has(b.id)),
    ),
  );

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

<div class="flex min-h-dvh flex-col bg-bg pb-12">
  <BackHeader title={t.t("nav.profile")} class="bg-bg" />

  {#if loading}
    <div class="flex flex-1 items-center justify-center text-muted">
      <LoaderCircle class="size-10 animate-spin" />
    </div>
  {:else if notFound || !profile}
    <div class="flex flex-1 items-center justify-center text-muted">
      <p>{t.t("profile.notFound")}</p>
    </div>
  {:else}
    <PhotoGallery {photos} alt={profile.displayName} />

    <div class="flex flex-col items-center gap-3 px-5 pb-6 pt-4">
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
        {#if distanceAway !== null}
          <span>{t.t("profile.distanceAway", { count: distanceAway })}</span>
        {/if}
      </div>
      {#if profile.orientation === "gay"}
        <span
          class="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
        >
          {t.orientation("gay")}
        </span>
      {/if}
      {#if profile.bio}
        <p class="text-center text-sm text-muted text-balance">{profile.bio}</p>
      {/if}
    </div>

    <div class="px-5">
      <h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
        {t.t("common.sports")}
      </h3>
      {#if (profile.activities?.length ?? 0) === 0}
        <p class="text-sm text-muted">{t.t("common.noActivities")}</p>
      {:else}
        <div class="flex flex-col gap-3">
          {#each sortedActivities as act}
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
                <p class="flex items-center gap-2 font-bold text-text">
                  {t.activity(act.id)}
                  {#if mySportIds.has(act.id)}
                    <span
                      class="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
                    >
                      {t.t("profile.inCommon")}
                    </span>
                  {/if}
                </p>
                <p class="text-sm text-muted">
                  {#if act.format !== "all"}{t.format(act.format)}·
                  {/if}{t.skill(act.level)}
                </p>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
