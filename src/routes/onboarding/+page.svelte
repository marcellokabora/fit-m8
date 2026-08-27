<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { browser } from "$app/environment";
  import { authUser, userProfile } from "$lib/stores/auth";
  import {
    ACTIVITIES,
    ACTIVITY_FORMAT_OPTIONS,
    GENDER_OPTIONS,
    ORIENTATIONS,
    SKILL_LEVEL_OPTIONS,
    BIO_MAX_LENGTH,
    DEFAULT_DISTANCE_KM,
    MAX_SPORTS_FREE,
    MIN_AGE,
    calculateAge,
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
    Bell,
    Check,
    GraduationCap,
    Heart,
    MapPin,
    Users,
    Zap,
  } from "@lucide/svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import LocationPicker from "$lib/components/LocationPicker.svelte";
  import SegmentedControl from "$lib/components/SegmentedControl.svelte";
  import Toggle from "$lib/components/Toggle.svelte";
  import PhotoGrid from "$lib/components/PhotoGrid.svelte";
  import AppearancePicker from "$lib/components/AppearancePicker.svelte";
  import {
    requestPushToken,
    savePushToken,
    pushNotificationsSupported,
  } from "$lib/firebase/notifications";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  const TOTAL_STEPS = 6;
  const DRAFT_KEY = "fit-m8-onboarding-draft";

  const HOW_IT_WORKS = [
    { key: "dating", preset: "dating", icon: Heart },
    { key: "friends", preset: "friends", icon: Users },
    { key: "experts", preset: "trainer", icon: GraduationCap },
  ] as const;

  type DiscoverPreset = (typeof HOW_IT_WORKS)[number]["preset"];

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
  // Google sign-in already carries a name + profile photo — reuse them as defaults below
  const googleAccount = get(authUser);
  const urlStepParam = Number(page.url.searchParams.get("step"));
  let step = $state(
    urlStepParam >= 1 && urlStepParam <= TOTAL_STEPS
      ? urlStepParam
      : (draft.step ?? 1),
  );
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

  // Step 1 — Basic info
  let displayName = $state(
    draft.displayName ?? googleAccount?.displayName ?? "",
  );
  let bio = $state(draft.bio ?? "");
  let birthdate = $state(draft.birthdate ?? "");
  let age = $derived(birthdate ? calculateAge(birthdate) : 0);
  // Native date input max — caps the picker at the most recent day someone could turn MIN_AGE
  let maxBirthdate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - MIN_AGE);
    return d.toISOString().slice(0, 10);
  })();
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

  // Step 2 — Activities
  let selectedActivities = $state<string[]>(draft.selectedActivities ?? []);

  // Step 3 — For each selected activity: format + level
  let activitySettings = $state<
    Record<string, { format: ActivityFormat; level: SkillLevel }>
  >(draft.activitySettings ?? {});

  // Step 4 — Which quick preset to land on Discover with
  let discoverPreset = $state<DiscoverPreset | null>(
    draft.discoverPreset ?? null,
  );

  // Step 5 — Photos (optional, up to 3) — default slot 1 to the Google account photo
  let photos = $state<string[]>(
    draft.photos ?? (googleAccount?.photoURL ? [googleAccount.photoURL] : []),
  );
  let saving = $state(false);
  let error = $state("");
  let uid = $derived($authUser?.uid ?? "");

  // Step 1 — Push notification permission (not persisted in the draft; re-requesting
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

  // Drives step from the URL so browser back/forward move between onboarding steps.
  $effect(() => {
    const urlStep = Number(page.url.searchParams.get("step"));
    if (
      urlStep >= 1 &&
      urlStep <= TOTAL_STEPS &&
      urlStep !== untrack(() => step)
    ) {
      step = urlStep;
    }
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
      step++;
      pushStepUrl();
    }
  }

  function back() {
    // Native history keeps the URL step and the browser's own back/forward buttons in sync.
    if (step > 1) history.back();
  }

  async function save() {
    error = "";
    // Belt-and-suspenders: the Continue button already blocks this, but step can be
    // reached directly via the ?step= URL param, so re-check before writing to Firestore.
    if (!birthdate || age < MIN_AGE || !locationValid) {
      step = 1;
      pushStepUrl();
      return;
    }
    if (selectedActivities.length === 0) {
      step = 2;
      pushStepUrl();
      return;
    }
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
        photoURL: photos[0] || user.photoURL || "",
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

<div class="flex h-dvh flex-col overflow-hidden bg-bg">
  <!-- Progress -->
  <div class="shrink-0 px-6 pt-10">
    <div class="mb-8 flex items-center gap-2">
      {#each Array(TOTAL_STEPS) as _, i}
        <div
          class="h-1.5 flex-1 rounded-full transition-all {i + 1 <= step
            ? 'bg-primary'
            : 'bg-gray-200'}"
        ></div>
      {/each}
    </div>
  </div>

  <div class="min-h-0 flex-1 overflow-y-auto px-6 pb-28">
    {#if step === 1}
      <h2 class="mb-1 text-2xl font-black text-text">
        {t.t("onboarding.aboutYou")}
      </h2>
      <p class="mb-6 text-sm text-muted">{t.t("onboarding.aboutYouHint")}</p>
      <div class="flex flex-col gap-4">
        <input
          type="text"
          bind:value={displayName}
          placeholder={t.t("onboarding.name")}
          class="rounded-2xl border-2 border-border bg-surface px-4 py-4 text-base text-text outline-none focus:border-primary"
        />
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
        <div>
          <div
            class="flex items-center justify-between rounded-2xl border-2 bg-surface px-4 py-4 {isUnderage
              ? 'border-error'
              : 'border-border'}"
          >
            <label
              for="onboarding-birthdate"
              class="text-sm font-semibold text-text"
            >
              {t.t("onboarding.birthdate")}
            </label>
            <input
              id="onboarding-birthdate"
              type="date"
              bind:value={birthdate}
              max={maxBirthdate}
              class="bg-transparent text-right text-base text-text outline-none"
            />
          </div>
          {#if isUnderage}
            <p class="mt-2 text-xs font-semibold text-error">
              {t.t("onboarding.underageError")}
            </p>
          {/if}
        </div>
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
          <p class="text-sm font-semibold text-text">{t.t("profile.single")}</p>
          <Toggle
            checked={isSingle}
            ariaLabel={t.t("profile.single")}
            onchange={(value) => (isSingle = value)}
          />
        </div>
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
              <p class="flex items-center gap-1 text-xs font-bold text-primary">
                <Check class="size-4" />
                {t.t("onboarding.notificationsEnabled")}
              </p>
            {:else}
              <button
                type="button"
                onclick={enableNotifications}
                disabled={pushRequesting}
                class="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white active:scale-95 disabled:opacity-40"
              >
                {pushRequesting
                  ? t.t("common.loading")
                  : t.t("onboarding.enableNotifications")}
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
    {:else if step === 2}
      <h2 class="mb-1 text-2xl font-black text-text">
        {t.t("onboarding.yourSports")}
      </h2>
      <p class="mb-1 text-sm text-muted">{t.t("onboarding.sportsHint")}</p>
      <p class="mb-6 text-xs font-semibold text-muted">
        {t.t("sports.maxHint", { max: MAX_SPORTS_FREE })}
      </p>
      <div class="grid grid-cols-2 gap-3">
        {#each ACTIVITIES as activity}
          {@const selected = selectedActivities.includes(activity.id)}
          <button
            onclick={() => toggleActivity(activity.id)}
            disabled={!selected && selectedActivities.length >= MAX_SPORTS_FREE}
            class="flex flex-col items-center gap-2 rounded-2xl border-2 py-5 transition-all active:scale-95 disabled:opacity-40 {selected
              ? 'border-primary bg-primary/10'
              : 'border-border bg-surface'}"
          >
            <ActivityIcon id={activity.id} class="size-7 text-primary" />
            <span class="text-sm font-semibold text-text"
              >{t.activity(activity.id)}</span
            >
          </button>
        {/each}
      </div>
      {#if selectedActivities.length === 0}
        <p class="mt-4 text-xs font-semibold text-error">
          {t.t("onboarding.selectAtLeastOneSport")}
        </p>
      {/if}
    {:else if step === 3}
      <h2 class="mb-1 text-2xl font-black text-text">
        {t.t("onboarding.yourSettings")}
      </h2>
      <p class="mb-6 text-sm text-muted">{t.t("onboarding.settingsHint")}</p>
      <div class="flex flex-col gap-5">
        {#each selectedActivities as id}
          {@const activity = ACTIVITIES.find((a) => a.id === id)}
          {@const settings = activitySettings[id]}
          <div class="rounded-2xl border-2 border-border bg-surface p-4">
            <p class="mb-3 flex items-center gap-2 font-bold text-text">
              <ActivityIcon {id} class="size-4 text-primary" />
              {activity ? t.activity(activity.id) : t.activity(id)}
            </p>
            <div class="mb-3">
              <p
                class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted"
              >
                {t.t("common.format")}
              </p>
              <SegmentedControl
                options={formatOptions}
                value={settings.format}
                ariaLabel={t.t("common.format")}
                onchange={(value) => (activitySettings[id].format = value)}
              />
            </div>
            <div>
              <p
                class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted"
              >
                {t.t("common.level")}
              </p>
              <div class="flex gap-2">
                {#each skillOptions as level}
                  <button
                    onclick={() =>
                      (activitySettings[id].level = level.value as SkillLevel)}
                    class="flex-1 rounded-xl border-2 py-2 text-xs font-bold transition-colors {settings.level ===
                    level.value
                      ? 'border-primary-dark bg-primary text-white'
                      : 'border-border text-muted'}"
                  >
                    {t.skill(level.value)}
                  </button>
                {/each}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else if step === 4}
      <h2 class="mb-1 text-2xl font-black text-text">
        {t.t("onboarding.howItWorks")}
      </h2>
      <p class="mb-6 text-sm text-muted">
        {t.t("onboarding.howItWorksHint")}
      </p>
      <div
        class="flex flex-col gap-4"
        role="radiogroup"
        aria-label={t.t("onboarding.howItWorks")}
      >
        {#each HOW_IT_WORKS as slide}
          {@const selected = discoverPreset === slide.preset}
          <button
            type="button"
            onclick={() => (discoverPreset = slide.preset)}
            role="radio"
            aria-checked={selected}
            class="flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors {selected
              ? 'border-primary bg-primary/10'
              : 'border-border bg-surface'}"
          >
            <span
              class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <slide.icon class="size-5" />
            </span>
            <div class="flex-1">
              <p class="font-bold text-text">
                {t.t(`intro.${slide.key}.title`)}
              </p>
              <p class="text-sm text-muted">
                {t.t(`intro.${slide.key}.body`)}
              </p>
            </div>
            <!-- Radio indicator — makes clear only one of these can be picked, and it must be tapped to check it -->
            <span
              aria-hidden="true"
              class="flex size-6 shrink-0 items-center justify-center rounded-full border-2 {selected
                ? 'border-primary bg-primary'
                : 'border-border'}"
            >
              {#if selected}
                <Check class="size-3.5 text-white" />
              {/if}
            </span>
          </button>
        {/each}
      </div>
    {:else if step === 5}
      <h2 class="mb-1 text-2xl font-black text-text">
        {t.t("onboarding.profilePhotos")}
      </h2>
      <p class="mb-6 text-sm text-muted">
        {t.t("onboarding.photosHint")}
      </p>
      <div class="flex flex-1 flex-col items-center justify-center gap-4">
        <div class="w-full">
          <PhotoGrid {photos} {uid} onchange={(next) => (photos = next)} />
        </div>
      </div>
    {:else if step === 6}
      <h2 class="mb-1 text-2xl font-black text-text">
        {t.t("onboarding.makeItYours")}
      </h2>
      <p class="mb-6 text-sm text-muted">{t.t("onboarding.appearanceHint")}</p>
      <AppearancePicker />
      {#if error}
        <p class="mt-4 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      {/if}
    {/if}
  </div>

  <!-- Navigation -->
  <div
    class="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full gap-3 border-t border-border bg-bg px-6 py-4 pb-safe md:max-w-md"
  >
    {#if step > 1}
      <button
        onclick={back}
        class="flex-1 rounded-2xl border-2 border-border py-4 text-base font-semibold text-text active:scale-95"
      >
        {t.t("common.back")}
      </button>
    {/if}
    {#if step < TOTAL_STEPS}
      <button
        onclick={next}
        disabled={(step === 1 &&
          (!displayName || !birthdate || isUnderage || !locationValid)) ||
          (step === 2 && selectedActivities.length === 0) ||
          (step === 4 && !discoverPreset)}
        class="flex-1 rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-md active:scale-95 disabled:opacity-40"
      >
        {t.t("common.continue")}
      </button>
    {:else}
      <button
        onclick={save}
        disabled={saving}
        class="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-md active:scale-95 disabled:opacity-40"
      >
        {saving ? t.t("common.saving") : t.t("common.letsGo")}
        {#if !saving}
          <Zap class="size-5" />
        {/if}
      </button>
    {/if}
  </div>
</div>
