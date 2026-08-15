import { writable } from 'svelte/store';

export type ThemeMode = 'light' | 'dark';

export interface ModeColors {
    bg: string;
    surface: string;
    text: string;
    muted: string;
    border: string;
}

export interface Theme {
    id: string;
    label: string;
    primary: string;
    primaryDark: string;
    secondary: string;
    secondaryDark: string;
    light: ModeColors;
    dark: ModeColors;
}

export const THEMES: Theme[] = [
    {
        id: 'classic',
        label: 'Classic',
        primary: '#0066ff',
        primaryDark: '#0047cc',
        secondary: '#ff5a36',
        secondaryDark: '#e6431f',
        light: { bg: '#f5f7fa', surface: '#ffffff', text: '#0d0d0d', muted: '#6b7280', border: '#e5e7eb' },
        dark: { bg: '#0b0f17', surface: '#161c27', text: '#f2f4f8', muted: '#97a1b3', border: '#2b3444' }
    },
    {
        id: 'ocean',
        label: 'Ocean',
        primary: '#0d9488',
        primaryDark: '#0f766e',
        secondary: '#f59e0b',
        secondaryDark: '#d97706',
        light: { bg: '#f0fdfa', surface: '#ffffff', text: '#0d0d0d', muted: '#6b7280', border: '#d9f2ee' },
        dark: { bg: '#071a17', surface: '#0f2925', text: '#eafaf7', muted: '#8fb5af', border: '#1c3d37' }
    },
    {
        id: 'sunset',
        label: 'Sunset',
        primary: '#f97316',
        primaryDark: '#c2410c',
        secondary: '#ec4899',
        secondaryDark: '#db2777',
        light: { bg: '#fff7ed', surface: '#ffffff', text: '#1a1206', muted: '#7c6a52', border: '#fde7cf' },
        dark: { bg: '#1a1006', surface: '#291a0d', text: '#fdf3e7', muted: '#cbab84', border: '#402a16' }
    },
    {
        id: 'forest',
        label: 'Forest',
        primary: '#16a34a',
        primaryDark: '#15803d',
        secondary: '#eab308',
        secondaryDark: '#ca8a04',
        light: { bg: '#f0fdf4', surface: '#ffffff', text: '#0d1a10', muted: '#5f7a66', border: '#d7f3df' },
        dark: { bg: '#06170b', surface: '#0d2814', text: '#eafcef', muted: '#8fbd9c', border: '#1d4029' }
    },
    {
        id: 'berry',
        label: 'Berry',
        primary: '#9333ea',
        primaryDark: '#7e22ce',
        secondary: '#f43f5e',
        secondaryDark: '#e11d48',
        light: { bg: '#faf5ff', surface: '#ffffff', text: '#180d1f', muted: '#7a6689', border: '#eddcfb' },
        dark: { bg: '#150720', surface: '#241033', text: '#f6ecfd', muted: '#b79bcb', border: '#382152' }
    },
    {
        id: 'slate',
        label: 'Slate',
        primary: '#475569',
        primaryDark: '#334155',
        secondary: '#06b6d4',
        secondaryDark: '#0891b2',
        light: { bg: '#f1f5f9', surface: '#ffffff', text: '#0f172a', muted: '#64748b', border: '#e2e8f0' },
        dark: { bg: '#0b1220', surface: '#151d2c', text: '#eef2f8', muted: '#94a3b8', border: '#263242' }
    }
];

export interface ThemeState {
    themeId: string;
    mode: ThemeMode;
}

const THEME_KEY = 'fitmate-theme';
const MODE_KEY = 'fitmate-theme-mode';
const DEFAULT_STATE: ThemeState = { themeId: THEMES[0].id, mode: 'dark' };

function applyState(state: ThemeState) {
    if (typeof document === 'undefined') return;
    const theme = THEMES.find((t) => t.id === state.themeId) ?? THEMES[0];
    const modeColors = state.mode === 'dark' ? theme.dark : theme.light;
    const root = document.documentElement.style;
    root.setProperty('--color-primary', theme.primary);
    root.setProperty('--color-primary-dark', theme.primaryDark);
    root.setProperty('--color-secondary', theme.secondary);
    root.setProperty('--color-secondary-dark', theme.secondaryDark);
    root.setProperty('--color-bg', modeColors.bg);
    root.setProperty('--color-surface', modeColors.surface);
    root.setProperty('--color-text', modeColors.text);
    root.setProperty('--color-muted', modeColors.muted);
    root.setProperty('--color-border', modeColors.border);
    document.documentElement.dataset.themeMode = state.mode;

    // keep the mobile browser/status bar in sync with the app background
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) themeColorMeta.setAttribute('content', modeColors.bg);
}

function createThemeStore() {
    const { subscribe, set, update } = writable<ThemeState>(DEFAULT_STATE);

    return {
        subscribe,
        init: () => {
            if (typeof window === 'undefined') return;
            const themeId = window.localStorage.getItem(THEME_KEY) ?? DEFAULT_STATE.themeId;
            const savedMode = window.localStorage.getItem(MODE_KEY);
            const mode: ThemeMode = savedMode === 'light' ? 'light' : 'dark';
            const state: ThemeState = {
                themeId: THEMES.some((t) => t.id === themeId) ? themeId : DEFAULT_STATE.themeId,
                mode
            };
            applyState(state);
            set(state);
        },
        selectTheme: (themeId: string) => {
            if (!THEMES.some((t) => t.id === themeId)) return;
            update((state) => {
                const next = { ...state, themeId };
                applyState(next);
                if (typeof window !== 'undefined') window.localStorage.setItem(THEME_KEY, themeId);
                return next;
            });
        },
        selectMode: (mode: ThemeMode) => {
            update((state) => {
                const next = { ...state, mode };
                applyState(next);
                if (typeof window !== 'undefined') window.localStorage.setItem(MODE_KEY, mode);
                return next;
            });
        }
    };
}

export const activeTheme = createThemeStore();
