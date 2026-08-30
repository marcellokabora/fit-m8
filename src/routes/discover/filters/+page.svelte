<script lang="ts">
  import { goto } from "$app/navigation";
  import { get } from "svelte/store";
  import BackHeader from "$lib/components/BackHeader.svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import SegmentedControl from "$lib/components/SegmentedControl.svelte";
  import PresetHint from "$lib/components/PresetHint.svelte";
  import {
    authUser,
    userProfile,
    filterActivities,
    filterFormat,
    filterLevel,
    filterGender,
    filterSexualOrientation,
    filterMinAge,
    filterMaxAge,
    filterMaxDistanceKm,
    filterSingle,
    filterTrainer,
  } from "$lib/stores/auth";
  import { getDiscoverFeed } from "$lib/firebase/swipe";
  import { Loader2, RotateCcw, Users, Heart, UserShield } from "@lucide/svelte";
  import {
    ACTIVITIES,
    GENDER_OPTIONS,
    ORIENTATIONS,
    SKILL_LEVEL_OPTIONS,
    type ActivityFormat,
    type Gender,
    type SexualOrientation,
    type SkillLevel,
    type YesNoFilter,
  } from "$lib/types";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let t = $derived(createTranslator($activeLanguage));

  const FORMAT_FILTER_OPTIONS = [
    { value: "", label: "" },
    { value: "1v1", label: "1v1" },
    { value: "2v2", label: "2v2" },
    { value: "group", label: "4+" },
  ] as const;

  const GENDER_FILTER_OPTIONS = [
    { value: "", label: "" },
    ...GENDER_OPTIONS,
  ] as const;

  const LEVEL_FILTER_OPTIONS = [
    { value: "", label: "" },
    ...SKILL_LEVEL_OPTIONS,
  ] as const;

  const SEX_FILTER_OPTIONS = [
    { value: "", label: "" },
    ...ORIENTATIONS,
  ] as const;

  const YES_NO_FILTER_OPTIONS = [
    { value: "", label: "" },
    { value: "yes", label: "" },
    { value: "no", label: "" },
  ] as const;

  let formatFilterOptions = $derived(
    FORMAT_FILTER_OPTIONS.map((option) => ({
      ...option,
      label: option.value ? t.format(option.value) : t.t("common.all"),
    })),
  );
  let genderFilterOptions = $derived(
    GENDER_FILTER_OPTIONS.map((option) => ({
      ...option,
      label: option.value ? t.gender(option.value) : t.t("common.all"),
    })),
  );
  let levelFilterOptions = $derived(
    LEVEL_FILTER_OPTIONS.map((option) => ({
      ...option,
      label: option.value ? t.skill(option.value) : t.t("common.all"),
    })),
  );
  let sexFilterOptions = $derived(
    SEX_FILTER_OPTIONS.map((option) => ({
      ...option,
      label: option.value ? t.orientation(option.value) : t.t("common.all"),
    })),
  );
  let yesNoFilterOptions = $derived(
    YES_NO_FILTER_OPTIONS.map((option) => ({
      ...option,
      label:
        option.value === ""
          ? t.t("common.all")
          : option.value === "yes"
            ? t.t("common.yes")
            : t.t("common.no"),
    })),
  );

  const AGE_MIN = 18;
  const AGE_MAX = 60;

  let profileActivities = $derived(
    ($userProfile?.activities ?? [])
      .map((profileActivity) =>
        ACTIVITIES.find((activity) => activity.id === profileActivity.id),
      )
      .filter((activity) => activity !== undefined),
  );
  let hasCoords = $derived(
    $userProfile?.lat !== undefined && $userProfile?.lng !== undefined,
  );

  // Used by the Dating/Friends/Trainer quick-preset buttons in the header
  let myGender: Gender | "" = $derived($userProfile?.gender ?? "");
  let oppositeGender: Gender | "" = $derived(
    myGender === "male" ? "female" : myGender === "female" ? "male" : "",
  );
  let myOrientation = $derived($userProfile?.orientation ?? "hetero");

  // This page edits its own drafts only; the shared filter stores (which drive the
  // discover feed) are updated in one shot when "Save" is pressed, not while editing.
  let draftFormat = $state<Exclude<ActivityFormat, "all"> | "">(
    get(filterFormat),
  );
  let draftLevel = $state<SkillLevel | "">(get(filterLevel));
  let draftGender = $state<Gender | "">(get(filterGender));
  let draftOrientation = $state<SexualOrientation | "">(
    get(filterSexualOrientation),
  );
  let ageMinDraft = $state(get(filterMinAge) ?? AGE_MIN);
  let ageMaxDraft = $state(get(filterMaxAge) ?? AGE_MAX);
  let distanceDraft = $state<number | null>(get(filterMaxDistanceKm));
  let draftActivities = $state<string[]>(get(filterActivities));
  let draftSingle = $state<YesNoFilter>(get(filterSingle));
  let draftTrainer = $state<YesNoFilter>(get(filterTrainer));

  function updateAgeMinDraft(value: number) {
    ageMinDraft = Math.min(value, ageMaxDraft);
  }

  function updateAgeMaxDraft(value: number) {
    ageMaxDraft = Math.max(value, ageMinDraft);
  }

  function pickActivity(id: string) {
    if (id === "") {
      draftActivities = [];
      return;
    }
    draftActivities = draftActivities.includes(id)
      ? draftActivities.filter((activityId) => activityId !== id)
      : [...draftActivities, id];
  }

  let isDatingPreset = $derived(
    draftFormat === "1v1" &&
      draftLevel === "" &&
      draftGender === oppositeGender &&
      draftOrientation === myOrientation &&
      draftSingle === "yes" &&
      draftTrainer === "",
  );
  let isFriendsPreset = $derived(
    draftFormat === "" &&
      draftLevel === "" &&
      draftGender === myGender &&
      draftOrientation === myOrientation &&
      draftSingle === "" &&
      draftTrainer === "",
  );
  let isTrainerPreset = $derived(
    draftFormat === "" &&
      draftLevel === "expert" &&
      draftGender === "" &&
      draftOrientation === "" &&
      draftSingle === "" &&
      draftTrainer === "yes",
  );

  // Quick presets shown as buttons in the header; each resets sport selection to "any"
  function applyDatingPreset() {
    draftActivities = [];
    draftFormat = "1v1";
    draftLevel = "";
    draftGender = oppositeGender;
    draftOrientation = myOrientation;
    draftSingle = "yes";
    draftTrainer = "";
  }

  function applyFriendsPreset() {
    draftActivities = [];
    draftFormat = "";
    draftLevel = "";
    draftGender = myGender;
    draftOrientation = myOrientation;
    draftSingle = "";
    draftTrainer = "";
  }

  function applyTrainerPreset() {
    draftActivities = [];
    draftFormat = "";
    draftLevel = "expert";
    draftGender = "";
    draftOrientation = "";
    draftSingle = "";
    draftTrainer = "yes";
  }

  function resetFilters() {
    draftActivities = [];
    draftFormat = "";
    draftLevel = "";
    draftGender = "";
    draftOrientation = "";
    ageMinDraft = AGE_MIN;
    ageMaxDraft = AGE_MAX;
    distanceDraft = null;
    draftSingle = "";
    draftTrainer = "";
  }

  // Live count of profiles matching the in-progress draft filters, shown inside the Save button.
  let previewCount = $state(0);
  let previewLoading = $state(false);
  let previewToken = 0;
  let previewDebounce: ReturnType<typeof setTimeout> | undefined;
  let saveLabel = $derived(
    previewCount === 0
      ? t.t("discover.matchNone")
      : previewCount === 1
        ? t.t("discover.matchOne")
        : t.t("discover.matchMany", { count: previewCount }),
  );

  async function updatePreviewCount() {
    const uid = get(authUser)?.uid;
    if (!uid) {
      previewLoading = false;
      return;
    }
    const token = ++previewToken;
    previewLoading = true;
    const profile = get(userProfile);
    const results = await getDiscoverFeed(
      uid,
      (profile?.activities ?? []).map((a) => a.id),
      draftActivities,
      draftFormat,
      draftLevel,
      draftGender,
      draftOrientation,
      ageMinDraft === AGE_MIN ? null : ageMinDraft,
      ageMaxDraft === AGE_MAX ? null : ageMaxDraft,
      distanceDraft,
      { lat: profile?.lat, lng: profile?.lng },
      draftSingle,
      draftTrainer,
    );
    if (token === previewToken) {
      previewCount = results.length;
      previewLoading = false;
    }
  }

  // Age/distance are dragged sliders: querying on every "input" tick would fire on
  // every pixel of movement, so those trigger the query on "change" (release) instead
  // via triggerPreviewUpdate below, not through this effect.
  $effect(() => {
    // Referenced so this effect reruns whenever any draft filter changes.
    draftActivities;
    draftFormat;
    draftLevel;
    draftGender;
    draftOrientation;
    draftSingle;
    draftTrainer;
    triggerPreviewUpdate();
  });

  function triggerPreviewUpdate() {
    previewLoading = true;
    clearTimeout(previewDebounce);
    previewDebounce = setTimeout(updatePreviewCount, 300);
  }

  // Called on slider "change" (release), not "input" (drag), so the query fires once
  // when the user stops moving the slider instead of on every intermediate value.
  function onSliderRelease() {
    clearTimeout(previewDebounce);
    previewLoading = true;
    updatePreviewCount();
  }

  async function applyAndBack() {
    filterActivities.set(draftActivities);
    filterFormat.set(draftFormat);
    filterLevel.set(draftLevel);
    filterGender.set(draftGender);
    filterSexualOrientation.set(draftOrientation);
    filterMinAge.set(ageMinDraft === AGE_MIN ? null : ageMinDraft);
    filterMaxAge.set(ageMaxDraft === AGE_MAX ? null : ageMaxDraft);
    filterMaxDistanceKm.set(distanceDraft);
    filterSingle.set(draftSingle);
    filterTrainer.set(draftTrainer);

    const uid = get(authUser)?.uid;
    if (uid) {
      await userProfile.save(uid, {
        discoverFilters: {
          activities: draftActivities,
          format: draftFormat,
          level: draftLevel,
          gender: draftGender,
          orientation: draftOrientation,
          minAge: ageMinDraft === AGE_MIN ? null : ageMinDraft,
          maxAge: ageMaxDraft === AGE_MAX ? null : ageMaxDraft,
          maxDistanceKm: distanceDraft,
          single: draftSingle,
          trainer: draftTrainer,
        },
      });
    }
    goto("/discover");
  }
</script>

<div class="flex h-dvh flex-col overflow-hidden bg-bg">
  <BackHeader href="/discover">
    <div class="flex flex-1 items-center justify-between">
      <h1 class="text-lg font-black text-text">{t.t("discover.filters")}</h1>
      <div class="flex items-center gap-2">
        <button
          onclick={resetFilters}
          class="flex size-9 items-center justify-center rounded-full bg-surface text-primary shadow-sm p-1"
          aria-label={t.t("common.clear")}
        >
          <RotateCcw class="size-5" />
        </button>
        <button
          onclick={applyDatingPreset}
          class="flex size-9 items-center justify-center rounded-full shadow-sm {isDatingPreset
            ? 'bg-primary text-white'
            : 'bg-surface text-text'}"
          aria-label={t.t("discover.datingPreset")}
        >
          <Heart class="size-5" />
        </button>
        <button
          onclick={applyFriendsPreset}
          class="flex size-9 items-center justify-center rounded-full shadow-sm {isFriendsPreset
            ? 'bg-primary text-white'
            : 'bg-surface text-text'}"
          aria-label={t.t("discover.friendsPreset")}
        >
          <Users class="size-5" />
        </button>
        <button
          onclick={applyTrainerPreset}
          class="flex size-9 items-center justify-center rounded-full shadow-sm {isTrainerPreset
            ? 'bg-primary text-white'
            : 'bg-surface text-text'}"
          aria-label={t.t("discover.trainerPreset")}
        >
          <UserShield class="size-5" />
        </button>
        <PresetHint class="mr-1" />
      </div>
    </div>
  </BackHeader>

  <div class="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
    <!-- Format -->
    <p class="mb-2 text-sm font-bold text-muted">{t.t("common.format")}</p>
    <div class="mb-5">
      <SegmentedControl
        options={formatFilterOptions}
        value={draftFormat}
        ariaLabel={t.t("common.format")}
        onchange={(value) => (draftFormat = value)}
      />
    </div>

    <!-- Level -->
    <p class="mb-2 text-sm font-bold text-muted">{t.t("common.level")}</p>
    <div class="mb-5">
      <SegmentedControl
        options={levelFilterOptions}
        value={draftLevel}
        ariaLabel={t.t("common.level")}
        onchange={(value) => (draftLevel = value)}
      />
    </div>

    <!-- Gender -->
    <p class="mb-2 text-sm font-bold text-muted">{t.t("common.gender")}</p>
    <div class="mb-5">
      <SegmentedControl
        options={genderFilterOptions}
        value={draftGender}
        ariaLabel={t.t("common.gender")}
        onchange={(value) => (draftGender = value)}
      />
    </div>

    <!-- Sex -->
    <p class="mb-2 text-sm font-bold text-muted">
      {t.t("common.orientation")}
    </p>
    <div class="mb-5">
      <SegmentedControl
        options={sexFilterOptions}
        value={draftOrientation}
        ariaLabel={t.t("common.orientation")}
        onchange={(value) => (draftOrientation = value)}
      />
    </div>

    <!-- Single -->
    <p class="mb-2 text-sm font-bold text-muted">
      {t.t("discover.singleFilter")}
    </p>
    <div class="mb-5">
      <SegmentedControl
        options={yesNoFilterOptions}
        value={draftSingle}
        ariaLabel={t.t("discover.singleFilter")}
        onchange={(value) => (draftSingle = value)}
      />
    </div>

    <!-- Trainer -->
    <p class="mb-2 text-sm font-bold text-muted">
      {t.t("discover.trainerFilter")}
    </p>
    <div class="mb-5">
      <SegmentedControl
        options={yesNoFilterOptions}
        value={draftTrainer}
        ariaLabel={t.t("discover.trainerFilter")}
        onchange={(value) => (draftTrainer = value)}
      />
    </div>

    <!-- Age -->
    <div class="mb-4 flex items-center justify-between">
      <p class="text-sm font-bold text-muted">{t.t("discover.ageRange")}</p>
      <span class="text-xs font-semibold text-muted"
        >{ageMinDraft} - {ageMaxDraft}</span
      >
    </div>
    <div class="relative mb-5 h-6">
      <div
        class="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-border"
      ></div>
      <div
        class="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary"
        style="left: {((ageMinDraft - AGE_MIN) / (AGE_MAX - AGE_MIN)) *
          100}%; right: {100 -
          ((ageMaxDraft - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100}%;"
      ></div>
      <input
        type="range"
        min={AGE_MIN}
        max={AGE_MAX}
        value={ageMinDraft}
        oninput={(e) =>
          updateAgeMinDraft(
            Number((e.currentTarget as HTMLInputElement).value),
          )}
        onchange={onSliderRelease}
        class="range-thumb absolute inset-x-0 top-1/2 w-full -translate-y-1/2 appearance-none bg-transparent accent-primary"
      />
      <input
        type="range"
        min={AGE_MIN}
        max={AGE_MAX}
        value={ageMaxDraft}
        oninput={(e) =>
          updateAgeMaxDraft(
            Number((e.currentTarget as HTMLInputElement).value),
          )}
        onchange={onSliderRelease}
        class="range-thumb absolute inset-x-0 top-1/2 w-full -translate-y-1/2 appearance-none bg-transparent accent-primary"
      />
    </div>

    <!-- Distance -->
    <div class="mb-4 flex items-center justify-between">
      <p class="text-sm font-bold text-muted">{t.t("discover.distance")}</p>
      <span class="text-xs font-semibold text-muted">
        {distanceDraft
          ? t.t("discover.withinKm", { count: distanceDraft })
          : t.t("common.any")}
      </span>
    </div>
    <div class="relative mb-1 h-6">
      <div
        class="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-border"
      ></div>
      <div
        class="absolute inset-y-0 left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary"
        style="width: {((Math.min(distanceDraft ?? 30, 30) - 1) / (30 - 1)) *
          100}%;"
      ></div>
      <input
        type="range"
        min="1"
        max="30"
        step="1"
        disabled={!hasCoords}
        value={distanceDraft ?? 30}
        oninput={(e) => {
          distanceDraft = Number((e.currentTarget as HTMLInputElement).value);
        }}
        onchange={onSliderRelease}
        class="absolute inset-x-0 top-1/2 w-full -translate-y-1/2 appearance-none bg-transparent accent-primary disabled:opacity-40"
      />
    </div>
    <div class="mb-5">
      {#if distanceDraft !== null}
        <button
          onclick={() => {
            distanceDraft = null;
            onSliderRelease();
          }}
          class="mt-1 text-xs font-semibold text-primary"
        >
          {t.t("common.clear")}
        </button>
      {/if}
      {#if !hasCoords}
        <p class="mt-1 text-xs text-muted">
          {t.t("discover.locationHint")}
        </p>
      {/if}
    </div>

    <!-- Sport -->
    <p class="mb-2 text-sm font-bold text-muted">{t.t("common.sports")}</p>
    <div class="grid grid-cols-2 gap-1">
      <button
        onclick={() => pickActivity("")}
        class="col-span-2 flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors {draftActivities.length ===
        0
          ? 'bg-primary text-white'
          : 'text-text hover:bg-bg'}"
      >
        {t.t("discover.allSports")}
      </button>
      {#each profileActivities as act}
        <button
          onclick={() => pickActivity(act.id)}
          class="flex min-w-0 items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors {draftActivities.includes(
            act.id,
          )
            ? 'bg-primary text-white'
            : 'text-text hover:bg-bg'}"
        >
          <ActivityIcon id={act.id} class="size-4 shrink-0" />
          <span class="truncate">{t.activity(act.id)}</span>
        </button>
      {/each}
    </div>
  </div>

  <div class="border-t border-border bg-surface p-4">
    <button
      onclick={applyAndBack}
      class="relative flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-bold text-white active:scale-95"
    >
      <span class="flex items-center gap-2 {previewLoading ? 'opacity-0' : ''}">
        <Users class="size-5" />
        {saveLabel}
      </span>
      {#if previewLoading}
        <Loader2 class="absolute size-5 animate-spin" />
      {/if}
    </button>
  </div>
</div>

<style>
  /* Two overlapping range inputs form one dual-thumb slider; only the thumbs
     should capture pointer events so clicks pass through to the top-most track. */
  .range-thumb {
    pointer-events: none;
  }
  .range-thumb::-webkit-slider-thumb {
    pointer-events: auto;
  }
  .range-thumb::-moz-range-thumb {
    pointer-events: auto;
  }
</style>
