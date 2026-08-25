// Recognized social/chat platforms, keyed by the icon id used in SocialIcon.svelte
export interface SocialPlatform {
    id: string;
    label: string;
}

const DOMAIN_PLATFORMS: Record<string, SocialPlatform> = {
    'instagram.com': { id: 'instagram', label: 'Instagram' },
    'facebook.com': { id: 'facebook', label: 'Facebook' },
    'fb.com': { id: 'facebook', label: 'Facebook' },
    'twitter.com': { id: 'x', label: 'X' },
    'x.com': { id: 'x', label: 'X' },
    'wa.me': { id: 'whatsapp', label: 'WhatsApp' },
    'whatsapp.com': { id: 'whatsapp', label: 'WhatsApp' },
    't.me': { id: 'telegram', label: 'Telegram' },
    'telegram.me': { id: 'telegram', label: 'Telegram' },
    'tiktok.com': { id: 'tiktok', label: 'TikTok' },
    'youtube.com': { id: 'youtube', label: 'YouTube' },
    'youtu.be': { id: 'youtube', label: 'YouTube' },
    'linkedin.com': { id: 'linkedin', label: 'LinkedIn' },
    'github.com': { id: 'github', label: 'GitHub' },
    'discord.com': { id: 'discord', label: 'Discord' },
    'discord.gg': { id: 'discord', label: 'Discord' },
    'reddit.com': { id: 'reddit', label: 'Reddit' },
    'pinterest.com': { id: 'pinterest', label: 'Pinterest' },
    'spotify.com': { id: 'spotify', label: 'Spotify' },
    'snapchat.com': { id: 'snapchat', label: 'Snapchat' },
    'twitch.tv': { id: 'twitch', label: 'Twitch' }
};

// Matches a hostname to a known platform by its registrable domain (e.g. "www.instagram.com" -> instagram.com),
// falling back to a generic "website" platform (icon + label = the hostname itself) for anything unrecognized.
export function detectSocialPlatform(url: string): SocialPlatform {
    let hostname: string;
    try {
        hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
    } catch {
        return { id: 'website', label: url };
    }
    for (const [domain, platform] of Object.entries(DOMAIN_PLATFORMS)) {
        if (hostname === domain || hostname.endsWith(`.${domain}`)) return platform;
    }
    return { id: 'website', label: hostname };
}

// Adds a "https://" scheme to bare domains/handles (e.g. "instagram.com/me") so they parse as valid URLs and link out correctly.
export function normalizeSocialLink(input: string): string {
    const trimmed = input.trim();
    if (!trimmed) return '';
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
