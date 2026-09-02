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

// Groups of related activities, used to organize sport-picker UIs into labeled sections.
// Only activities that opt in via `group` below are sectioned; the rest render ungrouped.
export const ACTIVITY_GROUPS = [
	{ id: 'racquet' },
	{ id: 'fitness' },
	{ id: 'ballSports' },
	{ id: 'mindBody' },
	{ id: 'water' },
	{ id: 'danceArts' },
	{ id: 'combat' },
	{ id: 'wheelSkate' },
] as const;

export type ActivityGroupId = (typeof ACTIVITY_GROUPS)[number]['id'];

export const ACTIVITIES = [
	{ id: 'jogging', label: 'Jogging', emoji: '🏃' },
	{ id: 'padel', label: 'Padel', emoji: '🎾', group: 'racquet' },
	{ id: 'tennis', label: 'Tennis', emoji: '🎾', group: 'racquet' },
	{ id: 'beachVolley', label: 'Beach Volley', emoji: '🏐', group: 'ballSports' },
	{ id: 'footvolley', label: 'Foot Volley', emoji: '🏐', group: 'ballSports' },
	{ id: 'basketball', label: 'Basketball', emoji: '🏀', group: 'ballSports' },
	{ id: 'soccer', label: 'Football', emoji: '⚽', group: 'ballSports' },
	{ id: 'cycling', label: 'Cycling', emoji: '🚴' },
	{ id: 'swimming', label: 'Swimming', emoji: '🏊', group: 'water' },
	{ id: 'hiking', label: 'Hiking', emoji: '🥾' },
	{ id: 'pingPong', label: 'Ping Pong', emoji: '🏓', group: 'racquet' },
	{ id: 'pickleball', label: 'Pickleball', emoji: '🥒', group: 'racquet' },
	{ id: 'squash', label: 'Squash', emoji: '📦', group: 'racquet' },
	{ id: 'frescobol', label: 'Frescobol', emoji: '🏖️', group: 'racquet' },
	{ id: 'gym', label: 'Gym Training', emoji: '💪', group: 'fitness' },
	{ id: 'calisthenics', label: 'Calisthenics', emoji: '🤸', group: 'fitness' },
	{ id: 'bodybuilding', label: 'Bodybuilding', emoji: '🏋️', group: 'fitness' },
	{ id: 'crossTraining', label: 'Cross-training', emoji: '🔥', group: 'fitness' },
	{ id: 'functionalFitness', label: 'Functional Fitness', emoji: '⚡', group: 'fitness' },
	{ id: 'bootCamp', label: 'Bootcamp', emoji: '🏕️', group: 'fitness' },
	{ id: 'yoga', label: 'Yoga', emoji: '🧘', group: 'mindBody' },
	{ id: 'pilates', label: 'Pilates', emoji: '🤍', group: 'mindBody' },
	{ id: 'meditation', label: 'Meditation', emoji: '🧘‍♂️', group: 'mindBody' },
	{ id: 'breathwork', label: 'Breathwork', emoji: '🫁', group: 'mindBody' },
	{ id: 'rockClimbing', label: 'Rock Climbing', emoji: '🧗' },
	{ id: 'golf', label: 'Golf', emoji: '⛳' },
	{ id: 'boxing', label: 'Boxing', emoji: '🥊', group: 'combat' },
	{ id: 'kickboxing', label: 'Kickboxing', emoji: '🥋', group: 'combat' },
	{ id: 'muayThai', label: 'Muay Thai', emoji: '🥊', group: 'combat' },
	{ id: 'karate', label: 'Karate', emoji: '🥋', group: 'combat' },
	{ id: 'jiuJitsu', label: 'Jiu-Jitsu', emoji: '🤼', group: 'combat' },
	{ id: 'judo', label: 'Judo', emoji: '🥋', group: 'combat' },
	{ id: 'salsa', label: 'Salsa', emoji: '💃', group: 'danceArts' },
	{ id: 'bachata', label: 'Bachata', emoji: '🕺', group: 'danceArts' },
	{ id: 'kizomba', label: 'Kizomba', emoji: '💑', group: 'danceArts' },
	{ id: 'barre', label: 'Barre', emoji: '🩰', group: 'danceArts' },
	{ id: 'poleDance', label: 'Pole Dance', emoji: '💫', group: 'danceArts' },
	{ id: 'trampoline', label: 'Trampolining', emoji: '🤸‍♀️', group: 'danceArts' },
	{ id: 'paddleboard', label: 'Paddleboard', emoji: '🛶', group: 'water' }, { id: 'surf', label: 'Surfing', emoji: '🏄', group: 'water' }, { id: 'rollerblade', label: 'Rollerblading', emoji: '🛼', group: 'wheelSkate' },
	{ id: 'kayak', label: 'Kayak', emoji: '🚣', group: 'water' },
	{ id: 'skateboard', label: 'Skateboarding', emoji: '🛹', group: 'wheelSkate' }
] as const;

export type ActivityId = (typeof ACTIVITIES)[number]['id'];

// Buckets activities into their ACTIVITY_GROUPS section (in group order), followed by a
// trailing null-group bucket for activities that don't belong to any group yet.
export function groupActivities<T extends { id: string; group?: ActivityGroupId }>(
	activities: readonly T[]
): { group: ActivityGroupId | null; items: T[] }[] {
	const sections: { group: ActivityGroupId | null; items: T[] }[] = [];
	for (const { id } of ACTIVITY_GROUPS) {
		const items = activities.filter((a) => a.group === id);
		if (items.length) sections.push({ group: id, items });
	}
	const ungrouped = activities.filter((a) => !a.group);
	if (ungrouped.length) sections.push({ group: null, items: ungrouped });
	return sections;
}

export interface UserActivity {
	id: ActivityId | string;
	format: ActivityFormat;
	level: SkillLevel;
}

// '' = no filter (all), 'yes' = only matching profiles, 'no' = only non-matching profiles
export type YesNoFilter = '' | 'yes' | 'no';

export interface DiscoverFilters {
	// empty array = any of the current user's own sports (see relevantActivityIds in getDiscoverFeed)
	activities: string[];
	format: Exclude<ActivityFormat, 'all'> | '';
	level: SkillLevel | '';
	gender: Gender | '';
	orientation: SexualOrientation | '';
	minAge: number | null;
	maxAge: number | null;
	// max distance from the current user, in km; null/undefined = no distance filter
	maxDistanceKm: number | null;
	// filter by profiles marked as single
	single: YesNoFilter;
	// filter by profiles marked as trainers
	trainer: YesNoFilter;
}

// Default distance filter applied until the user picks their own value or explicitly clears it to "Any"
export const DEFAULT_DISTANCE_KM = 30;

export const BIO_MAX_LENGTH = 200;

// Maximum number of sports/activities a user profile can have at once
export const MAX_SPORTS_FREE = 10;
export const MAX_SPORTS_PREMIUM = 100;
export const PREMIUM_PRICE_USD = 9.99;

export function getMaxSports(isPremium?: boolean) {
	return isPremium ? MAX_SPORTS_PREMIUM : MAX_SPORTS_FREE;
}

// Minimum age to use the app (see Terms of Service) — enforced both at onboarding and in firestore.rules
export const MIN_AGE = 18;

// birthdate is a 'YYYY-MM-DD' string (native <input type="date"> value)
export function calculateAge(birthdate: string): number {
	const dob = new Date(birthdate);
	if (Number.isNaN(dob.getTime())) return 0;
	const today = new Date();
	let age = today.getFullYear() - dob.getFullYear();
	const hasHadBirthdayThisYear =
		today.getMonth() > dob.getMonth() ||
		(today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
	if (!hasHadBirthdayThisYear) age--;
	return age;
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
	// social/chat profile URLs (Instagram, WhatsApp, etc.) shown on the profile, platform auto-detected from the URL
	socialLinks?: string[];
	// true once the user has subscribed to FIT-M8 Premium
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
	// activities the swiper explicitly picked to connect on (mandatory when there's more than one shared)
	activities: string[];
	timestamp: Date;
}

export interface Match {
	id: string;
	userIds: string[];
	// activities both users share and chose to connect/chat about
	activities: string[];
	status: MatchStatus;
	createdAt: Date;
	lastMessage?: string;
	lastMessageAt?: Date;
	lastMessageSenderId?: string;
	// per-uid timestamp of when that user last read the chat
	readBy?: Record<string, Date>;
	// true when created via a Premium user's "message directly" action instead of a mutual swipe like
	isDirectMessage?: boolean;
}

// Reads activity ids off a match/swipe doc, falling back to the legacy single `activity` field
// for documents written before multi-activity selection existed.
export function getMatchActivityIds(doc: { activities?: string[]; activity?: string }): string[] {
	if (doc.activities?.length) return doc.activities;
	return doc.activity ? [doc.activity] : [];
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
