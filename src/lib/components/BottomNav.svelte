<script lang="ts">
  import { Compass, Zap, MessageCircle, User } from "@lucide/svelte";
  import { unreadMatchCount } from "$lib/stores/unread";
  import { activeLanguage, createTranslator } from "$lib/stores/language";
  import { authUser } from "$lib/stores/auth";

  let { active }: { active: "discover" | "explore" | "matches" | "profile" } =
    $props();

  let t = $derived(createTranslator($activeLanguage));
  // Unverified email/password accounts are stuck on the Discover verification gate;
  // block navigation elsewhere until they confirm their inbox link.
  let needsVerification = $derived($authUser?.emailVerified === false);
  const tabs = [
    { id: "discover", href: "/discover", icon: Zap, key: "nav.discover" },
    { id: "explore", href: "/explore", icon: Compass, key: "nav.explore" },
    {
      id: "matches",
      href: "/matches",
      icon: MessageCircle,
      key: "nav.matches",
    },
    { id: "profile", href: "/profile", icon: User, key: "nav.profile" },
  ] as const;
</script>

<nav
  class="fixed bottom-0 inset-x-0 z-40 mx-auto w-full border-t border-border bg-surface pb-safe md:max-w-md"
>
  <div class="flex">
    {#each tabs as tab}
      <a
        href={tab.href}
        aria-disabled={needsVerification}
        tabindex={needsVerification ? -1 : 0}
        onclick={(e) => {
          if (needsVerification) e.preventDefault();
        }}
        class="relative flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors {tab.id ===
        active
          ? 'text-primary'
          : 'text-muted'} {needsVerification
          ? 'pointer-events-none opacity-40'
          : ''}"
      >
        <span class="relative">
          <tab.icon class="size-6" />
          {#if tab.id === "matches" && $unreadMatchCount > 0}
            <span
              class="absolute -right-1.5 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white"
            >
              {$unreadMatchCount > 9 ? "9+" : $unreadMatchCount}
            </span>
          {/if}
        </span>
        {t.t(tab.key)}
      </a>
    {/each}
  </div>
</nav>
