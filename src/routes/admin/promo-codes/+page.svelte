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
  import {
    Check,
    Copy,
    LoaderCircle,
    Plus,
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
  let codes = $state<PromoCode[]>([]);
  // Rendered client-side per code — data URLs aren't worth persisting to Firestore
  let qrDataUrls = $state<Record<string, string>>({});
  let copiedCode = $state<string | null>(null);
  let confirmDelete = $state<string | null>(null);

  function promoUrl(code: string) {
    return `${page.url.origin}/premium?promo=${code}`;
  }

  async function buildQr(code: string) {
    qrDataUrls[code] = await QRCode.toDataURL(promoUrl(code), {
      margin: 1,
      width: 240,
    });
  }

  async function loadCodes() {
    loading = true;
    const snap = await getDocs(collection(db, "promoCodes"));
    codes = snap.docs
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
    await Promise.all(codes.map((c) => buildQr(c.code)));
    loading = false;
  }

  $effect(() => {
    if ($isAdmin === undefined) return; // still resolving auth state / the claim check
    if ($isAdmin) loadCodes();
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
    const code = randomCode();
    await setDoc(doc(db, "promoCodes", code), {
      active: true,
      createdAt: serverTimestamp(),
      createdBy: $authUser?.uid ?? null,
    });
    await buildQr(code);
    codes = [{ code, active: true, createdAt: new Date() }, ...codes];
    generating = false;
  }

  async function copyLink(code: string) {
    await navigator.clipboard.writeText(promoUrl(code));
    copiedCode = code;
    setTimeout(() => (copiedCode = null), 1500);
  }

  async function deleteCode(code: string) {
    await deleteDoc(doc(db, "promoCodes", code));
    codes = codes.filter((c) => c.code !== code);
    delete qrDataUrls[code];
    confirmDelete = null;
  }
</script>

<div class="flex min-h-dvh flex-col bg-bg pb-12">
  <BackHeader title="Promo codes" href="/profile" class="bg-bg" />

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
    <div class="flex flex-col gap-3 px-5">
      <button
        onclick={generateCode}
        disabled={generating}
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white active:scale-95 disabled:opacity-50"
      >
        {#if generating}
          <LoaderCircle class="size-4 animate-spin" />
        {:else}
          <Plus class="size-4" />
        {/if}
        Generate free membership code
      </button>

      {#if codes.length === 0}
        <p class="py-8 text-center text-sm text-muted">No codes yet.</p>
      {/if}

      {#each codes as c (c.code)}
        <div
          class="flex flex-col items-center gap-3 rounded-2xl bg-surface p-4 shadow-sm"
        >
          {#if qrDataUrls[c.code]}
            <img
              src={qrDataUrls[c.code]}
              alt={`QR code for ${c.code}`}
              class="size-40 rounded-lg bg-white p-2"
            />
          {/if}
          <p class="font-mono text-sm font-bold text-text">{c.code}</p>
          <div class="flex w-full gap-2">
            <button
              onclick={() => copyLink(c.code)}
              class="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary/10 py-2 text-xs font-bold text-primary active:scale-95"
            >
              {#if copiedCode === c.code}
                <Check class="size-3.5" />
                Copied
              {:else}
                <Copy class="size-3.5" />
                Copy link
              {/if}
            </button>
            {#if confirmDelete === c.code}
              <button
                onclick={() => deleteCode(c.code)}
                class="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-error py-2 text-xs font-bold text-white active:scale-95"
              >
                Confirm delete?
              </button>
            {:else}
              <button
                onclick={() => (confirmDelete = c.code)}
                aria-label={`Delete code ${c.code}`}
                class="flex items-center justify-center rounded-xl bg-error/10 px-3 py-2 text-error active:scale-95"
              >
                <Trash2 class="size-3.5" />
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
