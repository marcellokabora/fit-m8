<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { browser } from "$app/environment";
  import { authUser, userProfile } from "$lib/stores/auth";
  import {
    DEFAULT_DISTANCE_KM,
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
  import { ArrowLeft, ArrowRight, Loader2, LogOut, Zap } from "@lucide/svelte";
  import AboutYouStep from "./AboutYouStep.svelte";
  import SportsStep from "./SportsStep.svelte";
  import FinishingTouchesStep from "./FinishingTouchesStep.svelte";
  import PremiumStep from "./PremiumStep.svelte";
  import {
    getDiscoverPresetValues,
    type DiscoverPresetKind,
  } from "$lib/discoverPresets";
  import { savePushToken } from "$lib/firebase/notifications";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  const TOTAL_STEPS = 4;
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
    discoverPreset: DiscoverPresetKind | null;
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
  let locationValid = $derived(city !== "");
  let oppositeGender = $derived<Gender | "">(
    gender === "male" ? "female" : gender === "female" ? "male" : "",
  );

  // Step 2 — Activities (format/level default to "all"/"basic"; configurable later from the profile page)
  let selectedActivities = $state<string[]>(draft.selectedActivities ?? []);
  let activitySettings = $state<
    Record<string, { format: ActivityFormat; level: SkillLevel }>
  >(draft.activitySettings ?? {});

  // Which quick preset to land on Discover with (not currently set by any onboarding step)
  let discoverPreset = $state<DiscoverPresetKind | null>(
    draft.discoverPreset ?? null,
  );

  // Step 1 — Photo (a single one is enough) — never defaulted from the Google account photo
  let photos = $state<string[]>(draft.photos ?? []);
  let saving = $state(false);
  let error = $state("");
  let uid = $derived($authUser?.uid ?? "");

  // Step 3 — Push notification token (not persisted in the draft; re-requesting after a
  // refresh is instant once the browser has already granted/denied it)
  let pushToken = $state<string | null>(null);

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
  });

  function pushStepUrl() {
    const url = new URL(page.url);
    url.searchParams.set("step", String(step));
    goto(url, { keepFocus: true, noScroll: true });
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
    saving = true;
    const user = get(authUser);
    if (!user) return;

    const activities: UserActivity[] = selectedActivities.map((id) => ({
      id,
      ...activitySettings[id],
    }));

    // Always writes a discoverFilters object, even with no preset picked, so Discover
    // starts from an explicit default instead of prompting the PresetHint modal on first visit.
    const discoverFilters: DiscoverFilters = {
      activities: [],
      ...getDiscoverPresetValues(discoverPreset ?? "default", {
        myGender: gender,
        oppositeGender,
        myOrientation: sexualOrientation,
      }),
      minAge: null,
      maxAge: null,
      maxDistanceKm: DEFAULT_DISTANCE_KM,
    };

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
      // Let users review their completed profile before entering the rest of the app.
      goto("/profile");
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
          <AboutYouStep
            {uid}
            bind:photos
            bind:displayName
            bind:bio
            bind:birthdate
            bind:gender
            bind:sexualOrientation
            bind:isSingle
          />
        {:else if step === 2}
          <SportsStep bind:selectedActivities bind:activitySettings />
        {:else if step === 3}
          <FinishingTouchesStep bind:city bind:lat bind:lng bind:pushToken />
        {:else if step === 4}
          <PremiumStep />
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
          (step === 2 && selectedActivities.length === 0) ||
          (step === 3 && !locationValid)}
        class="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-md active:scale-95 disabled:opacity-40"
      >
        {t.t("common.continue")}
        <ArrowRight class="size-5" />
      </button>
    {:else}
      <button
        onclick={save}
        disabled={saving || !locationValid}
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
