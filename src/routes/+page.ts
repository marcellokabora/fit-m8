// overrides the root layout's ssr=false/prerender=false so this public marketing page
// gets baked into real static HTML at build time (SEO/social crawlers, faster first paint)
export const prerender = true;
export const ssr = true;
