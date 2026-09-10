<script lang="ts">
  import {
    BIO_MAX_LENGTH,
    GENDER_OPTIONS,
    ORIENTATIONS,
    type Gender,
    type SexualOrientation,
  } from "$lib/types";
  import PhotoGrid from "$lib/components/PhotoGrid.svelte";
  import BirthdateField from "$lib/components/BirthdateField.svelte";
  import Toggle from "$lib/components/Toggle.svelte";
  import SegmentedControl from "$lib/components/SegmentedControl.svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let {
    uid,
    photos = $bindable([]),
    displayName = $bindable(""),
    bio = $bindable(""),
    birthdate = $bindable(""),
    gender = $bindable<Gender>("male"),
    sexualOrientation = $bindable<SexualOrientation>("hetero"),
    isSingle = $bindable(false),
  }: {
    uid: string;
    photos?: string[];
    displayName?: string;
    bio?: string;
    birthdate?: string;
    gender?: Gender;
    sexualOrientation?: SexualOrientation;
    isSingle?: boolean;
  } = $props();

  let t = $derived(createTranslator($activeLanguage));
  let nameHasSurname = $derived(/\s/.test(displayName.trim()));
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
</script>

<h2 class="mb-1 text-2xl font-black text-text">
  {t.t("onboarding.aboutYou")}
</h2>
<p class="mb-6 text-sm text-muted">
  {t.t("onboarding.aboutYouHint")}
</p>
<div class="flex flex-col gap-4">
  <div>
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
  <BirthdateField
    bind:value={birthdate}
    label={t.t("onboarding.birthdate")}
    underageMessage={t.t("onboarding.underageError")}
  />
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
</div>
