<script lang="ts">
	import { authUser, userProfile } from '$lib/stores/auth';
	import { ACTIVITIES, type SkillLevel, type ActivityFormat } from '$lib/types';
	import { get } from 'svelte/store';
	import BottomNav from '$lib/components/BottomNav.svelte';

	let editing = $state(false);
	let saving = $state(false);

	let displayName = $state($userProfile?.displayName ?? '');
	let bio = $state($userProfile?.bio ?? '');
	let city = $state($userProfile?.city ?? '');

	$effect(() => {
		if ($userProfile) {
			displayName = $userProfile.displayName;
			bio = $userProfile.bio ?? '';
			city = $userProfile.city ?? '';
		}
	});

	async function save() {
		saving = true;
		const uid = get(authUser)?.uid;
		if (uid) {
			await userProfile.save(uid, { displayName, bio, city });
		}
		saving = false;
		editing = false;
	}

	async function logout() {
		await authUser.signOut();
	}
</script>

<div class="flex min-h-screen flex-col bg-bg pb-24">
	<!-- Header -->
	<div class="flex items-center justify-between px-5 pb-4 pt-12">
		<h1 class="text-2xl font-black text-text">Profile</h1>
		<button
			onclick={() => (editing = !editing)}
			class="rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary active:scale-95"
		>
			{editing ? 'Cancel' : 'Edit'}
		</button>
	</div>

	<!-- Avatar + basic info -->
	<div class="flex flex-col items-center gap-3 px-5 pb-6">
		<div class="flex size-24 items-center justify-center rounded-full bg-primary/20 text-6xl">
			{$userProfile?.photoURL ? '' : '👤'}
			{#if $userProfile?.photoURL}
				<img
					src={$userProfile.photoURL}
					alt={$userProfile.displayName}
					class="h-full w-full rounded-full object-cover"
				/>
			{/if}
		</div>
		{#if editing}
			<input
				type="text"
				bind:value={displayName}
				class="rounded-2xl border-2 border-gray-200 bg-surface px-4 py-3 text-base font-bold text-center text-text w-full outline-none focus:border-primary"
			/>
			<textarea
				bind:value={bio}
				rows={2}
				placeholder="Your bio…"
				class="w-full rounded-2xl border-2 border-gray-200 bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
			></textarea>
			<input
				type="text"
				bind:value={city}
				placeholder="City"
				class="w-full rounded-2xl border-2 border-gray-200 bg-surface px-4 py-3 text-base text-text outline-none focus:border-primary"
			/>
			<button
				onclick={save}
				disabled={saving}
				class="w-full rounded-2xl bg-primary py-4 font-bold text-white active:scale-95 disabled:opacity-50"
			>
				{saving ? 'Saving…' : 'Save changes'}
			</button>
		{:else}
			<h2 class="text-xl font-black text-text">{$userProfile?.displayName ?? '—'}</h2>
			{#if $userProfile?.city}
				<p class="text-sm text-muted">📍 {$userProfile.city}</p>
			{/if}
			{#if $userProfile?.bio}
				<p class="text-center text-sm text-muted">{$userProfile.bio}</p>
			{/if}
		{/if}
	</div>

	<!-- Activities -->
	<div class="px-5">
		<h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-muted">My Sports</h3>
		{#if ($userProfile?.activities?.length ?? 0) === 0}
			<p class="text-sm text-muted">No activities set</p>
		{:else}
			<div class="flex flex-col gap-3">
				{#each $userProfile?.activities ?? [] as act}
					{@const info = ACTIVITIES.find((a) => a.id === act.id)}
					<div class="flex items-center gap-4 rounded-2xl bg-surface p-4 shadow-sm">
						<span class="text-3xl">{info?.emoji ?? '🏃'}</span>
						<div class="flex-1">
							<p class="font-bold text-text">{info?.label ?? act.id}</p>
							<p class="text-sm text-muted">{act.format} · {act.level}</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Logout -->
	<div class="mt-auto px-5 pt-8">
		<button
			onclick={logout}
			class="w-full rounded-2xl border-2 border-error/30 py-4 text-base font-semibold text-error active:scale-95"
		>
			Sign out
		</button>
	</div>

	<BottomNav active="profile" />
</div>
