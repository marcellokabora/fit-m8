<script lang="ts">
	import '../app.css';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { authUser, userProfile } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	let { children } = $props();

	const PUBLIC_ROUTES = ['/auth', '/'];

	onMount(() => {
		return authUser.subscribe(async (user) => {
			const path = page.url.pathname;
			if (!user && !PUBLIC_ROUTES.includes(path)) {
				goto('/auth');
			} else if (user) {
				const hasProfile = await userProfile.load(user.uid);
				if (!hasProfile && path !== '/onboarding') {
					goto('/onboarding');
				}
			}
		});
	});
</script>

<svelte:head>
	<title>FitMate</title>
	<meta name="description" content="Match people for sports activities near you" />
</svelte:head>

<div class="min-h-screen bg-bg font-sans">
	{@render children()}
</div>
