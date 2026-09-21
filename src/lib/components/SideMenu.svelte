<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import type { Component } from "svelte";
  import { goto } from "$app/navigation";
  import {
    Menu,
    X,
    Mail,
    Home,
    Newspaper,
    FileText,
    ShieldCheck,
    Presentation,
    LogIn,
  } from "@lucide/svelte";
  import SocialIcon from "$lib/components/SocialIcon.svelte";
  import { SOCIAL_LINKS } from "$lib/social";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  interface SideMenuLink {
    href: string;
    label: string;
    icon: Component;
  }

  let {
    authState = "checking",
    appDestination = "/app/discover",
    onSignIn,
  }: {
    authState?: "checking" | "guest" | "loggedIn";
    appDestination?: string;
    onSignIn?: () => void;
  } = $props();

  let t = $derived(createTranslator($activeLanguage));

  let open = $state(false);

  const LINKS: SideMenuLink[] = [
    { href: "/", label: "Home", icon: Home },
    { href: "/blog", label: "Blog", icon: Newspaper },
    { href: "/pitch", label: "Pitch", icon: Presentation },
    { href: "/contact", label: "Contact", icon: Mail },
  ];

  function handleAuthCta() {
    close();
    if (authState === "loggedIn") {
      goto(appDestination);
      return;
    }
    onSignIn?.();
  }

  // lower-priority legal links, styled smaller and pinned near the social icons at the bottom
  const SECONDARY_LINKS: SideMenuLink[] = [
    { href: "/terms", label: "Terms of Service", icon: FileText },
    { href: "/privacy", label: "Privacy Policy", icon: ShieldCheck },
  ];

  function close() {
    open = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") close();
  }

  $effect(() => {
    if (!open) return;
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  });
</script>

<button
  type="button"
  onclick={() => (open = true)}
  aria-label="Open menu"
  class="fixed left-4 cursor-pointer top-[calc(1rem+env(safe-area-inset-top))] z-40 flex size-10 items-center justify-center rounded-full bg-surface/90 text-text shadow-md backdrop-blur-sm active:scale-95"
>
  <Menu class="size-5" />
</button>

{#if open}
  <div
    transition:fade={{ duration: 150 }}
    onclick={close}
    onkeydown={handleKeydown}
    role="button"
    tabindex="-1"
    aria-label="Close menu"
    class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
  ></div>
  <nav
    transition:fly={{ x: -280, duration: 200 }}
    aria-label="Side menu"
    class="fixed inset-y-0 left-0 z-50 flex w-120 max-w-[80vw] flex-col gap-1 bg-surface p-5 pt-[calc(1.25rem+env(safe-area-inset-top))] shadow-2xl"
  >
    <button
      type="button"
      onclick={close}
      aria-label="Close menu"
      class="mb-4 flex size-10 items-center justify-center self-start rounded-full text-text active:scale-95"
    >
      <X class="size-5" />
    </button>

    <!-- the app's primary action, so it stands out from the plain nav links below -->
    <button
      type="button"
      disabled={authState === "checking"}
      onclick={handleAuthCta}
      class="mb-3 flex w-50 items-center justify-center gap-2 rounded-full border-2 border-primary py-3.5 text-base font-bold text-white shadow-md active:scale-95 disabled:opacity-60"
    >
      {#if authState === "checking"}
        <span
          class="size-5 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white"
        ></span>
      {:else}
        <LogIn class="size-5" />
      {/if}
      {authState === "loggedIn" ? t.t("home.openApp") : t.t("auth.signIn")}
    </button>

    {#each LINKS as link (link.href)}
      <a
        href={link.href}
        onclick={close}
        class="flex items-center gap-2 rounded-xl px-3 py-3 text-base font-semibold text-text active:scale-95"
      >
        <link.icon class="size-4.5 shrink-0" />
        {link.label}
      </a>
    {/each}

    <div class="mt-auto flex flex-col gap-1">
      {#each SECONDARY_LINKS as link (link.href)}
        <a
          href={link.href}
          onclick={close}
          class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted active:scale-95"
        >
          <link.icon class="size-4 shrink-0" />
          {link.label}
        </a>
      {/each}

      <div class="flex items-center gap-4 px-3 pt-3">
        {#each SOCIAL_LINKS as link (link.url)}
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us: {link.label}"
            class="text-muted transition-colors active:scale-95"
          >
            <SocialIcon url={link.url} class="size-4.5" />
          </a>
        {/each}
      </div>
    </div>
  </nav>
{/if}
