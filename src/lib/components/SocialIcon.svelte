<script lang="ts">
  import Instagram from "~icons/simple-icons/instagram";
  import Facebook from "~icons/simple-icons/facebook";
  import X from "~icons/simple-icons/x";
  import Whatsapp from "~icons/simple-icons/whatsapp";
  import Telegram from "~icons/simple-icons/telegram";
  import Tiktok from "~icons/simple-icons/tiktok";
  import Youtube from "~icons/simple-icons/youtube";
  import Linkedin from "~icons/simple-icons/linkedin";
  import Github from "~icons/simple-icons/github";
  import Discord from "~icons/simple-icons/discord";
  import Reddit from "~icons/simple-icons/reddit";
  import Pinterest from "~icons/simple-icons/pinterest";
  import Spotify from "~icons/simple-icons/spotify";
  import Snapchat from "~icons/simple-icons/snapchat";
  import Twitch from "~icons/simple-icons/twitch";
  import Generic from "~icons/mdi/web";
  import { detectSocialPlatform } from "$lib/social";

  let { url, class: className = "size-5" }: { url: string; class?: string } =
    $props();

  const ICONS: Record<string, typeof Instagram> = {
    instagram: Instagram,
    facebook: Facebook,
    x: X,
    whatsapp: Whatsapp,
    telegram: Telegram,
    tiktok: Tiktok,
    youtube: Youtube,
    linkedin: Linkedin,
    github: Github,
    discord: Discord,
    reddit: Reddit,
    pinterest: Pinterest,
    spotify: Spotify,
    snapchat: Snapchat,
    twitch: Twitch,
  };

  let platform = $derived(detectSocialPlatform(url));
  let Icon = $derived(ICONS[platform.id] ?? Generic);
</script>

<Icon class={className} />
