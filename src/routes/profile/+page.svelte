<script lang="ts">
  import { tick } from "svelte";
  import { goto } from "$app/navigation";
  import { authUser, userProfile } from "$lib/stores/auth";
  import { isAdmin } from "$lib/stores/admin";
  import {
    ACTIVITIES,
    ACTIVITY_FORMAT_OPTIONS,
    SKILL_LEVEL_OPTIONS,
    getMaxSports,
    type ActivityFormat,
    type SkillLevel,
    type UserActivity,
  } from "$lib/types";
  import BottomNav from "$lib/components/BottomNav.svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import SocialIcon from "$lib/components/SocialIcon.svelte";
  import PhotoGallery from "$lib/components/PhotoGallery.svelte";
  import LanguagePicker from "$lib/components/LanguagePicker.svelte";
  import SegmentedControl from "$lib/components/SegmentedControl.svelte";
  import {
    ChevronDown,
    Crown,
    GripVertical,
    MapPin,
    Pencil,
    Plus,
    ShieldUser,
    Trash2,
    Users,
  } from "@lucide/svelte";
  import { slide } from "svelte/transition";
  import { activeLanguage, createTranslator } from "$lib/stores/language";
  import { detectSocialPlatform } from "$lib/social";

  let t = $derived(createTranslator($activeLanguage));
  let activities = $state<UserActivity[]>($userProfile?.activities ?? []);
  let expandedActivityId = $state<string | null>(null);

  let formatOptions = $derived(
    ACTIVITY_FORMAT_OPTIONS.map((option) => ({
      ...option,
      label: t.format(option.value),
    })),
  );
  let skillOptions = $derived(
    SKILL_LEVEL_OPTIONS.map((option) => ({
      ...option,
      label: t.skill(option.value),
    })),
  );
  let availableActivities = $derived(
    ACTIVITIES.filter((a) => !activities.some((act) => act.id === a.id)),
  );
  let maxSports = $derived(getMaxSports($userProfile?.isPremium));
  let remainingSportSlots = $derived(
    Math.max(0, maxSports - activities.length),
  );

  let photos = $derived(
    $userProfile?.photos ??
      ($userProfile?.photoURL ? [$userProfile.photoURL] : []),
  );

  $effect(() => {
    activities = $userProfile?.activities ?? [];
  });

  async function saveActivities(next: UserActivity[]) {
    const uid = $authUser?.uid;
    if (!uid) return;
    activities = next;
    await userProfile.save(uid, { activities: next });
  }

  function toggleExpandActivity(id: string) {
    expandedActivityId = expandedActivityId === id ? null : id;
  }

  function updateActivityFormat(id: string, format: ActivityFormat) {
    void saveActivities(
      activities.map((act) => (act.id === id ? { ...act, format } : act)),
    );
  }

  function updateActivityLevel(id: string, level: SkillLevel) {
    void saveActivities(
      activities.map((act) => (act.id === id ? { ...act, level } : act)),
    );
  }

  function removeSport(id: string) {
    if (expandedActivityId === id) expandedActivityId = null;
    void saveActivities(activities.filter((act) => act.id !== id));
  }

  // Sport order = priority, ranked from top to bottom, and drives how high a shared sport
  // ranks a profile in other users' Discover feeds (see getDiscoverFeed's `priority`).
  let rowEls = $state<(HTMLDivElement | null)[]>([]);
  let dragIndex = $state<number | null>(null);
  let dragOffsetY = $state(0);
  let dragStartClientY = 0;
  let dragBaseTop = 0;

  function startDrag(e: PointerEvent, index: number) {
    e.preventDefault();
    e.stopPropagation();
    expandedActivityId = null;
    dragIndex = index;
    dragOffsetY = 0;
    dragStartClientY = e.clientY;
    dragBaseTop = rowEls[index]?.offsetTop ?? 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  async function onDragMove(e: PointerEvent) {
    if (dragIndex === null) return;
    dragOffsetY = e.clientY - dragStartClientY;
    const draggedEl = rowEls[dragIndex];
    if (!draggedEl) return;
    const draggedCenter =
      dragBaseTop + dragOffsetY + draggedEl.offsetHeight / 2;

    let targetIndex = dragIndex;
    for (let i = 0; i < activities.length; i++) {
      if (i === dragIndex) continue;
      const el = rowEls[i];
      if (!el) continue;
      if (
        draggedCenter >= el.offsetTop &&
        draggedCenter < el.offsetTop + el.offsetHeight
      ) {
        targetIndex = i;
        break;
      }
    }
    if (targetIndex !== dragIndex) {
      const next = [...activities];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      activities = next;
      dragIndex = targetIndex;
      await tick();
      const newTop = rowEls[targetIndex]?.offsetTop;
      if (newTop !== undefined) {
        dragStartClientY += newTop - dragBaseTop;
        dragBaseTop = newTop;
      }
    }
  }

  function endDrag() {
    if (dragIndex === null) return;
    dragIndex = null;
    dragOffsetY = 0;
    void saveActivities(activities);
  }

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
    <h1 class="text-2xl font-black text-text">
      {$userProfile?.displayName ?? t.t("nav.profile")}{#if $userProfile?.age}, {$userProfile.age}{/if}
    </h1>
    <a
      href="/profile/edit"
      class="flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary active:scale-95"
    >
      <Pencil class="size-4" />
      {t.t("profile.edit")}
    </a>
  </div>

  <!-- Photos + basic info -->
  <PhotoGallery
    {photos}
    alt={$userProfile?.displayName ?? t.t("common.profilePhoto")}
  />
  <div class="flex flex-col gap-3 px-5 pb-6 pt-4">
    <div
      class="flex flex-col items-start gap-3 rounded-2xl bg-surface p-4 shadow-sm"
    >
      {#if $userProfile?.city}
        <p class="flex items-center gap-1 text-sm text-muted">
          <MapPin class="size-4" />
          {$userProfile.city}
        </p>
      {/if}
      {#if $userProfile?.bio}
        <p class="text-left text-sm text-muted text-balance">
          {$userProfile.bio}
        </p>
      {/if}
      {#if $authUser?.email}
        <p class="text-sm text-muted">{$authUser.email}</p>
      {/if}
      {#if $userProfile?.socialLinks?.length}
        <div class="flex flex-wrap gap-2">
          {#each $userProfile.socialLinks as link}
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={detectSocialPlatform(link).label}
              class="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary active:scale-95"
            >
              <SocialIcon url={link} class="size-4.5" />
            </a>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  {#if $isAdmin}
    <div
      class="mx-5 mb-6 flex flex-col gap-2 rounded-2xl bg-surface p-3 shadow-sm"
    >
      <p class="px-1 text-xs font-bold uppercase tracking-wide text-muted">
        Admin
      </p>
      <a
        href="/admin/fake-profiles"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 py-3 text-sm font-bold text-primary active:scale-95"
      >
        <ShieldUser class="size-4" />
        Fake profiles
      </a>
      <a
        href="/admin/users"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 py-3 text-sm font-bold text-primary active:scale-95"
      >
        <Users class="size-4" />
        Users profiles
      </a>
    </div>
  {/if}

  <!-- Activities -->
  <div class="px-5">
    <h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
      {t.t("common.mySports")}
    </h3>
    {#if activities.length === 0}
      <p class="mb-3 text-sm text-muted">
        {t.t("common.noActivities")}
      </p>
    {:else}
      <p class="mb-3 text-xs font-semibold text-muted text-balance">
        {t.t("sports.reorderHint")}
      </p>
      <div class="mb-3 flex flex-col gap-3">
        {#each activities as act, i (act.id)}
          {@const expanded = expandedActivityId === act.id}
          {@const dragging = dragIndex === i}
          <div
            bind:this={rowEls[i]}
            class="rounded-2xl bg-surface shadow-sm {dragging
              ? 'relative z-20 shadow-lg'
              : ''}"
            style={dragging
              ? `transform: translateY(${dragOffsetY}px)`
              : undefined}
          >
            <div
              role="button"
              tabindex="0"
              onclick={() => toggleExpandActivity(act.id)}
              onkeydown={(e) =>
                (e.key === "Enter" || e.key === " ") &&
                toggleExpandActivity(act.id)}
              class="flex items-center gap-4 p-4"
            >
              <button
                type="button"
                aria-label={t.t("common.dragToReorder")}
                onpointerdown={(e) => startDrag(e, i)}
                onpointermove={onDragMove}
                onpointerup={endDrag}
                onpointercancel={endDrag}
                onclick={(e) => e.stopPropagation()}
                class="touch-none text-muted active:cursor-grabbing"
              >
                <GripVertical class="size-5" />
              </button>
              <span
                class="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                <ActivityIcon id={act.id} class="size-5" />
              </span>
              <div class="flex-1">
                <p class="font-bold text-text">{t.activity(act.id)}</p>
                <p class="text-sm text-muted">
                  {#if act.format !== "all"}{t.format(act.format)}
                    <span class="px-1">·</span>
                  {/if}{t.skill(act.level)}
                </p>
              </div>
              {#if expanded}
                <button
                  onclick={(e) => {
                    e.stopPropagation();
                    removeSport(act.id);
                  }}
                  aria-label={`${t.t("common.removeSport")} ${t.activity(act.id)}`}
                  class="flex size-8 items-center justify-center rounded-full bg-error/10 text-error active:scale-95"
                >
                  <Trash2 class="size-4" />
                </button>
              {:else}
                <ChevronDown class="size-5 text-muted" />
              {/if}
            </div>
            {#if expanded}
              <div class="px-4 pb-4" transition:slide={{ duration: 200 }}>
                <p
                  class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted"
                >
                  {t.t("common.format")}
                </p>
                <div class="mb-3">
                  <SegmentedControl
                    options={formatOptions}
                    value={act.format}
                    ariaLabel={t.t("common.format")}
                    onchange={(value) => updateActivityFormat(act.id, value)}
                  />
                </div>
                <p
                  class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted"
                >
                  {t.t("common.level")}
                </p>
                <SegmentedControl
                  options={skillOptions}
                  value={act.level}
                  ariaLabel={t.t("common.level")}
                  onchange={(value) => updateActivityLevel(act.id, value)}
                />
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    {#if availableActivities.length === 0}
      <p class="text-sm text-muted">{t.t("profile.allSports")}</p>
    {:else if remainingSportSlots === 0}
      <p class="text-sm text-muted">
        {t.t("sports.maxReached", { max: maxSports })}
      </p>
    {:else}
      <a
        href="/profile/add-sport"
        class="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 py-3 text-sm font-bold text-primary active:scale-95"
      >
        <Plus class="size-4" />
        {t.t("profile.addSportButton")}
      </a>
    {/if}
  </div>

  <!-- Premium -->
  <div class="mt-auto px-5 pt-8">
    <a
      href="/premium"
      class="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-md active:scale-95"
    >
      <Crown class="size-5" />
      {$userProfile?.isPremium
        ? t.t("profile.premiumMember")
        : t.t("profile.goPremium")}
    </a>
  </div>

  <!-- Legal -->
  <div class="flex justify-center gap-4 px-5 pt-8 text-xs text-muted">
    <a href="/terms" class="underline">Terms of Service</a>
    <a href="/privacy" class="underline">Privacy Policy</a>
  </div>

  <!-- Logout -->
  <div class="px-5 pt-4">
    <button
      onclick={logout}
      class="mt-5 w-full rounded-2xl border-2 border-error/30 py-4 text-base font-semibold text-error active:scale-95"
    >
      {t.t("profile.signOut")}
    </button>
  </div>

  <BottomNav active="profile" />
</div>
