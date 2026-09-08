<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import {
    collection,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    serverTimestamp,
  } from "firebase/firestore";
  import QRCode from "qrcode";
  import { db } from "$lib/firebase/client";
  import { authUser } from "$lib/stores/auth";
  import { isAdmin } from "$lib/stores/admin";
  import BackHeader from "$lib/components/BackHeader.svelte";
  import Logo from "$lib/components/Logo.svelte";
  import {
    Check,
    Copy,
    LoaderCircle,
    RefreshCw,
    ShieldAlert,
    Trash2,
  } from "@lucide/svelte";

  interface PromoCode {
    code: string;
    active: boolean;
    createdAt?: Date;
  }

  let loading = $state(true);
  let generating = $state(false);
  let current = $state<PromoCode | null>(null);
  // Rendered client-side — the data URL isn't worth persisting to Firestore
  let qrDataUrl = $state<string | null>(null);
  let copied = $state(false);
  let confirmDelete = $state(false);

  function promoUrl(code: string) {
    return `${page.url.origin}/premium?promo=${code}`;
  }

  async function buildQr(code: string) {
    qrDataUrl = await QRCode.toDataURL(promoUrl(code), {
      margin: 1,
      width: 240,
    });
  }

  async function loadCode() {
    loading = true;
    const snap = await getDocs(collection(db, "promoCodes"));
    const codes = snap.docs
      .map((d) => {
        const data = d.data();
        return {
          code: d.id,
          active: data.active !== false,
          createdAt: data.createdAt?.toDate?.(),
        };
      })
      .sort(
        (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
      );
    current = codes[0] ?? null;
    if (current) await buildQr(current.code);
    loading = false;
  }

  $effect(() => {
    if ($isAdmin === undefined) return; // still resolving auth state / the claim check
    if ($isAdmin) loadCode();
    else goto("/discover");
  });

  // Avoids visually-ambiguous characters (0/O, 1/I) since codes may be typed in by hand
  function randomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let suffix = "";
    for (let i = 0; i < 8; i++) {
      suffix += chars[Math.floor(Math.random() * chars.length)];
    }
    return `FITM8-${suffix}`;
  }

  async function generateCode() {
    generating = true;
    // Only one active code at a time — replace whatever came before
    if (current) await deleteDoc(doc(db, "promoCodes", current.code));
    const code = randomCode();
    await setDoc(doc(db, "promoCodes", code), {
      active: true,
      createdAt: serverTimestamp(),
      createdBy: $authUser?.uid ?? null,
    });
    await buildQr(code);
    current = { code, active: true, createdAt: new Date() };
    confirmDelete = false;
    generating = false;
  }

  async function copyLink() {
    if (!current) return;
    await navigator.clipboard.writeText(promoUrl(current.code));
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }

  async function deleteCode() {
    if (!current) return;
    await deleteDoc(doc(db, "promoCodes", current.code));
    current = null;
    qrDataUrl = null;
    confirmDelete = false;
  }
</script>

<div class="flex min-h-dvh flex-col bg-bg pb-12">
  <BackHeader title="Promo code" href="/profile" class="bg-bg" />

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
  {:else}
    <div class="flex flex-1 flex-col gap-4 px-5">
      {#if current}
        <div
          class="relative flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden rounded-3xl bg-surface p-8 shadow-sm"
        >
          <Logo class="h-10 w-auto text-primary" />
          {#if qrDataUrl}
            <img
              src={qrDataUrl}
              alt={`QR code for ${current.code}`}
              class="size-52 rounded-2xl bg-white p-3 shadow-sm"
            />
          {/if}
          <p class="font-mono text-xl font-black tracking-widest text-text">
            {current.code}
          </p>
          <div class="flex w-full max-w-xs gap-2">
            <button
              onclick={copyLink}
              class="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary/10 py-2.5 text-xs font-bold text-primary active:scale-95"
            >
              {#if copied}
                <Check class="size-3.5" />
                Copied
              {:else}
                <Copy class="size-3.5" />
                Copy link
              {/if}
            </button>
            {#if confirmDelete}
              <button
                onclick={deleteCode}
                class="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-error py-2.5 text-xs font-bold text-white active:scale-95"
              >
                Confirm delete?
              </button>
            {:else}
              <button
                onclick={() => (confirmDelete = true)}
                aria-label="Delete code"
                class="flex items-center justify-center rounded-xl bg-error/10 px-3.5 py-2.5 text-error active:scale-95"
              >
                <Trash2 class="size-3.5" />
              </button>
            {/if}
          </div>
        </div>
      {:else}
        <div
          class="flex flex-1 flex-col items-center justify-center gap-3 rounded-3xl bg-surface p-8 text-center shadow-sm"
        >
          <Logo class="h-10 w-auto text-primary" />
          <p class="text-sm text-muted">No active promo code yet.</p>
        </div>
      {/if}

      <button
        onclick={generateCode}
        disabled={generating}
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white active:scale-95 disabled:opacity-50"
      >
        {#if generating}
          <LoaderCircle class="size-4 animate-spin" />
        {:else}
          <RefreshCw class="size-4" />
        {/if}
        {current ? "Generate new code" : "Generate free membership code"}
      </button>
    </div>
  {/if}
</div>
