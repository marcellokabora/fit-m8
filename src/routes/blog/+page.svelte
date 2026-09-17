<script lang="ts">
  import BlogHeader from "$lib/components/blog/BlogHeader.svelte";
  import BlogPostCard from "$lib/components/blog/BlogPostCard.svelte";
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
</svelte:head>

<div class="flex min-h-dvh flex-col bg-bg pb-16">
  <div class="mx-auto flex w-full max-w-5xl flex-1 flex-col">
    <BlogHeader />

    <div class="grid grid-cols-1 gap-4 px-5 pt-2 sm:grid-cols-2 lg:grid-cols-3">
      {#each data.posts as post (post.slug)}
        <BlogPostCard {post} />
      {/each}
    </div>
  </div>
</div>
