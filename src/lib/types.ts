export type ActivityFormat = '1v1' | '2v2';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type SwipeDirection = 'like' | 'pass';
export type MatchStatus = 'pending' | 'confirmed' | 'declined';

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
	{ id: 'racquetball', label: 'Racquetball', emoji: '🎾' },
	{ id: 'gym', label: 'Gym Training', emoji: '💪' },
	{ id: 'calisthenics', label: 'Calisthenics', emoji: '🤸' },
	{ id: 'rock-climbing', label: 'Rock Climbing', emoji: '🧗' },
	{ id: 'golf', label: 'Golf', emoji: '⛳' },
	{ id: 'martial-arts', label: 'Martial Arts', emoji: '🥋' },
	{ id: 'fencing', label: 'Fencing', emoji: '🤺' }
] as const;

export type ActivityId = (typeof ACTIVITIES)[number]['id'];

export interface UserActivity {
	id: ActivityId | string;
	format: ActivityFormat;
	level: SkillLevel;
}

export interface UserProfile {
	uid: string;
	displayName: string;
	photoURL: string;
	bio: string;
	age: number;
	gender: string;
	city: string;
	activities: UserActivity[];
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
}

export interface Message {
	id: string;
	senderId: string;
	text: string;
	timestamp: Date;
}
