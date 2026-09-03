<script lang="ts">
  import Jogging from "~icons/material-symbols/directions-run";
  import Padel from "~icons/material-symbols/padel";
  import Tennis from "~icons/material-symbols/sports-tennis";
  import BeachVolley from "~icons/material-symbols/sports-volleyball";
  import Footvolley from "~icons/mdi/volleyball";
  import Basketball from "~icons/material-symbols/sports-basketball";
  import Soccer from "~icons/material-symbols/sports-soccer";
  import Cycling from "~icons/material-symbols/pedal-bike";
  import Swimming from "~icons/material-symbols/pool";
  import Hiking from "~icons/material-symbols/hiking";
  import PingPong from "~icons/mdi/table-tennis";
  import Pickleball from "~icons/material-symbols/pickleball";
  import Squash from "~icons/mdi/squash";
  import Frescobol from "~icons/mdi/racquetball";
  import Gym from "~icons/material-symbols/sports-gymnastics";
  import Calisthenics from "~icons/mdi/arm-flex";
  import Bodybuilding from "~icons/mdi/dumbbell";
  import CrossTraining from "~icons/material-symbols/fitness-center";
  import FunctionalFitness from "~icons/material-symbols/exercise";
  import BootCamp from "~icons/mdi/whistle";
  import Yoga from "~icons/mdi/yoga";
  import Pilates from "~icons/material-symbols/self-improvement";
  import Meditation from "~icons/mdi/meditation";
  import Breathwork from "~icons/mdi/lungs";
  import RockClimbing from "~icons/mdi/rock-climbing";
  import Golf from "~icons/material-symbols/sports-golf";
  import MartialArts from "~icons/material-symbols/sports-martial-arts";
  import Boxing from "~icons/mdi/boxing-glove";
  import Kickboxing from "~icons/mdi/kickboxing";
  import Karate from "~icons/mdi/karate";
  import Mma from "~icons/mdi/mma";
  import Salsa from "~icons/mdi/human-female-dance";
  import Bachata from "~icons/mdi/dance-ballroom";
  import Barre from "~icons/mdi/ballet";
  import PoleDance from "~icons/mdi/dance-pole";
  import Trampoline from "~icons/mdi/gymnastics";
  import Paddleboard from "~icons/material-symbols/kayaking";
  import Kayak from "~icons/mdi/kayaking";
  import Surf from "~icons/material-symbols/surfing";
  import Rollerblade from "~icons/material-symbols/roller-skating";
  import Skateboard from "~icons/material-symbols/skateboarding";
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
    beachVolley: BeachVolley,
    footVolley: Footvolley,
    basketball: Basketball,
    soccer: Soccer,
    cycling: Cycling,
    swimming: Swimming,
    hiking: Hiking,
    pingPong: PingPong,
    pickleball: Pickleball,
    squash: Squash,
    frescobol: Frescobol,
    gym: Gym,
    calisthenics: Calisthenics,
    bodybuilding: Bodybuilding,
    crossTraining: CrossTraining,
    functionalFitness: FunctionalFitness,
    bootCamp: BootCamp,
    yoga: Yoga,
    pilates: Pilates,
    meditation: Meditation,
    breathwork: Breathwork,
    rockClimbing: RockClimbing,
    golf: Golf,
    boxing: Boxing,
    kickboxing: Kickboxing,
    muayThai: MartialArts,
    karate: Karate,
    jiuJitsu: MartialArts,
    judo: MartialArts,
    mma: Mma,
    salsa: Salsa,
    bachata: Bachata,
    kizomba: Bachata,
    barre: Barre,
    poleDance: PoleDance,
    trampoline: Trampoline,
    paddleboard: Paddleboard,
    kayak: Kayak,
    surf: Surf,
    rollerblade: Rollerblade,
    skateboard: Skateboard,
  };

  let Icon = $derived(ICONS[id] ?? Generic);
</script>

<Icon class={className} />
