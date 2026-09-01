<script lang="ts">
  import { goto } from "$app/navigation";
  import { collection, getDocs } from "firebase/firestore";
  import { db } from "$lib/firebase/client";
  import { authUser } from "$lib/stores/auth";
  import { isAdmin } from "$lib/stores/admin";
  import { adminDeleteUserData } from "$lib/firebase/account";
  import type { UserProfile } from "$lib/types";
  import BackHeader from "$lib/components/BackHeader.svelte";
  import { LoaderCircle, ShieldAlert, Trash2, User } from "@lucide/svelte";

  let loading = $state(true);
  let users = $state<UserProfile[]>([]);
  let deleteTarget = $state<UserProfile | null>(null);
  let deleting = $state(false);
  let deleteError = $state<string | null>(null);

  async function loadUsers() {
    loading = true;
    const snap = await getDocs(collection(db, "users"));
    const myUid = $authUser?.uid;
    users = snap.docs
      .map((d) => ({ uid: d.id, ...(d.data() as Omit<UserProfile, "uid">) }))
      // Fake seed accounts all use the "fake_<name>" doc id convention (see scripts/seed.cjs)
      .filter((u) => !u.uid.startsWith("fake_") && u.uid !== myUid)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
    loading = false;
  }

  $effect(() => {
    if ($isAdmin === undefined) return; // still resolving auth state / the claim check
    if ($isAdmin) loadUsers();
    else goto("/discover");
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    deleting = true;
    deleteError = null;
    try {
      await adminDeleteUserData(deleteTarget.uid);
      users = users.filter((u) => u.uid !== deleteTarget?.uid);
      deleteTarget = null;
    } catch (e: any) {
      deleteError = e?.message ?? "Something went wrong";
    } finally {
      deleting = false;
    }
  }
</script>

<div class="flex min-h-dvh flex-col bg-bg pb-12">
  <BackHeader title="Manage users" href="/profile" class="bg-bg" />

  {#if $isAdmin === undefined || loading}
    <div class="flex flex-1 items-center justify-center text-muted">
      <LoaderCircle class="size-10 animate-spin" />
    </div>
  {:else if !$isAdmin}
    <div
      class="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center text-muted"
    >
      <ShieldAlert class="size-10" />
      <p>You don't have access to this page.</p>
    </div>
  {:else if users.length === 0}
    <div
      class="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center text-muted"
    >
      <p>No real user accounts yet.</p>
    </div>
  {:else}
    <div class="flex flex-col gap-3 px-5">
      <p class="text-xs font-semibold text-muted">
        {users.length} account{users.length === 1 ? "" : "s"}
      </p>
      {#each users as u (u.uid)}
        <div
          class="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-sm"
        >
          <a
            href={`/profile/${u.uid}`}
            class="flex min-w-0 flex-1 items-center gap-3"
          >
            {#if u.photoURL}
              <img
                src={u.photoURL}
                alt={u.displayName}
                class="size-12 shrink-0 rounded-full object-cover"
              />
            {:else}
              <span
                class="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                <User class="size-5" />
              </span>
            {/if}
            <div class="min-w-0 flex-1">
              <p class="truncate font-bold text-text">
                {u.displayName || "(no name)"}
              </p>
              <p class="truncate text-sm text-muted">
                {[u.city, u.age ? `${u.age}y` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </a>
          <button
            onclick={() => {
              deleteTarget = u;
              deleteError = null;
            }}
            aria-label={`Delete ${u.displayName}`}
            class="flex size-9 shrink-0 items-center justify-center rounded-full bg-error/10 text-error active:scale-95"
          >
            <Trash2 class="size-4" />
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if deleteTarget}
  <div
    class="fixed inset-0 z-50 mx-auto flex w-full items-center justify-center bg-black/60 px-6 backdrop-blur-sm md:max-w-md"
  >
    <div
      class="flex flex-col items-center gap-4 rounded-3xl bg-surface p-8 text-center shadow-2xl"
    >
      <Trash2 class="size-12 text-error" />
      <h2 class="text-lg font-black text-text">
        Delete {deleteTarget.displayName}?
      </h2>
      <p class="text-sm text-muted">
        This permanently deletes their profile and photos from the database and
        storage. Their sign-in account is not affected. This can't be undone.
      </p>
      {#if deleteError}
        <p class="text-sm font-semibold text-error">{deleteError}</p>
      {/if}
      <div class="flex w-full gap-3">
        <button
          onclick={() => (deleteTarget = null)}
          disabled={deleting}
          class="flex-1 rounded-2xl border-2 border-border py-3 text-xs font-semibold text-text active:scale-95 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onclick={handleDelete}
          disabled={deleting}
          class="flex-1 rounded-2xl bg-error py-3 text-xs font-bold text-white active:scale-95 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  </div>
{/if}
