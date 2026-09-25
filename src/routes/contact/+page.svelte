<script lang="ts">
  import SocialIcon from "$lib/components/SocialIcon.svelte";
  import SiteHeader from "$lib/components/SiteHeader.svelte";
  import { SOCIAL_LINKS } from "$lib/social";
  import { submitContactMessage } from "$lib/firebase/contact";
  import { Mail, Send } from "@lucide/svelte";

  const CONTACT_EMAIL_DISPLAY = "info@fit-m8.app";

  let name = $state("");
  let email = $state("");
  let message = $state("");
  let sent = $state(false);
  let sending = $state(false);
  let error = $state("");

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    sending = true;
    error = "";
    try {
      await submitContactMessage(name, email, message);
      sent = true;
      name = "";
      email = "";
      message = "";
    } catch {
      error = "Something went wrong sending your message. Please try again.";
    } finally {
      sending = false;
    }
  }
</script>

<svelte:head>
  <title>Contact · FIT-M8</title>
  <meta
    name="description"
    content="Get in touch with the FIT-M8 team - questions, feedback, or support."
  />
  <link rel="canonical" href="https://fit-m8.app/contact" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Contact · FIT-M8" />
  <meta
    property="og:description"
    content="Get in touch with the FIT-M8 team - questions, feedback, or support."
  />
  <meta property="og:url" content="https://fit-m8.app/contact" />
  <meta
    property="og:image"
    content="https://fit-m8.app/logo/social-preview.png"
  />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Contact · FIT-M8" />
  <meta
    name="twitter:description"
    content="Get in touch with the FIT-M8 team - questions, feedback, or support."
  />
  <meta
    name="twitter:image"
    content="https://fit-m8.app/logo/social-preview.png"
  />
</svelte:head>

<div class="flex min-h-dvh flex-col bg-bg pb-16">
  <div class="mx-auto flex w-full max-w-3xl flex-1 flex-col">
    <SiteHeader />

    <div class="flex flex-col gap-6 px-5 pt-6 text-text flex-1">
      <div class="flex flex-col gap-2 text-center">
        <p class="text-xs font-semibold uppercase tracking-widest text-primary">
          Contact
        </p>
        <h1 class="text-3xl font-black text-text text-balance">
          Get in touch with the FIT-M8 team
        </h1>
      </div>

      <form
        onsubmit={handleSubmit}
        class="flex flex-col gap-4 rounded-3xl bg-surface p-5 shadow-sm"
      >
        <h2 class="text-base font-bold text-text">Send us a message</h2>

        <label class="flex flex-col gap-1.5 text-sm font-semibold text-text">
          Name
          <input
            type="text"
            bind:value={name}
            placeholder="Your name"
            class="rounded-xl border-2 border-border bg-bg px-4 py-3 text-sm font-normal text-text outline-none focus:border-primary"
          />
        </label>

        <label class="flex flex-col gap-1.5 text-sm font-semibold text-text">
          Email
          <input
            type="email"
            bind:value={email}
            placeholder="you@example.com"
            class="rounded-xl border-2 border-border bg-bg px-4 py-3 text-sm font-normal text-text outline-none focus:border-primary"
          />
        </label>

        <label class="flex flex-col gap-1.5 text-sm font-semibold text-text">
          Message
          <textarea
            required
            bind:value={message}
            rows={5}
            placeholder="How can we help?"
            class="resize-none rounded-xl border-2 border-border bg-bg px-4 py-3 text-sm font-normal text-text outline-none focus:border-primary"
          ></textarea>
        </label>

        <button
          type="submit"
          disabled={sending}
          class="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-bold text-bg active:scale-95 disabled:opacity-60"
        >
          <Send class="size-4.5" />
          {sending ? "Sending..." : "Send message"}
        </button>

        {#if sent}
          <p class="text-center text-xs text-muted">
            Thanks! Your message has been sent.
          </p>
        {/if}
        {#if error}
          <p class="text-center text-xs text-red-500">{error}</p>
        {/if}
      </form>

      <div class="flex justify-center gap-5">
        {#each SOCIAL_LINKS as link (link.url)}
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us: {link.label}"
            class="text-muted transition-colors active:scale-95"
          >
            <SocialIcon url={link.url} class="size-6" />
          </a>
        {/each}
      </div>
    </div>
  </div>
</div>
