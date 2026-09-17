import { error } from "@sveltejs/kit";
import { getPost } from "$lib/blog";
import type { PageLoad } from "./$types";

// static marketing content, no auth/Firestore dependency - safe to prerender like the homepage
export const prerender = true;
export const ssr = true;

export const load: PageLoad = ({ params }) => {
    const post = getPost(params.slug);
    if (!post) error(404, "Post not found");
    return { post };
};
