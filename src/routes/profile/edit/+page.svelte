<script lang="ts">
  import { goto } from "$app/navigation";
  import { authUser, userProfile } from "$lib/stores/auth";
  import {
    ORIENTATIONS,
    GENDER_OPTIONS,
    type SexualOrientation,
    type Gender,
  } from "$lib/types";
  import { get } from "svelte/store";
  import LocationPicker from "$lib/components/LocationPicker.svelte";
  import SegmentedControl from "$lib/components/SegmentedControl.svelte";
  import PhotoGrid from "$lib/components/PhotoGrid.svelte";
  import { X, RotateCcw } from "@lucide/svelte";
  import AppearancePicker from "$lib/components/AppearancePicker.svelte";
  import { resetSwipes } from "$lib/firebase/swipe";
  import {
    activeLanguage,
    createTranslator,
    LANGUAGES,
  } from "$lib/stores/language";

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
  let languageOptions = $derived(
    LANGUAGES.map((option) => ({
      value: option.code,
      label: t.t(`language.${option.code}` as any),
    })),
  );
  let saving = $state(false);
  let confirmResetSwipes = $state(false);
  let resettingSwipes = $state(false);

  let displayName = $state($userProfile?.displayName ?? "");
  let bio = $state($userProfile?.bio ?? "");
  let city = $state($userProfile?.city ?? "");
  let lat = $state<number | undefined>($userProfile?.lat);
  let lng = $state<number | undefined>($userProfile?.lng);
  let sexualOrientation = $state<SexualOrientation>(
    $userProfile?.orientation ?? "hetero",
  );
  let gender = $state<Gender | "">($userProfile?.gender ?? "");
  let photos = $state<string[]>(
    $userProfile?.photos ??
      ($userProfile?.photoURL ? [$userProfile.photoURL] : []),
  );
  let uid = $derived($authUser?.uid ?? "");

  $effect(() => {
    if ($userProfile) {
      displayName = $userProfile.displayName;
      bio = $userProfile.bio ?? "";
      city = $userProfile.city ?? "";
      lat = $userProfile.lat;
      lng = $userProfile.lng;
      sexualOrientation = $userProfile.orientation ?? "hetero";
      gender = $userProfile.gender ?? "";
      photos =
        $userProfile.photos ??
        ($userProfile.photoURL ? [$userProfile.photoURL] : []);
    }
  });

  function handlePhotosChange(next: string[]) {
    if (!uid) return;
    userProfile.save(uid, { photos: next, photoURL: next[0] ?? "" });
  }

  async function save() {
    saving = true;
    const uid = get(authUser)?.uid;
    if (uid) {
      await userProfile.save(uid, {
        displayName,
        bio,
        city,
        lat,
        lng,
        gender,
        orientation: sexualOrientation,
      });
    }
    saving = false;
    goto("/profile");
  }

  async function handleResetSwipes() {
    if (!uid) return;
    resettingSwipes = true;
    await resetSwipes(uid);
    resettingSwipes = false;
    confirmResetSwipes = false;
  }
</script>

<div class="flex min-h-dvh flex-col bg-bg">
  <!-- Header -->
  <div
    class="sticky top-0 z-10 flex items-center justify-between bg-bg px-5 pb-3 pt-5"
  >
    <a
      href="/profile"
      aria-label={t.t("common.close")}
      class="flex size-9 items-center justify-center rounded-full text-text active:scale-95"
    >
      <X class="size-5" />
    </a>
    <h1 class="text-lg font-black text-text">{t.t("profile.editTitle")}</h1>
    <button
      onclick={save}
      disabled={saving}
      class="rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary active:scale-95 disabled:opacity-50"
    >
      {saving ? t.t("common.saving") : t.t("common.save")}
    </button>
  </div>

  <!-- Photos + basic info -->
  <div class="flex flex-col items-center gap-3 px-5 pb-6">
    <div class="w-full">
      <PhotoGrid {photos} {uid} onchange={handlePhotosChange} />
    </div>
    <div class="w-full">
      <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
        {t.t("common.name")}
      </h3>
      <input
        type="text"
        bind:value={displayName}
        class="rounded-2xl border-2 border-border bg-surface px-4 py-3 text-base font-bold text-text w-full outline-none focus:border-primary"
      />
    </div>
    <div class="w-full">
      <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
        {t.t("common.biography")}
      </h3>
      <textarea
        bind:value={bio}
        rows={2}
        placeholder={t.t("profile.bio")}
        class="w-full rounded-2xl border-2 border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
      ></textarea>
    </div>
    <div class="w-full">
      <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
        {t.t("common.location")}
      </h3>
      <LocationPicker bind:city bind:lat bind:lng />
    </div>
  </div>

  <!-- Gender + Orientation -->
  <div class="px-5 pb-8">
    <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
      Gender
    </h3>
    <SegmentedControl
      options={genderOptions}
      value={gender}
      ariaLabel={t.t("common.gender")}
      onchange={(value) => (gender = value)}
      size="lg"
    />
    <h3 class="mb-2 mt-4 text-sm font-bold uppercase tracking-wide text-muted">
      {t.t("common.orientation")}
    </h3>
    <SegmentedControl
      options={orientationOptions}
      value={sexualOrientation}
      ariaLabel={t.t("common.orientation")}
      onchange={(value) => (sexualOrientation = value)}
      size="lg"
    />
  </div>

  <!-- Language -->
  <div class="px-5 pb-8">
    <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
      {t.t("common.language")}
    </h3>
    <SegmentedControl
      options={languageOptions}
      value={$activeLanguage}
      ariaLabel={t.t("common.language")}
      onchange={(value) => activeLanguage.selectLanguage(value)}
      size="lg"
    />
  </div>

  <!-- Theme -->
  <div class="px-5 pt-8 pb-8">
    <AppearancePicker />
  </div>

  <!-- Reset swipes -->
  <div class="px-5 pb-8">
    <h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
      {t.t("profile.discovery")}
    </h3>
    {#if confirmResetSwipes}
      <div
        class="rounded-2xl border-2 border-dashed border-error/40 bg-surface p-4"
      >
        <div class="flex gap-3">
          <button
            onclick={() => (confirmResetSwipes = false)}
            class="flex-1 rounded-2xl border-2 border-border py-3 text-sm font-semibold text-text active:scale-95"
          >
            {t.t("common.cancel")}
          </button>
          <button
            onclick={handleResetSwipes}
            disabled={resettingSwipes}
            class="flex-1 rounded-2xl bg-error py-3 text-sm font-bold text-white active:scale-95 disabled:opacity-50"
          >
            {resettingSwipes
              ? t.t("profile.resettingSwipes")
              : t.t("profile.resetSwipes")}
          </button>
        </div>
      </div>
    {:else}
      <button
        onclick={() => (confirmResetSwipes = true)}
        class="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-error/40 py-3 text-sm font-bold text-error active:scale-95"
      >
        <RotateCcw class="size-4" />
        {t.t("profile.resetSwipes")}
      </button>
    {/if}
  </div>
</div>
