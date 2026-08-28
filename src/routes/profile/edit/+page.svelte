<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { authUser, userProfile } from "$lib/stores/auth";
  import {
    ORIENTATIONS,
    GENDER_OPTIONS,
    BIO_MAX_LENGTH,
    MIN_AGE,
    calculateAge,
    type SexualOrientation,
    type Gender,
  } from "$lib/types";
  import { get } from "svelte/store";
  import LocationPicker from "$lib/components/LocationPicker.svelte";
  import SegmentedControl from "$lib/components/SegmentedControl.svelte";
  import Toggle from "$lib/components/Toggle.svelte";
  import PhotoGrid from "$lib/components/PhotoGrid.svelte";
  import BackHeader from "$lib/components/BackHeader.svelte";
  import BirthdateField from "$lib/components/BirthdateField.svelte";
  import {
    Bell,
    Check,
    Crown,
    Loader2,
    Plus,
    RotateCcw,
    Trash2,
  } from "@lucide/svelte";
  import AppearancePicker from "$lib/components/AppearancePicker.svelte";
  import SocialIcon from "$lib/components/SocialIcon.svelte";
  import { resetSwipes } from "$lib/firebase/swipe";
  import { deleteAccount } from "$lib/firebase/account";
  import { detectSocialPlatform, normalizeSocialLink } from "$lib/social";
  import {
    requestPushToken,
    savePushToken,
    pushNotificationsSupported,
  } from "$lib/firebase/notifications";
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
      label: option.code.toUpperCase(),
    })),
  );
  let saving = $state(false);
  let confirmResetSwipes = $state(false);
  let resettingSwipes = $state(false);
  let confirmDeleteAccount = $state(false);
  let deletingAccount = $state(false);
  let deleteAccountError = $state<string | null>(null);

  let displayName = $state($userProfile?.displayName ?? "");
  let bio = $state($userProfile?.bio ?? "");
  // Only `age` is persisted, not the exact date, so this starts blank rather than guessing a birthdate
  let birthdate = $state("");
  let isUnderage = $derived(
    birthdate !== "" && calculateAge(birthdate) < MIN_AGE,
  );
  let city = $state($userProfile?.city ?? "");
  let lat = $state<number | undefined>($userProfile?.lat);
  let lng = $state<number | undefined>($userProfile?.lng);
  let sexualOrientation = $state<SexualOrientation>(
    $userProfile?.orientation ?? "hetero",
  );
  let gender = $state<Gender | "">($userProfile?.gender ?? "");
  let isSingle = $state($userProfile?.isSingle ?? false);
  let isTrainer = $state($userProfile?.isTrainer ?? false);
  let photos = $state<string[]>(
    $userProfile?.photos ??
      ($userProfile?.photoURL ? [$userProfile.photoURL] : []),
  );
  let socialLinks = $state<string[]>($userProfile?.socialLinks ?? []);
  let newSocialLink = $state("");
  let socialLinkError = $state(false);
  let uid = $derived($authUser?.uid ?? "");

  let pushSupported = $state(false);
  let pushRequesting = $state(false);
  let pushDenied = $state(false);
  // Reflects only *this session's* successful request — resets on reload either way,
  // since Notification permission state can't be read back out as "token saved".
  let pushJustEnabled = $state(false);

  async function enableNotifications() {
    if (!uid || pushRequesting) return;
    pushRequesting = true;
    const token = await requestPushToken();
    pushDenied = !token;
    if (token) {
      await savePushToken(uid, token);
      pushJustEnabled = true;
    }
    pushRequesting = false;
  }

  onMount(() => {
    pushNotificationsSupported().then(
      (supported) => (pushSupported = supported),
    );
  });

  $effect(() => {
    if ($userProfile) {
      displayName = $userProfile.displayName;
      bio = $userProfile.bio ?? "";
      city = $userProfile.city ?? "";
      lat = $userProfile.lat;
      lng = $userProfile.lng;
      sexualOrientation = $userProfile.orientation ?? "hetero";
      gender = $userProfile.gender ?? "";
      isSingle = $userProfile.isSingle ?? false;
      isTrainer = $userProfile.isTrainer ?? false;
      photos =
        $userProfile.photos ??
        ($userProfile.photoURL ? [$userProfile.photoURL] : []);
      socialLinks = $userProfile.socialLinks ?? [];
    }
  });

  function handlePhotosChange(next: string[]) {
    if (!uid) return;
    userProfile.save(uid, { photos: next, photoURL: next[0] ?? "" });
  }

  function addSocialLink() {
    const url = normalizeSocialLink(newSocialLink);
    try {
      new URL(url);
    } catch {
      socialLinkError = true;
      return;
    }
    socialLinkError = false;
    socialLinks = [...socialLinks, url];
    newSocialLink = "";
  }

  function removeSocialLink(index: number) {
    socialLinks = socialLinks.filter((_, i) => i !== index);
  }

  async function save() {
    if (isUnderage) return;
    saving = true;
    const uid = get(authUser)?.uid;
    if (uid) {
      await userProfile.save(uid, {
        displayName,
        bio,
        // Only overwrite the stored age if a new birthdate was actually entered
        ...(birthdate ? { age: calculateAge(birthdate) } : {}),
        city,
        lat,
        lng,
        gender,
        orientation: sexualOrientation,
        isSingle,
        // Trainer status requires an active Premium subscription, even if the toggle was left on from before
        isTrainer: $userProfile?.isPremium ? isTrainer : false,
        socialLinks,
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

  async function handleDeleteAccount() {
    const user = get(authUser);
    if (!user) return;
    deletingAccount = true;
    deleteAccountError = null;
    try {
      await deleteAccount(user);
    } catch (err) {
      deletingAccount = false;
      deleteAccountError =
        err instanceof Error && err.message.includes("requires-recent-login")
          ? t.t("errors.requiresRecentLogin")
          : t.t("errors.generic");
    }
  }
</script>

<div class="flex min-h-dvh flex-col bg-bg">
  <BackHeader href="/profile" class="bg-bg">
    <div class="flex flex-1 items-center justify-between">
      <h1 class="text-lg font-black text-text">{t.t("profile.editTitle")}</h1>
      <button
        onclick={save}
        disabled={saving || isUnderage}
        class="flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary active:scale-95 disabled:opacity-50"
      >
        {#if saving}
          <Loader2 class="size-4 animate-spin" />
        {:else}
          <Check class="size-4" />
        {/if}
        {saving ? t.t("common.saving") : t.t("common.save")}
      </button>
    </div>
  </BackHeader>

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
      <BirthdateField
        bind:value={birthdate}
        label={t.t("onboarding.birthdate")}
        underageMessage={t.t("onboarding.underageError")}
      />
    </div>
    {#if $authUser?.email}
      <div class="w-full">
        <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
          {t.t("common.email")}
        </h3>
        <p
          class="rounded-2xl border-2 border-border bg-surface px-4 py-3 text-base text-muted w-full"
        >
          {$authUser.email}
        </p>
      </div>
    {/if}
    <div class="w-full">
      <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
        {t.t("common.biography")}
      </h3>
      <textarea
        bind:value={bio}
        rows={4}
        maxlength={BIO_MAX_LENGTH}
        placeholder={t.t("profile.bio")}
        class="w-full rounded-2xl border-2 border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
      ></textarea>
      <p class="mt-1 text-right text-xs text-muted">
        {bio.length}/{BIO_MAX_LENGTH}
      </p>
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
    />
    <h3 class="mb-2 mt-4 text-sm font-bold uppercase tracking-wide text-muted">
      {t.t("common.orientation")}
    </h3>
    <SegmentedControl
      options={orientationOptions}
      value={sexualOrientation}
      ariaLabel={t.t("common.orientation")}
      onchange={(value) => (sexualOrientation = value)}
    />
  </div>

  <!-- Status -->
  <div class="px-5 pb-8">
    <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
      {t.t("profile.statusTitle")}
    </h3>
    <div
      class="flex items-center justify-between rounded-2xl bg-surface px-4 py-3"
    >
      <p class="text-sm font-semibold text-text">{t.t("profile.single")}</p>
      <Toggle
        checked={isSingle}
        ariaLabel={t.t("profile.single")}
        onchange={(value) => (isSingle = value)}
      />
    </div>
    <div
      class="mt-3 flex items-center justify-between rounded-2xl bg-surface px-4 py-3"
    >
      <div class="flex items-center gap-2">
        <p class="text-sm font-semibold text-text">{t.t("profile.trainer")}</p>
        {#if !$userProfile?.isPremium}
          <span
            class="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
          >
            <Crown class="size-3" />
            {t.t("profile.premiumFeature")}
          </span>
        {/if}
      </div>
      {#if $userProfile?.isPremium}
        <Toggle
          checked={isTrainer}
          ariaLabel={t.t("profile.trainer")}
          onchange={(value) => (isTrainer = value)}
        />
      {:else}
        <button
          onclick={() => goto("/premium")}
          class="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary active:scale-95"
        >
          {t.t("profile.goPremium")}
        </button>
      {/if}
    </div>
  </div>

  <!-- Social links -->
  <div class="px-5 pb-8">
    <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
      {t.t("profile.socialLinks")}
    </h3>
    <p class="mb-3 text-sm text-muted">{t.t("profile.socialLinksHint")}</p>
    {#if socialLinks.length > 0}
      <div class="mb-3 flex flex-col gap-2">
        {#each socialLinks as link, index}
          {@const platform = detectSocialPlatform(link)}
          <div
            class="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 shadow-sm"
          >
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <SocialIcon url={link} class="size-4.5" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-bold text-text">
                {platform.label}
              </p>
              <p class="truncate text-xs text-muted">{link}</p>
            </div>
            <button
              onclick={() => removeSocialLink(index)}
              aria-label={`${t.t("common.remove")} ${platform.label}`}
              class="flex size-8 shrink-0 items-center justify-center rounded-full bg-error/10 text-error active:scale-95"
            >
              <Trash2 class="size-4" />
            </button>
          </div>
        {/each}
      </div>
    {/if}
    <div class="flex gap-2">
      <input
        type="text"
        bind:value={newSocialLink}
        onkeydown={(e) =>
          e.key === "Enter" && (e.preventDefault(), addSocialLink())}
        placeholder={t.t("profile.socialLinkPlaceholder")}
        class="w-full min-w-0 flex-1 rounded-2xl border-2 border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
      />
      <button
        onclick={addSocialLink}
        aria-label={t.t("common.add")}
        class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary active:scale-95"
      >
        <Plus class="size-5" />
      </button>
    </div>
    {#if socialLinkError}
      <p class="mt-1.5 text-xs font-semibold text-error">
        {t.t("profile.invalidSocialLink")}
      </p>
    {/if}
  </div>

  <!-- Language -->
  <div class="px-5">
    <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
      {t.t("common.language")}
    </h3>
    <SegmentedControl
      options={languageOptions}
      value={$activeLanguage}
      ariaLabel={t.t("common.language")}
      onchange={(value) => activeLanguage.selectLanguage(value)}
    />
  </div>

  <!-- Theme -->
  <div class="px-5 pt-8 pb-8">
    <AppearancePicker />
  </div>

  <!-- Notifications -->
  {#if pushSupported}
    <div class="px-5 pb-8">
      <h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
        {t.t("onboarding.notificationsTitle")}
      </h3>
      {#if pushJustEnabled}
        <div
          class="flex items-center gap-2 rounded-2xl bg-success/10 py-3 px-4 text-sm font-bold text-success"
        >
          <Check class="size-4" />
          {t.t("onboarding.notificationsEnabled")}
        </div>
      {:else}
        <button
          onclick={enableNotifications}
          disabled={pushRequesting}
          class="flex w-full items-center justify-center gap-2 rounded-2xl bg-surface border-2 border-border py-3 text-sm font-bold active:scale-95 disabled:opacity-60"
        >
          <Bell class="size-4" />
          {pushRequesting ? "..." : t.t("onboarding.enableNotifications")}
        </button>
        {#if pushDenied}
          <p class="mt-2 text-xs font-semibold text-error">
            {t.t("onboarding.notificationsBlocked")}
          </p>
        {/if}
      {/if}
    </div>
  {/if}

  <!-- Danger zone -->
  <div class="px-5 pb-8">
    <h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
      {t.t("profile.dangerZone")}
    </h3>
    <div class="flex flex-col gap-3">
      <button
        onclick={() => (confirmResetSwipes = true)}
        class="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-error/40 py-3 text-sm font-bold text-error active:scale-95"
      >
        <RotateCcw class="size-4" />
        {t.t("profile.resetSwipes")}
      </button>
      <button
        onclick={() => (confirmDeleteAccount = true)}
        class="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-error/40 py-3 text-sm font-bold text-error active:scale-95"
      >
        <Trash2 class="size-4" />
        {t.t("profile.deleteAccount")}
      </button>
    </div>
  </div>
</div>

{#if confirmResetSwipes}
  <div
    class="fixed inset-0 z-50 mx-auto flex w-full items-center justify-center bg-black/60 px-6 backdrop-blur-sm md:max-w-md"
  >
    <div
      class="flex flex-col items-center gap-4 rounded-3xl bg-surface p-8 text-center shadow-2xl"
    >
      <RotateCcw class="size-12 text-error" />
      <h2 class="text-lg font-black text-text">
        {t.t("profile.resetSwipesTitle")}
      </h2>
      <p class="text-sm text-muted">{t.t("profile.resetSwipesHint")}</p>
      <div class="flex w-full gap-3">
        <button
          onclick={() => (confirmResetSwipes = false)}
          disabled={resettingSwipes}
          class="flex-1 rounded-2xl border-2 border-border py-3 text-xs font-semibold text-text active:scale-95 disabled:opacity-50"
        >
          {t.t("common.cancel")}
        </button>
        <button
          onclick={handleResetSwipes}
          disabled={resettingSwipes}
          class="flex-1 rounded-2xl bg-error px-2 py-3 text-xs font-bold text-white active:scale-95 disabled:opacity-50"
        >
          {resettingSwipes
            ? t.t("profile.resettingSwipes")
            : t.t("profile.resetSwipes")}
        </button>
      </div>
    </div>
  </div>
{/if}

{#if confirmDeleteAccount}
  <div
    class="fixed inset-0 z-50 mx-auto flex w-full items-center justify-center bg-black/60 px-6 backdrop-blur-sm md:max-w-md"
  >
    <div
      class="flex flex-col items-center gap-4 rounded-3xl bg-surface p-8 text-center shadow-2xl"
    >
      <Trash2 class="size-12 text-error" />
      <h2 class="text-lg font-black text-text">
        {t.t("profile.deleteAccountTitle")}
      </h2>
      <p class="text-sm text-muted">{t.t("profile.deleteAccountHint")}</p>
      {#if deleteAccountError}
        <p class="text-sm font-semibold text-error">{deleteAccountError}</p>
      {/if}
      <div class="flex w-full gap-3">
        <button
          onclick={() => (confirmDeleteAccount = false)}
          disabled={deletingAccount}
          class="flex-1 rounded-2xl border-2 border-border py-3 text-xs font-semibold text-text active:scale-95 disabled:opacity-50"
        >
          {t.t("common.cancel")}
        </button>
        <button
          onclick={handleDeleteAccount}
          disabled={deletingAccount}
          class="flex-1 rounded-2xl bg-error py-3 text-xs font-bold text-white active:scale-95 disabled:opacity-50"
        >
          {deletingAccount
            ? t.t("profile.deletingAccount")
            : t.t("common.delete")}
        </button>
      </div>
    </div>
  </div>
{/if}
