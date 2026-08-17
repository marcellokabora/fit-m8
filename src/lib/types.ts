export type SwipeDirection = 'like' | 'pass';
export type MatchStatus = 'pending' | 'confirmed' | 'declined';

export const ACTIVITY_FORMAT_OPTIONS = [
	{ value: 'all', label: 'All' },
	{ value: '1v1', label: '1v1' },
	{ value: '2v2', label: '2v2' }
] as const;

export type ActivityFormat = (typeof ACTIVITY_FORMAT_OPTIONS)[number]['value'];

export function formatLabel(format: ActivityFormat): string {
	return ACTIVITY_FORMAT_OPTIONS.find((f) => f.value === format)?.label ?? format;
}

export const SKILL_LEVEL_OPTIONS = [
	{ value: 'Basic', label: 'Basic' },
	{ value: 'Expert', label: 'Expert' }
] as const;

export type SkillLevel = (typeof SKILL_LEVEL_OPTIONS)[number]['value'];

export const ORIENTATIONS = [
	{ value: 'straight', label: 'Hetero' },
	{ value: 'gay', label: 'Gay' }
] as const;

export type SexualOrientation = (typeof ORIENTATIONS)[number]['value'];

export const GENDER_OPTIONS = [
	{ value: 'Male', label: 'Male' },
	{ value: 'Female', label: 'Female' }
] as const;

export type Gender = (typeof GENDER_OPTIONS)[number]['value'];

export const ACTIVITIES = [
	{ id: 'jogging', label: 'Jogging', emoji: '🏃' },
	{ id: 'padel', label: 'Padel', emoji: '🎾' },
	{ id: 'tennis', label: 'Tennis', emoji: '🎾' },
	{ id: 'beach-volley', label: 'Beach Volley', emoji: '🏐' },
	{ id: 'basketball', label: 'Basketball', emoji: '🏀' },
	{ id: 'cycling', label: 'Cycling', emoji: '🚴' },
	{ id: 'swimming', label: 'Swimming', emoji: '🏊' },
	{ id: 'hiking', label: 'Hiking', emoji: '🥾' },
	{ id: 'badminton', label: 'Badminton', emoji: '🏸' },
	{ id: 'ping-pong', label: 'Ping Pong', emoji: '🏓' },
	{ id: 'pickleball', label: 'Pickleball', emoji: '🥒' },
	{ id: 'squash', label: 'Squash', emoji: '📦' },
	{ id: 'frescobol', label: 'Frescobol', emoji: '🏖️' },
	{ id: 'gym', label: 'Gym Training', emoji: '💪' },
	{ id: 'calisthenics', label: 'Calisthenics', emoji: '🤸' },
	{ id: 'rock-climbing', label: 'Rock Climbing', emoji: '🧗' },
	{ id: 'golf', label: 'Golf', emoji: '⛳' },
	{ id: 'martial-arts', label: 'Martial Arts', emoji: '🥋' },
	{ id: 'paddleboard', label: 'Paddleboard', emoji: '🛶' }
] as const;

export type ActivityId = (typeof ACTIVITIES)[number]['id'];

export interface UserActivity {
	id: ActivityId | string;
	format: ActivityFormat;
	level: SkillLevel;
}

export interface DiscoverFilters {
	activity: string;
	format: '1v1' | '2v2' | '';
	level: SkillLevel | '';
	gender: Gender | '';
	orientation: SexualOrientation | '';
	minAge: number | null;
	maxAge: number | null;
	// max distance from the current user, in km; null/undefined = no distance filter
	maxDistanceKm: number | null;
}

// Default distance filter applied until the user picks their own value or explicitly clears it to "Any"
export const DEFAULT_DISTANCE_KM = 10;

export interface UserProfile {
	uid: string;
	displayName: string;
	photoURL: string;
	// up to 3 photo URLs, in display order — photos[0] is the default/main photo (mirrored in photoURL)
	photos?: string[];
	bio: string;
	age: number;
	gender: Gender | '';
	orientation?: SexualOrientation | null;
	city: string;
	// coordinates from the last successful geolocation lookup, used for distance filtering — undefined if the city was entered manually
	lat?: number;
	lng?: number;
	activities: UserActivity[];
	// undefined until the user has confirmed filters at least once from the Discover screen
	discoverFilters?: DiscoverFilters;
	createdAt: Date;
	updatedAt: Date;
}

export interface Swipe {
	direction: SwipeDirection;
	activity: string;
	format: ActivityFormat;
	timestamp: Date;
}

export interface Match {
	id: string;
	userIds: string[];
	activity: string;
	format: ActivityFormat;
	status: MatchStatus;
	createdAt: Date;
	lastMessage?: string;
	lastMessageAt?: Date;
	lastMessageSenderId?: string;
	// per-uid timestamp of when that user last read the chat
	readBy?: Record<string, Date>;
}

export interface Message {
	id: string;
	senderId: string;
	text: string;
	timestamp: Date;
}
