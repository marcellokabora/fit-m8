<script lang="ts">
  import Logo from "$lib/components/LogoText.svelte";
  import SocialIcon from "$lib/components/SocialIcon.svelte";
  import { SOCIAL_LINKS } from "$lib/social";
</script>

<div
  class="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 text-center"
>
  <a href="https://fit-m8.app" target="_blank" rel="noopener noreferrer">
    <Logo class="h-auto w-52 text-primary opacity-90" />
  </a>
  <h2 class="text-3xl font-bold text-text text-balance">
    Let's build the home for sports partners together.
  </h2>
  <div class="flex justify-center gap-5">
    {#each SOCIAL_LINKS as link (link.url)}
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={link.label}
        class="text-muted transition-colors active:scale-95"
      >
        <SocialIcon url={link.url} class="size-6" />
      </a>
    {/each}
  </div>
  <a
    href="mailto:marcellokabora+fit-m8@gmail.com"
    class="font-semibold text-primary text-lg"
  >
    marcellokabora@gmail.com
  </a>
  <p class="text-sm text-muted">Thank you.</p>
</div>
