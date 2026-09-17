import { getAllPosts } from "$lib/blog";

// static marketing content, no auth/Firestore dependency - safe to prerender like the homepage
export const prerender = true;
export const ssr = true;

export function load() {
    return {
        posts: getAllPosts().map((post) => ({ slug: post.slug, metadata: post.metadata })),
    };
}
