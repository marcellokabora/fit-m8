<script lang="ts">
  import { storage } from "$lib/firebase/client";
  import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
  } from "firebase/storage";
  import { compressImage } from "$lib/image";
  import { Plus, X, Loader2 } from "@lucide/svelte";

  const MAX_PHOTOS = 3;

  let {
    photos = $bindable([]),
    uid,
    onchange,
  }: {
    photos: string[];
    uid: string;
    onchange?: (photos: string[]) => void;
  } = $props();

  let uploadingIndex = $state<number | null>(null);
  let error = $state("");

  async function handleFileChange(e: Event, index: number) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    error = "";
    if (!file.type.startsWith("image/")) {
      error = "Please choose an image file";
      input.value = "";
      return;
    }
    if (!uid) return;

    uploadingIndex = index;
    try {
      const compressed = await compressImage(file);
      // Unique path per upload — slot index shifts when photos are removed, so
      // reusing the index as the filename would let a later upload overwrite
      // and invalidate the download token of an unrelated existing photo.
      const photoRef = ref(storage, `avatars/${uid}/${crypto.randomUUID()}`);
      await uploadBytes(photoRef, compressed);
      const url = await getDownloadURL(photoRef);
      const next = [...photos];
      next[index] = url;
      photos = next;
      onchange?.(next);
    } catch (err: any) {
      error = err.message ?? "Upload failed";
    } finally {
      uploadingIndex = null;
      input.value = "";
    }
  }

  async function removePhoto(index: number) {
    const urlToRemove = photos[index];
    const next = photos.filter((_, i) => i !== index);
    photos = next;
    onchange?.(next);
    if (!urlToRemove) return;
    try {
      // Delete by the photo's own URL (not the slot index), since the index
      // no longer maps 1:1 to a fixed storage path.
      await deleteObject(ref(storage, urlToRemove));
    } catch {
      // file may already be gone, ignore
    }
  }
</script>

<div class="flex w-full flex-col gap-2">
  <div class="grid w-full grid-cols-3 gap-3">
    {#each Array(MAX_PHOTOS) as _, index}
      <div class="relative aspect-3/4 w-full">
        {#if photos[index]}
          <img
            src={photos[index]}
            alt="Profile photo {index + 1}"
            class="h-full w-full rounded-2xl object-cover"
          />
          {#if index === 0}
            <span
              class="absolute bottom-1 left-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white"
            >
              Main
            </span>
          {/if}
          <button
            onclick={() => removePhoto(index)}
            aria-label="Remove photo"
            class="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-error text-white shadow-sm active:scale-95"
          >
            <X class="size-3.5" />
          </button>
        {:else}
          <label
            class="flex h-full w-full items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface text-muted active:scale-95"
          >
            {#if uploadingIndex === index}
              <Loader2 class="size-6 animate-spin" />
            {:else}
              <Plus class="size-6" />
            {/if}
            <input
              type="file"
              accept="image/*"
              onchange={(e) => handleFileChange(e, index)}
              disabled={uploadingIndex !== null}
              class="hidden"
            />
          </label>
        {/if}
      </div>
    {/each}
  </div>
  {#if error}
    <p class="text-sm text-error">{error}</p>
  {/if}
</div>
