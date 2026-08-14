<script lang="ts">
  import {
    Footprints,
    CircleDot,
    Disc,
    Volleyball,
    Circle,
    Bike,
    WavesHorizontal,
    Mountain,
    Feather,
    Table2,
    Disc2,
    Box,
    Disc3,
    Dumbbell,
    MountainSnow,
    Flag,
    Swords,
    Sword,
    Activity,
  } from "@lucide/svelte";
  import type { ActivityId } from "$lib/types";

  let {
    id,
    class: className = "size-5",
  }: { id: ActivityId | string; class?: string } = $props();

  const ICONS: Record<string, typeof Activity> = {
    jogging: Footprints,
    padel: CircleDot,
    tennis: Disc,
    "beach-volley": Volleyball,
    basketball: Circle,
    cycling: Bike,
    swimming: WavesHorizontal,
    hiking: Mountain,
    badminton: Feather,
    "ping-pong": Table2,
    pickleball: Disc2,
    squash: Box,
    racquetball: Disc3,
    gym: Dumbbell,
    "rock-climbing": MountainSnow,
    golf: Flag,
    "martial-arts": Swords,
    fencing: Sword,
  };

  let Icon = $derived(ICONS[id] ?? Activity);
</script>

<Icon class={className} />
