export type SwipeDirection = 'like' | 'pass';
export type MatchStatus = 'pending' | 'confirmed' | 'declined';

export const ACTIVITY_FORMAT_OPTIONS = [
	{ value: 'all', label: 'All' },
	{ value: '1v1', label: '1v1' },
	{ value: '2v2', label: '2v2' },
	{ value: 'group', label: '4+' }
] as const;

export type ActivityFormat = (typeof ACTIVITY_FORMAT_OPTIONS)[number]['value'];

export const SKILL_LEVEL_OPTIONS = [
	{ value: 'basic', label: 'Basic' },
	{ value: 'medium', label: 'Medium' },
	{ value: 'expert', label: 'Expert' }
] as const;

export type SkillLevel = (typeof SKILL_LEVEL_OPTIONS)[number]['value'];

export const ORIENTATIONS = [
	{ value: 'hetero', label: 'Hetero' },
	{ value: 'gay', label: 'Gay' }
] as const;

export type SexualOrientation = (typeof ORIENTATIONS)[number]['value'];

export const GENDER_OPTIONS = [
	{ value: 'male', label: 'Male' },
	{ value: 'female', label: 'Female' }
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
	format: Exclude<ActivityFormat, 'all'> | '';
	level: SkillLevel | '';
	gender: Gender | '';
	orientation: SexualOrientation | '';
	minAge: number | null;
	maxAge: number | null;
	// max distance from the current user, in km; null/undefined = no distance filter
	maxDistanceKm: number | null;
	// only show profiles marked as single
	single: boolean;
	// only show profiles marked as trainers
	trainer: boolean;
}

// Default distance filter applied until the user picks their own value or explicitly clears it to "Any"
export const DEFAULT_DISTANCE_KM = 10;

export const BIO_MAX_LENGTH = 200;

// Maximum number of sports/activities a user profile can have at once
export const MAX_SPORTS_FREE = 6;
export const MAX_SPORTS_PREMIUM = 12;
export const PREMIUM_PRICE_USD = 9.99;

export function getMaxSports(isPremium?: boolean) {
	return isPremium ? MAX_SPORTS_PREMIUM : MAX_SPORTS_FREE;
}

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
	// relationship status: true = single, undefined/false = not single
	isSingle?: boolean;
	// true if this user offers/works as a trainer
	isTrainer?: boolean;
	// true once the user has subscribed to Fit-M8 Premium
	isPremium?: boolean;
	// true for Google accounts (auto-verified) or once an email/password user confirms their inbox link
	emailVerified?: boolean;
	// undefined until the user has confirmed filters at least once from the Discover screen
	discoverFilters?: DiscoverFilters;
	// FCM registration tokens for devices that opted into push notifications (one per browser/device)
	fcmTokens?: string[];
	// updated every ~20s while the app is open and visible; used server-side to skip
	// push notifications for a user who's actively looking at the app right now
	lastActiveAt?: Date;
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

export type ReportReason = 'harassment' | 'inappropriate' | 'fake_profile' | 'spam' | 'other';

export interface Report {
	id: string;
	reporterId: string;
	reportedUid: string;
	matchId: string;
	reason: ReportReason;
	details?: string;
	createdAt: Date;
}
