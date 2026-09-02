<script lang="ts">
  import BackHeader from "$lib/components/BackHeader.svelte";

  const LAST_UPDATED = "August 21, 2026";
</script>

<svelte:head>
  <title>Privacy Policy · FIT-M8</title>
</svelte:head>

<BackHeader title="Privacy Policy" class="bg-bg" />

<div class="flex flex-col gap-5 px-5 pb-16 text-sm leading-relaxed text-text">
  <p class="text-xs text-muted">Last updated: {LAST_UPDATED}</p>

  <p>
    FIT-M8 ("FIT-M8", "we", "us", or "our") operates the FIT-M8 mobile and web
    application (the "App"). This Privacy Policy explains what information we
    collect, how we use it, and the choices you have. By creating an account or
    using the App, you agree to the collection and use of information as
    described here.
  </p>

  <section class="flex flex-col gap-2">
    <h2 class="text-base font-bold text-text">1. Information we collect</h2>
    <p>We collect the following categories of information:</p>
    <ul class="list-disc space-y-1 pl-5">
      <li>
        <strong>Account information:</strong> email address, and authentication data
        if you sign in with Google or with an email/password.
      </li>
      <li>
        <strong>Profile information:</strong> display name, age, gender, sexual orientation,
        bio, city, approximate location coordinates, profile photos, activities,
        skill level, and status (e.g. single, trainer).
      </li>
      <li>
        <strong>Activity data:</strong> swipes, matches, and messages you send to
        your matches.
      </li>
      <li>
        <strong>Usage and device data:</strong> app usage events, crash reports,
        and diagnostic data collected automatically through Firebase Analytics and
        Firebase Crashlytics.
      </li>
      <li>
        <strong>Local preferences:</strong> language and appearance settings, stored
        on your device.
      </li>
    </ul>
  </section>

  <section class="flex flex-col gap-2">
    <h2 class="text-base font-bold text-text">
      2. How we use your information
    </h2>
    <ul class="list-disc space-y-1 pl-5">
      <li>To create and maintain your account and profile.</li>
      <li>
        To show your profile to other users and suggest potential matches based
        on shared activities, preferences, and distance.
      </li>
      <li>To enable matching and messaging between matched users.</li>
      <li>
        To operate, maintain, and improve the App, including diagnosing
        technical issues and understanding feature usage.
      </li>
      <li>To communicate with you about your account or the App.</li>
      <li>To detect, prevent, and address fraud, abuse, or security issues.</li>
    </ul>
  </section>

  <section class="flex flex-col gap-2">
    <h2 class="text-base font-bold text-text">
      3. Who can see your information
    </h2>
    <p>
      Your display name, age, city, approximate distance, bio, photos, and
      sports are visible to other users of the App so they can decide whether to
      match with you. Once matched, your messages are visible to that match. We
      do not sell your personal information to third parties.
    </p>
  </section>

  <section class="flex flex-col gap-2">
    <h2 class="text-base font-bold text-text">4. Service providers</h2>
    <p>
      We use Google Firebase (Authentication, Firestore, Cloud Storage,
      Analytics, and Crashlytics) to store data and operate the App. These
      providers process data on our behalf under their own data processing and
      security terms.
    </p>
  </section>

  <section class="flex flex-col gap-2">
    <h2 class="text-base font-bold text-text">5. Data retention</h2>
    <p>
      We retain your information for as long as your account is active. If you
      delete your account from the app (Profile → Delete account), your profile,
      photos, swipes, matches, and messages are permanently deleted.
    </p>
  </section>

  <section class="flex flex-col gap-2">
    <h2 class="text-base font-bold text-text">6. Your rights</h2>
    <p>
      If you are located in the European Union or another jurisdiction with
      similar data protection laws, you have the right to access, correct,
      export, or delete your personal data, and to object to or restrict certain
      processing. You can delete your account and data at any time from within
      the App, or by contacting us at
      <a href="mailto:info@fit-m8.app" class="font-semibold text-primary"
        >info@fit-m8.app</a
      >. You also have the right to lodge a complaint with your local data
      protection authority.
    </p>
  </section>

  <section class="flex flex-col gap-2">
    <h2 class="text-base font-bold text-text">7. Children's privacy</h2>
    <p>
      FIT-M8 is not intended for anyone under 18 years old. We do not knowingly
      collect information from minors. If you believe a minor has created an
      account, please contact us so we can remove it.
    </p>
  </section>

  <section class="flex flex-col gap-2">
    <h2 class="text-base font-bold text-text">8. Security</h2>
    <p>
      We use reasonable technical and organizational measures, including
      Firestore security rules and authenticated access, to protect your
      information. No method of transmission or storage is completely secure,
      and we cannot guarantee absolute security.
    </p>
  </section>

  <section class="flex flex-col gap-2">
    <h2 class="text-base font-bold text-text">9. Changes to this policy</h2>
    <p>
      We may update this Privacy Policy from time to time. We will update the
      "Last updated" date above when we do. Continued use of the App after
      changes take effect constitutes acceptance of the revised policy.
    </p>
  </section>

  <section class="flex flex-col gap-2">
    <h2 class="text-base font-bold text-text">10. Contact us</h2>
    <p>
      If you have any questions about this Privacy Policy, contact us at
      <a href="mailto:info@fit-m8.app" class="font-semibold text-primary"
        >info@fit-m8.app</a
      >.
    </p>
  </section>
</div>
