// Matches http(s) URLs and bare "www." domains so both can be turned into clickable links.
const URL_REGEX = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi;

export interface TextSegment {
    type: 'text' | 'link';
    value: string;
    href?: string;
}

// Only allows http/https to become a clickable href - blocks javascript:, data:, vbscript: and any
// other scheme a user could try to slip into a chat message to get another user to "click and run" it.
function toSafeHref(match: string): string | null {
    const raw = /^https?:\/\//i.test(match) ? match : `https://${match}`;
    try {
        const url = new URL(raw);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
        return url.href;
    } catch {
        return null;
    }
}

// Splits chat message text into plain-text and link segments so URLs render as clickable <a> tags
// while everything else stays inert text - rendered via normal Svelte interpolation (no {@html}),
// so nothing here can inject markup/scripts regardless of what the sender typed.
export function linkifyText(text: string): TextSegment[] {
    const segments: TextSegment[] = [];
    let lastIndex = 0;
    for (const match of text.matchAll(URL_REGEX)) {
        const raw = match[0];
        const start = match.index ?? 0;
        if (start > lastIndex) segments.push({ type: 'text', value: text.slice(lastIndex, start) });
        // Trim common trailing punctuation that's usually prose, not part of the URL (e.g. "see: https://x.com.")
        const trimmed = raw.replace(/[)\].,!?;:]+$/, '');
        const href = toSafeHref(trimmed);
        if (href) {
            segments.push({ type: 'link', value: trimmed, href });
            if (trimmed.length < raw.length) segments.push({ type: 'text', value: raw.slice(trimmed.length) });
        } else {
            segments.push({ type: 'text', value: raw });
        }
        lastIndex = start + raw.length;
    }
    if (lastIndex < text.length) segments.push({ type: 'text', value: text.slice(lastIndex) });
    return segments;
}
