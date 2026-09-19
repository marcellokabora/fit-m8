<script lang="ts">
  import BlogHeader from "$lib/components/blog/BlogHeader.svelte";
  import SocialIcon from "$lib/components/SocialIcon.svelte";
  import { SOCIAL_LINKS } from "$lib/social";
  import { Mail, Send } from "@lucide/svelte";

  const CONTACT_EMAIL = "marcellokabora+fit-m8@gmail.com";
  const CONTACT_EMAIL_DISPLAY = "info@fit-m8.app";

  let name = $state("");
  let email = $state("");
  let message = $state("");
  let sent = $state(false);

  // No backend to send mail from (static site) - hand off to the visitor's own mail client instead.
  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(
      name ? `FIT-M8 contact form — ${name}` : "FIT-M8 contact form",
    );
    const body = encodeURIComponent(
      [message, "", email ? `Reply to: ${email}` : ""]
        .filter(Boolean)
        .join("\n"),
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    sent = true;
  }
</script>

<svelte:head>
  <title>Contact · FIT-M8</title>
  <meta
    name="description"
    content="Get in touch with the FIT-M8 team - questions, feedback, or support."
  />
  <link rel="canonical" href="https://fit-m8.app/contact" />
</svelte:head>

<div class="flex min-h-dvh flex-col bg-bg pb-16">
  <div class="mx-auto flex w-full max-w-3xl flex-1 flex-col">
    <BlogHeader />

    <div class="flex flex-col gap-6 px-5 pt-6 text-text">
      <div class="flex flex-col gap-1">
        <a href="/" class="text-xs font-semibold text-primary"
          >&larr; Back to home</a
        >
        <h1 class="text-2xl font-black text-text">Contact</h1>
      </div>

      <p class="text-sm leading-relaxed text-muted">
        Questions, feedback, or need a hand with your account? We'd love to hear
        from you.
      </p>

      <a
        href="mailto:{CONTACT_EMAIL}"
        class="flex items-center gap-3 rounded-2xl border-2 border-border px-4 py-3 font-semibold text-primary active:scale-95"
      >
        <Mail class="size-5 shrink-0" />
        {CONTACT_EMAIL_DISPLAY}
      </a>

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
          class="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-bold text-white active:scale-95"
        >
          <Send class="size-4.5" />
          Send message
        </button>

        {#if sent}
          <p class="text-center text-xs text-muted">
            Opening your email app to finish sending...
          </p>
        {/if}
      </form>
    </div>
  </div>
</div>
