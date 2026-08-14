<script lang="ts">
	import { goto } from '$app/navigation';
	import { authUser } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	onMount(() => {
		return authUser.subscribe((user) => {
			if (user) goto('/discover');
		});
	});
</script>

<div class="flex min-h-screen flex-col items-center justify-between bg-primary px-6 pb-12 pt-20">
	<!-- Logo / Hero -->
	<div class="flex flex-col items-center gap-4 text-white">
		<div class="flex size-24 items-center justify-center rounded-3xl bg-accent shadow-xl">
			<span class="text-5xl">⚡</span>
		</div>
		<h1 class="text-5xl font-black tracking-tight">FitMate</h1>
		<p class="text-center text-lg font-medium opacity-80">
			Find your perfect sports partner.<br />Swipe. Match. Play.
		</p>
	</div>

	<!-- Activity bubbles -->
	<div class="flex flex-wrap justify-center gap-3">
		{#each ['🏃 Jogging', '🎾 Padel', '🏐 Beach Volley', '🎾 Tennis', '⚽ Football', '🚴 Cycling'] as activity}
			<span class="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
				{activity}
			</span>
		{/each}
	</div>

	<!-- CTA -->
	<div class="flex w-full flex-col gap-3">
		<a
			href="/auth"
			class="block w-full rounded-2xl bg-accent py-4 text-center text-lg font-bold text-text shadow-lg active:scale-95"
		>
			Get Started
		</a>
		<a
			href="/auth?mode=login"
			class="block w-full rounded-2xl border-2 border-white/30 py-4 text-center text-lg font-semibold text-white active:scale-95"
		>
			I already have an account
		</a>
	</div>
</div>
