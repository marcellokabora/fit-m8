<script lang="ts">
  import { goto } from "$app/navigation";
  import { authUser, userProfile } from "$lib/stores/auth";
  import {
    ACTIVITIES,
    ACTIVITY_FORMAT_OPTIONS,
    GENDER_OPTIONS,
    ORIENTATIONS,
    SKILL_LEVEL_OPTIONS,
    BIO_MAX_LENGTH,
    type UserActivity,
    type SkillLevel,
    type ActivityFormat,
    type SexualOrientation,
    type Gender,
  } from "$lib/types";
  import { get } from "svelte/store";
  import { Zap } from "@lucide/svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import LocationPicker from "$lib/components/LocationPicker.svelte";
  import SegmentedControl from "$lib/components/SegmentedControl.svelte";
  import Toggle from "$lib/components/Toggle.svelte";
  import PhotoGrid from "$lib/components/PhotoGrid.svelte";
  import AppearancePicker from "$lib/components/AppearancePicker.svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let step = $state(1);
  const TOTAL_STEPS = 5;
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
  let displayName = $state("");
  let bio = $state("");
  let age = $state<number>(25);
  let gender = $state<Gender>("male");
  let sexualOrientation = $state<SexualOrientation>("hetero");
  let isSingle = $state(false);
  let isTrainer = $state(false);
  let city = $state("");
  let lat = $state<number | undefined>(undefined);
  let lng = $state<number | undefined>(undefined);

  // Step 2 — Activities
  let selectedActivities = $state<string[]>([]);

  // Step 3 — For each selected activity: format + level
  let activitySettings = $state<
    Record<string, { format: ActivityFormat; level: SkillLevel }>
  >({});

  // Step 4 — Photos (optional, up to 3)
  let photos = $state<string[]>([]);
  let saving = $state(false);
  let error = $state("");
  let uid = $derived($authUser?.uid ?? "");

  function toggleActivity(id: string) {
    if (selectedActivities.includes(id)) {
      selectedActivities = selectedActivities.filter((a) => a !== id);
      delete activitySettings[id];
    } else {
      selectedActivities = [...selectedActivities, id];
      activitySettings[id] = { format: "all", level: "basic" };
    }
  }

  function next() {
    if (step < TOTAL_STEPS) step++;
  }

  function back() {
    if (step > 1) step--;
  }

  async function save() {
    error = "";
    saving = true;
    const user = get(authUser);
    if (!user) return;

    const activities: UserActivity[] = selectedActivities.map((id) => ({
      id,
      ...activitySettings[id],
    }));

    try {
      await userProfile.save(user.uid, {
        displayName,
        bio,
        age,
        gender,
        orientation: sexualOrientation,
        isSingle,
        isTrainer,
        city,
        lat,
        lng,
        photos,
        photoURL: photos[0] || user.photoURL || "",
        activities,
      });
      goto("/discover");
    } catch (e: any) {
      error = e.message;
    } finally {
      saving = false;
    }
  }
</script>

<div class="flex min-h-dvh flex-col bg-bg px-6 pb-10 pt-10">
  <!-- Progress -->
  <div class="mb-8 flex items-center gap-2">
    {#each Array(TOTAL_STEPS) as _, i}
      <div
        class="h-1.5 flex-1 rounded-full transition-all {i + 1 <= step
          ? 'bg-primary'
          : 'bg-gray-200'}"
      ></div>
    {/each}
  </div>

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
      <div class="flex gap-3">
        <input
          type="number"
          bind:value={age}
          min={16}
          max={80}
          placeholder={t.t("onboarding.age")}
          class="w-24 rounded-2xl border-2 border-border bg-surface px-4 py-4 text-base text-text outline-none focus:border-primary"
        />
        <LocationPicker bind:city bind:lat bind:lng />
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
      <div
        class="flex items-center justify-between rounded-2xl border-2 border-border bg-surface px-4 py-4"
      >
        <p class="text-sm font-semibold text-text">{t.t("profile.trainer")}</p>
        <Toggle
          checked={isTrainer}
          ariaLabel={t.t("profile.trainer")}
          onchange={(value) => (isTrainer = value)}
        />
      </div>
    </div>
  {:else if step === 2}
    <h2 class="mb-1 text-2xl font-black text-text">
      {t.t("onboarding.yourSports")}
    </h2>
    <p class="mb-6 text-sm text-muted">{t.t("onboarding.sportsHint")}</p>
    <div class="grid grid-cols-2 gap-3">
      {#each ACTIVITIES as activity}
        <button
          onclick={() => toggleActivity(activity.id)}
          class="flex flex-col items-center gap-2 rounded-2xl border-2 py-5 transition-all active:scale-95 {selectedActivities.includes(
            activity.id,
          )
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
                    ? 'border-secondary-dark bg-secondary text-white'
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
  {:else if step === 5}
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

  <!-- Navigation -->
  <div class="mt-auto flex gap-3 pt-8">
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
        disabled={step === 1 && (!displayName || !city)}
        class="flex-1 rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-md active:scale-95 disabled:opacity-40"
      >
        {t.t("common.continue")}
      </button>
    {:else}
      <button
        onclick={save}
        disabled={saving}
        class="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-secondary py-4 text-base font-bold text-white shadow-md active:scale-95 disabled:opacity-40"
      >
        {saving ? t.t("common.saving") : t.t("common.letsGo")}
        {#if !saving}
          <Zap class="size-5" />
        {/if}
      </button>
    {/if}
  </div>
</div>
