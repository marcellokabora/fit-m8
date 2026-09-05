<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { browser } from "$app/environment";
  import { authUser, userProfile } from "$lib/stores/auth";
  import {
    ACTIVITIES,
    GENDER_OPTIONS,
    ORIENTATIONS,
    BIO_MAX_LENGTH,
    DEFAULT_DISTANCE_KM,
    MAX_SPORTS_FREE,
    MIN_AGE,
    calculateAge,
    groupActivities,
    type DiscoverFilters,
    type UserActivity,
    type SkillLevel,
    type ActivityFormat,
    type SexualOrientation,
    type Gender,
  } from "$lib/types";
  import { get } from "svelte/store";
  import { isInBarcelona } from "$lib/location";
  import {
    ArrowLeft,
    ArrowRight,
    Bell,
    Check,
    Loader2,
    LogOut,
    MapPin,
    Search,
    Zap,
  } from "@lucide/svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import LocationPicker from "$lib/components/LocationPicker.svelte";
  import SegmentedControl from "$lib/components/SegmentedControl.svelte";
  import BirthdateField from "$lib/components/BirthdateField.svelte";
  import Toggle from "$lib/components/Toggle.svelte";
  import PhotoGrid from "$lib/components/PhotoGrid.svelte";
  import AppearancePicker from "$lib/components/AppearancePicker.svelte";
  import type { DiscoverPreset } from "$lib/components/DiscoverPresetPicker.svelte";
  import {
    requestPushToken,
    savePushToken,
    pushNotificationsSupported,
  } from "$lib/firebase/notifications";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  const TOTAL_STEPS = 3;
  const DRAFT_KEY = "fit-m8-onboarding-draft";

  type OnboardingDraft = {
    step: number;
    displayName: string;
    bio: string;
    birthdate: string;
    gender: Gender;
    sexualOrientation: SexualOrientation;
    isSingle: boolean;
    city: string;
    lat?: number;
    lng?: number;
    selectedActivities: string[];
    activitySettings: Record<
      string,
      { format: ActivityFormat; level: SkillLevel }
    >;
    discoverPreset: DiscoverPreset | null;
    photos: string[];
  };

  function loadDraft(): Partial<OnboardingDraft> {
    if (!browser) return {};
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  const draft = loadDraft();
  const urlStepParam = Number(page.url.searchParams.get("step"));
  let step = $state(
    urlStepParam >= 1 && urlStepParam <= TOTAL_STEPS
      ? urlStepParam
      : (draft.step ?? 1),
  );
  let stepContainer = $state<HTMLDivElement>();
  let t = $derived(createTranslator($activeLanguage));
  let genderOptions = $derived(
    GENDER_OPTIONS.map((option) => ({
      ...option,
      label: t.gender(option.value),
    })),
  );
  let orientationOptions = $derived(
    ORIENTATIONS.map((option) => ({
      ...option,
      label: t.orientation(option.value),
    })),
  );

  // Step 1 — Basic info
  // Never prefill from the Google account's display name — it's a full name, not just a first name
  let displayName = $state(draft.displayName ?? "");
  let nameHasSurname = $derived(/\s/.test(displayName.trim()));
  let bio = $state(draft.bio ?? "");
  let birthdate = $state(draft.birthdate ?? "");
  let age = $derived(birthdate ? calculateAge(birthdate) : 0);
  let isUnderage = $derived(birthdate !== "" && age < MIN_AGE);
  let gender = $state<Gender>(draft.gender ?? "male");
  let sexualOrientation = $state<SexualOrientation>(
    draft.sexualOrientation ?? "hetero",
  );
  let isSingle = $state(draft.isSingle ?? false);
  let city = $state(draft.city ?? "");
  let lat = $state<number | undefined>(draft.lat);
  let lng = $state<number | undefined>(draft.lng);
  // Launching in Barcelona only — blocks onboarding for anyone outside the metro area.
  let locationValid = $derived(city !== "" && isInBarcelona(lat, lng));
  let oppositeGender = $derived<Gender | "">(
    gender === "male" ? "female" : gender === "female" ? "male" : "",
  );

  // Step 2 — Activities (format/level default to "all"/"basic"; configurable later from the profile page)
  let selectedActivities = $state<string[]>(draft.selectedActivities ?? []);
  let activitySettings = $state<
    Record<string, { format: ActivityFormat; level: SkillLevel }>
  >(draft.activitySettings ?? {});
  let sportsQuery = $state("");
  let filteredActivities = $derived(
    sportsQuery.trim()
      ? ACTIVITIES.filter((a) =>
          t
            .activity(a.id)
            .toLowerCase()
            .includes(sportsQuery.trim().toLowerCase()),
        )
      : ACTIVITIES,
  );
  let groupedFilteredActivities = $derived(groupActivities(filteredActivities));

  // Which quick preset to land on Discover with (not currently set by any onboarding step)
  let discoverPreset = $state<DiscoverPreset | null>(
    draft.discoverPreset ?? null,
  );

  // Step 1 — Photo (a single one is enough) — never defaulted from the Google account photo
  let photos = $state<string[]>(draft.photos ?? []);
  let saving = $state(false);
  let error = $state("");
  let uid = $derived($authUser?.uid ?? "");

  // Step 3 — Push notification permission (not persisted in the draft; re-requesting
  // after a refresh is instant once the browser has already granted/denied it)
  let pushSupported = $state(false);
  let pushToken = $state<string | null>(null);
  let pushRequesting = $state(false);
  let pushDenied = $state(false);

  async function enableNotifications() {
    if (pushRequesting || pushToken) return;
    pushRequesting = true;
    pushToken = await requestPushToken();
    pushDenied = !pushToken;
    pushRequesting = false;
  }

  // Persist progress locally so leaving and coming back (or a refresh) restores it.
  $effect(() => {
    if (!browser) return;
    const data: OnboardingDraft = {
      step,
      displayName,
      bio,
      birthdate,
      gender,
      sexualOrientation,
      isSingle,
      city,
      lat,
      lng,
      selectedActivities,
      activitySettings,
      discoverPreset,
      photos,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  });

  // Which way the step transition should slide: 1 = advancing, -1 = going back.
  let direction = $state(1);

  // Drives step from the URL so browser back/forward move between onboarding steps.
  $effect(() => {
    const urlStep = Number(page.url.searchParams.get("step"));
    if (
      urlStep >= 1 &&
      urlStep <= TOTAL_STEPS &&
      urlStep !== untrack(() => step)
    ) {
      direction = urlStep < untrack(() => step) ? -1 : 1;
      step = urlStep;
    }
  });

  // The step content lives in an inner scroll container (not the window), so switching
  // steps needs an explicit scroll reset or it keeps the previous step's scroll position.
  $effect(() => {
    step;
    stepContainer?.scrollTo(0, 0);
  });

  onMount(() => {
    if (page.url.searchParams.get("step") !== String(step)) {
      const url = new URL(page.url);
      url.searchParams.set("step", String(step));
      goto(url, { replaceState: true, keepFocus: true, noScroll: true });
    }
    pushNotificationsSupported().then(
      (supported) => (pushSupported = supported),
    );
  });

  function pushStepUrl() {
    const url = new URL(page.url);
    url.searchParams.set("step", String(step));
    goto(url, { keepFocus: true, noScroll: true });
  }

  function toggleActivity(id: string) {
    if (selectedActivities.includes(id)) {
      selectedActivities = selectedActivities.filter((a) => a !== id);
      delete activitySettings[id];
    } else if (selectedActivities.length < MAX_SPORTS_FREE) {
      selectedActivities = [...selectedActivities, id];
      activitySettings[id] = { format: "all", level: "basic" };
    }
  }

  function next() {
    if (step < TOTAL_STEPS) {
      direction = 1;
      step++;
      pushStepUrl();
    }
  }

  function back() {
    // Native history keeps the URL step and the browser's own back/forward buttons in sync.
    direction = -1;
    if (step > 1) history.back();
  }

  // Step 1 has no previous step to go back to — sign out instead so the user can
  // return to the homepage to switch language or log in with a different account.
  function exitOnboarding() {
    localStorage.removeItem(DRAFT_KEY);
    authUser.signOut();
    goto("/", { replaceState: true });
  }

  // Only allow jumping back to an already-completed step, not skipping ahead unvalidated ones.
  // In dev mode, allow jumping to any step (forward included) to speed up manual testing.
  function goToStep(target: number) {
    if (target === step) return;
    if (import.meta.env.DEV || target < step) {
      direction = target < step ? -1 : 1;
      step = target;
      pushStepUrl();
    }
  }

  async function save() {
    error = "";
    // Belt-and-suspenders: the Continue button already blocks this, but step can be
    // reached directly via the ?step= URL param, so re-check before writing to Firestore.
    if (!birthdate || age < MIN_AGE) {
      step = 1;
      pushStepUrl();
      return;
    }
    if (!locationValid) {
      step = 3;
      pushStepUrl();
      return;
    }
    if (selectedActivities.length === 0) {
      step = 2;
      pushStepUrl();
      return;
    }
    if (!pushToken) return;
    saving = true;
    const user = get(authUser);
    if (!user) return;

    const activities: UserActivity[] = selectedActivities.map((id) => ({
      id,
      ...activitySettings[id],
    }));

    const discoverFilters: DiscoverFilters | undefined = discoverPreset
      ? {
          activities: [],
          format: discoverPreset === "dating" ? "1v1" : "",
          level: discoverPreset === "trainer" ? "expert" : "",
          gender:
            discoverPreset === "dating"
              ? oppositeGender
              : discoverPreset === "friends"
                ? gender
                : "",
          orientation: discoverPreset === "trainer" ? "" : sexualOrientation,
          minAge: null,
          maxAge: null,
          maxDistanceKm: DEFAULT_DISTANCE_KM,
          single: discoverPreset === "dating" ? "yes" : "",
          trainer: discoverPreset === "trainer" ? "yes" : "",
        }
      : undefined;

    try {
      await userProfile.save(user.uid, {
        displayName,
        bio,
        age,
        gender,
        orientation: sexualOrientation,
        isSingle,
        city,
        lat,
        lng,
        photos,
        photoURL: photos[0] || "",
        activities,
        emailVerified: user.emailVerified,
        discoverFilters,
      });
      if (pushToken) await savePushToken(user.uid, pushToken);
      localStorage.removeItem(DRAFT_KEY);
      // The chosen preset drives the initial Discover feed, so land there directly
      goto("/discover");
    } catch (e: any) {
      error = e.message;
    } finally {
      saving = false;
    }
  }
</script>

<div class="relative flex h-dvh flex-col overflow-hidden bg-bg">
  <!-- Progress -->
  <div class="shrink-0 px-6 pt-10">
    <div class="mb-8 flex items-center gap-2">
      {#each Array(TOTAL_STEPS) as _, i}
        <button
          type="button"
          onclick={() => goToStep(i + 1)}
          disabled={!import.meta.env.DEV && i + 1 >= step}
          aria-label={`Step ${i + 1}`}
          aria-current={i + 1 === step ? "step" : undefined}
          class="h-1.5 flex-1 rounded-full transition-all disabled:cursor-default {i +
            1 <=
          step
            ? 'bg-primary'
            : 'bg-gray-200'}"
        ></button>
      {/each}
    </div>
  </div>

  <div
    bind:this={stepContainer}
    class="hide-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pb-28"
  >
    {#key step}
      <div
        in:fly|local={{ x: direction * 32, duration: 220, easing: quintOut }}
        out:fly|local={{ x: direction * -32, duration: 150, easing: quintOut }}
      >
        {#if step === 1}
          <h2 class="mb-1 text-2xl font-black text-text">
            {t.t("onboarding.aboutYou")}
          </h2>
          <p class="mb-6 text-sm text-muted">
            {t.t("onboarding.aboutYouHint")}
          </p>
          <div class="flex flex-col gap-4">
            <div>
              <!-- <p class="mb-2 text-sm font-bold text-text">
            {t.t("onboarding.profilePhotos")}
          </p> -->
              <PhotoGrid
                {photos}
                {uid}
                firstRequired
                onchange={(next) => (photos = next)}
              />
            </div>
            <div>
              <input
                type="text"
                bind:value={displayName}
                placeholder={t.t("onboarding.name")}
                class="w-full rounded-2xl border-2 bg-surface px-4 py-4 text-base text-text outline-none focus:border-primary {nameHasSurname
                  ? 'border-error'
                  : 'border-border'}"
              />
              {#if nameHasSurname}
                <p class="mt-2 text-xs font-semibold text-error">
                  {t.t("onboarding.nameError")}
                </p>
              {/if}
            </div>
            <textarea
              bind:value={bio}
              placeholder={t.t("onboarding.bioOptional")}
              rows={3}
              maxlength={BIO_MAX_LENGTH}
              class="rounded-2xl border-2 border-border bg-surface px-4 py-4 text-base text-text outline-none focus:border-primary"
            ></textarea>
            <p class="-mt-3 text-right text-xs text-muted">
              {bio.length}/{BIO_MAX_LENGTH}
            </p>
            <BirthdateField
              bind:value={birthdate}
              label={t.t("onboarding.birthdate")}
              underageMessage={t.t("onboarding.underageError")}
            />
            <SegmentedControl
              options={genderOptions}
              value={gender}
              ariaLabel={t.t("common.gender")}
              onchange={(value) => (gender = value)}
              size="lg"
            />
            <div>
              <SegmentedControl
                options={orientationOptions}
                value={sexualOrientation}
                ariaLabel={t.t("common.orientation")}
                onchange={(value) => (sexualOrientation = value)}
                size="lg"
              />
            </div>
            <div
              class="flex items-center justify-between rounded-2xl border-2 border-border bg-surface px-4 py-4"
            >
              <p class="text-sm font-semibold text-text">
                {t.t("profile.single")}
              </p>
              <Toggle
                checked={isSingle}
                ariaLabel={t.t("profile.single")}
                onchange={(value) => (isSingle = value)}
              />
            </div>
          </div>
        {:else if step === 2}
          <h2 class="mb-1 text-2xl font-black text-text">
            {t.t("onboarding.yourSports")}
          </h2>
          <p class="mb-1 text-sm text-muted">{t.t("onboarding.sportsHint")}</p>
          <p class="mb-4 text-xs font-semibold text-muted">
            {t.t("sports.maxHint", { max: MAX_SPORTS_FREE })}
          </p>
          <div class="sticky top-0 z-10 -mx-6 bg-bg px-6 pb-4">
            <div class="relative">
              <Search
                class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                bind:value={sportsQuery}
                placeholder={t.t("common.search")}
                class="w-full rounded-2xl border-2 border-border bg-surface py-2.5 pl-9 pr-3 text-sm font-semibold text-text placeholder:text-muted focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          {#if filteredActivities.length === 0}
            <p class="mt-6 text-center text-sm text-muted">
              {t.t("common.noResults")}
            </p>
          {:else}
            {#each groupedFilteredActivities as section}
              <p
                class="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-muted first:mt-1"
              >
                {section.group
                  ? t.activityGroup(section.group)
                  : t.t("common.other")}
              </p>
              <div class="grid grid-cols-2 gap-3 pt-1">
                {#each section.items as activity}
                  {@const selected = selectedActivities.includes(activity.id)}
                  <button
                    onclick={() => toggleActivity(activity.id)}
                    disabled={!selected &&
                      selectedActivities.length >= MAX_SPORTS_FREE}
                    class="flex flex-col items-center gap-2 rounded-2xl border-2 py-5 transition-all active:scale-95 disabled:opacity-40 {selected
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-surface'}"
                  >
                    <ActivityIcon
                      id={activity.id}
                      class="size-7 text-primary"
                    />
                    <span class="text-sm font-semibold text-text"
                      >{t.activity(activity.id)}</span
                    >
                  </button>
                {/each}
              </div>
            {/each}
          {/if}
        {:else if step === 3}
          <h2 class="mb-1 text-2xl font-black text-text">
            {t.t("onboarding.makeItYours")}
          </h2>
          <p class="mb-6 text-sm text-muted text-balance">
            {t.t("onboarding.appearanceHint")}
          </p>
          <div class="mb-4 flex flex-col gap-4">
            <div class="rounded-2xl border-2 border-border bg-surface p-4">
              <div class="mb-3 flex items-center gap-3">
                <span
                  class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                >
                  <MapPin class="size-5" />
                </span>
                <div class="flex-1">
                  <p class="font-bold text-text">
                    {t.t("onboarding.locationTitle")}
                  </p>
                  <p class="text-sm text-muted">
                    {t.t("onboarding.locationHint")}
                  </p>
                </div>
              </div>
              <LocationPicker bind:city bind:lat bind:lng />
              {#if city && !locationValid}
                <p class="mt-2 text-xs font-medium text-red-500">
                  {t.t("location.outsideBarcelona")}
                </p>
              {/if}
            </div>
            {#if pushSupported}
              <div class="rounded-2xl border-2 border-border bg-surface p-4">
                <div class="mb-3 flex items-center gap-3">
                  <span
                    class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                  >
                    <Bell class="size-5" />
                  </span>
                  <div class="flex-1">
                    <p class="font-bold text-text">
                      {t.t("onboarding.notificationsTitle")}
                    </p>
                    <p class="text-sm text-muted">
                      {t.t("onboarding.notificationsHint")}
                    </p>
                  </div>
                </div>
                {#if pushToken}
                  <div
                    class="flex items-center gap-2 rounded-2xl border-2 border-primary bg-primary/10 px-4 py-4 text-sm font-semibold text-primary"
                  >
                    <Check class="size-5 shrink-0" />
                    {t.t("onboarding.notificationsEnabled")}
                  </div>
                {:else}
                  <button
                    type="button"
                    onclick={enableNotifications}
                    disabled={pushRequesting}
                    class="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface px-4 py-4 text-sm font-semibold text-primary transition-colors active:scale-95 disabled:opacity-40"
                  >
                    {#if pushRequesting}
                      <Loader2 class="size-5 animate-spin" />
                      {t.t("common.loading")}
                    {:else}
                      <Bell class="size-5" />
                      {t.t("onboarding.enableNotifications")}
                    {/if}
                  </button>
                  {#if pushDenied}
                    <p class="mt-2 text-xs text-muted">
                      {t.t("onboarding.notificationsBlocked")}
                    </p>
                  {/if}
                {/if}
              </div>
            {/if}
          </div>
          <AppearancePicker />
          {#if error}
            <p class="mt-4 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </p>
          {/if}
        {/if}
      </div>
    {/key}
  </div>

  <!-- Navigation -->
  <div
    class="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full gap-3 border-t border-border bg-bg px-6 py-4 pb-safe md:max-w-md"
  >
    {#if step > 1}
      <button
        onclick={back}
        class="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-border py-4 text-base font-semibold text-text active:scale-95"
      >
        <ArrowLeft class="size-5" />
        {t.t("common.back")}
      </button>
    {:else}
      <button
        onclick={exitOnboarding}
        class="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-border py-4 text-base font-semibold text-text active:scale-95"
      >
        <LogOut class="size-5" />
        {t.t("profile.signOut")}
      </button>
    {/if}
    {#if step < TOTAL_STEPS}
      <button
        onclick={next}
        disabled={(step === 1 &&
          (!displayName ||
            !birthdate ||
            isUnderage ||
            nameHasSurname ||
            photos.length === 0)) ||
          (step === 2 && selectedActivities.length === 0)}
        class="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-md active:scale-95 disabled:opacity-40"
      >
        {t.t("common.continue")}
        <ArrowRight class="size-5" />
      </button>
    {:else}
      <button
        onclick={save}
        disabled={saving || !locationValid || !pushToken}
        class="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-md active:scale-95 disabled:opacity-40"
      >
        {saving ? t.t("common.saving") : t.t("common.letsGo")}
        {#if saving}
          <Loader2 class="size-5 animate-spin" />
        {:else}
          <Zap class="size-5" />
        {/if}
      </button>
    {/if}
  </div>
</div>
