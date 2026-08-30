<script lang="ts">
  import { MapPin, UserShield, Crown } from "@lucide/svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import type { UserProfile } from "$lib/types";
  import type { Translator } from "$lib/stores/language";
  import { userProfile } from "$lib/stores/auth";
  import { distanceKm } from "$lib/location";
  import { goto } from "$app/navigation";

  let { user, t }: { user: UserProfile; t: Translator } = $props();

  let distanceAway = $derived.by(() => {
    if (
      !$userProfile ||
      $userProfile.lat === undefined ||
      $userProfile.lng === undefined ||
      user.lat === undefined ||
      user.lng === undefined
    )
      return null;
    return Math.round(
      distanceKm($userProfile.lat, $userProfile.lng, user.lat, user.lng),
    );
  });
</script>

<div class="shrink-0 p-5">
  <div class="flex items-center gap-2">
    <h3 class="text-xl font-black text-text">
      <button
        onpointerdown={(e) => e.stopPropagation()}
        onclick={(e) => {
          e.stopPropagation();
          goto(`/profile/${user.uid}`);
        }}
        class="underline-offset-2 active:underline"
      >
        {user.displayName}
      </button>
    </h3>
    {#if user.isPremium}
      <Crown
        class="size-4 shrink-0 text-primary"
        aria-label={t.t("profile.premiumMember")}
      />
    {/if}
    {#if user.age}
      <span class="text-sm text-muted">{user.age}</span>
    {/if}
    {#if user.city}
      <span class="flex items-center gap-0.5 text-sm text-muted">
        <MapPin class="size-3.5" />
        {user.city}
      </span>
    {/if}
    {#if distanceAway !== null}
      <span class="text-sm text-muted">
        {t.t("profile.distanceAway", { count: distanceAway })}
      </span>
    {/if}
  </div>
  {#if user.bio}
    <p class="mt-1 text-sm text-muted text-balance">
      {user.bio}
    </p>
  {/if}
  <div class="mt-3 flex flex-nowrap gap-2 overflow-hidden">
    {#if user.isTrainer}
      <span
        class="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
      >
        <UserShield class="size-3.5" />
        {t.t("profile.trainer")}
      </span>
    {/if}
    {#each (user.activities ?? []).slice(0, 4) as act}
      <span
        class="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
      >
        <ActivityIcon id={act.id} class="size-3.5" />
        {t.activity(act.id)}
      </span>
    {/each}
  </div>
</div>
