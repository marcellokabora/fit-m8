import {
    BadgeCheck,
    Dumbbell,
    Heart,
    MessageCircle,
    UserShield,
    Zap
} from '@lucide/svelte';
import { MAX_LIKES_FREE_PER_DAY, MAX_SPORTS_FREE, MAX_SPORTS_PREMIUM } from '$lib/types';

// Shared between src/routes/app/premium/+page.svelte and the onboarding premium preview step.
export const PREMIUM_FEATURES = [
    {
        icon: Dumbbell,
        title: 'premium.featureMoreSportsTitle',
        hint: 'premium.featureMoreSportsHint',
        params: { max: MAX_SPORTS_PREMIUM, free: MAX_SPORTS_FREE },
        comingSoon: false
    },
    {
        icon: UserShield,
        title: 'premium.featureTrainerTitle',
        hint: 'premium.featureTrainerHint',
        params: {},
        comingSoon: false
    },
    {
        icon: MessageCircle,
        title: 'premium.featureDirectMessageTitle',
        hint: 'premium.featureDirectMessageHint',
        params: {},
        comingSoon: false
    },
    {
        icon: Heart,
        title: 'premium.featureUnlimitedLikesTitle',
        hint: 'premium.featureUnlimitedLikesHint',
        params: { free: MAX_LIKES_FREE_PER_DAY },
        comingSoon: false
    },
    {
        icon: BadgeCheck,
        title: 'premium.featureBadgeTitle',
        hint: 'premium.featureBadgeHint',
        params: {},
        comingSoon: false
    },
    {
        icon: Zap,
        title: 'premium.featurePriorityBoostTitle',
        hint: 'premium.featurePriorityBoostHint',
        params: {},
        comingSoon: false
    }
] as const;
