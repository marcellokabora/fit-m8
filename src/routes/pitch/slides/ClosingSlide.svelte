<script lang="ts">
  import Logo from "$lib/components/Logo.svelte";
  import SocialIcon from "$lib/components/SocialIcon.svelte";

  const SOCIAL_LINKS = [
    { url: "https://www.facebook.com/", label: "Facebook" },
    { url: "https://www.instagram.com/", label: "Instagram" },
    { url: "https://www.youtube.com/", label: "YouTube" },
  ];
</script>

<div
  class="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 text-center"
>
  <Logo class="h-auto w-40 text-primary opacity-90 md:w-52" />
  <h2 class="text-xl font-bold text-text md:text-3xl text-balance">
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
        <SocialIcon url={link.url} class="size-5 md:size-6" />
      </a>
    {/each}
  </div>
  <a
    href="mailto:marcellokabora@gmail.com"
    class="font-semibold text-primary md:text-lg"
  >
    marcellokabora@gmail.com
  </a>
  <p class="text-xs text-muted md:text-sm">Thank you.</p>
</div>
