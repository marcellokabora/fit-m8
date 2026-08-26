<script lang="ts">
  import Jogging from "~icons/material-symbols/directions-run";
  import Padel from "~icons/material-symbols/padel";
  import Tennis from "~icons/material-symbols/sports-tennis";
  import BeachVolley from "~icons/material-symbols/sports-volleyball";
  import Basketball from "~icons/material-symbols/sports-basketball";
  import Soccer from "~icons/material-symbols/sports-soccer";
  import Cycling from "~icons/material-symbols/pedal-bike";
  import Swimming from "~icons/material-symbols/pool";
  import Hiking from "~icons/material-symbols/hiking";
  import Badminton from "~icons/material-symbols/badminton";
  import PingPong from "~icons/mdi/table-tennis";
  import Pickleball from "~icons/material-symbols/pickleball";
  import Squash from "~icons/mdi/squash";
  import Frescobol from "~icons/mdi/racquetball";
  import Gym from "~icons/material-symbols/sports-gymnastics";
  import Calisthenics from "~icons/mdi/arm-flex";
  import RockClimbing from "~icons/mdi/rock-climbing";
  import Golf from "~icons/material-symbols/sports-golf";
  import MartialArts from "~icons/material-symbols/sports-martial-arts";
  import Paddleboard from "~icons/material-symbols/kayaking";
  import Generic from "~icons/material-symbols/sports-outline";
  import type { ActivityId } from "$lib/types";

  let {
    id,
    class: className = "size-5",
  }: { id: ActivityId | string; class?: string } = $props();

  const ICONS: Record<string, typeof Jogging> = {
    jogging: Jogging,
    padel: Padel,
    tennis: Tennis,
    "beach-volley": BeachVolley,
    basketball: Basketball,
    soccer: Soccer,
    cycling: Cycling,
    swimming: Swimming,
    hiking: Hiking,
    badminton: Badminton,
    "ping-pong": PingPong,
    pickleball: Pickleball,
    squash: Squash,
    frescobol: Frescobol,
    gym: Gym,
    calisthenics: Calisthenics,
    "rock-climbing": RockClimbing,
    golf: Golf,
    "martial-arts": MartialArts,
    paddleboard: Paddleboard,
  };

  let Icon = $derived(ICONS[id] ?? Generic);
</script>

<Icon class={className} />
