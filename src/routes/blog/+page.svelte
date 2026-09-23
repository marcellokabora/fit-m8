<script lang="ts">
  import BlogPostCard from "$lib/components/blog/BlogPostCard.svelte";
  import SiteHeader from "$lib/components/SiteHeader.svelte";
  import type { BlogPostMetadata } from "$lib/blog";

  let {
    data,
  }: { data: { posts: { slug: string; metadata: BlogPostMetadata }[] } } =
    $props();
</script>

<svelte:head>
  <title>Blog · FIT-M8</title>
  <meta
    name="description"
    content="Tips on finding sports partners, training buddies, and staying active - from the FIT-M8 team."
  />
  <link rel="canonical" href="https://fit-m8.app/blog" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Blog · FIT-M8" />
  <meta
    property="og:description"
    content="Tips on finding sports partners, training buddies, and staying active - from the FIT-M8 team."
  />
  <meta property="og:url" content="https://fit-m8.app/blog" />
  <meta
    property="og:image"
    content="https://fit-m8.app/logo/social-preview.png"
  />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Blog · FIT-M8" />
  <meta
    name="twitter:description"
    content="Tips on finding sports partners, training buddies, and staying active - from the FIT-M8 team."
  />
  <meta
    name="twitter:image"
    content="https://fit-m8.app/logo/social-preview.png"
  />
</svelte:head>

<div class="mx-auto w-full container">
  <SiteHeader />

  <div class="grid grid-cols-1 gap-4 px-5 pt-2 sm:grid-cols-2 lg:grid-cols-3">
    {#each data.posts as post (post.slug)}
      <BlogPostCard {post} />
    {/each}
  </div>
</div>
