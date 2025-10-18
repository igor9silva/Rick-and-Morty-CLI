export type MetricType = 'viewers' | 'rating';

export const VIEWER_SYNONYMS = [
	'view',
	'views',
	'viewer',
	'viewers',
	'audience',
	'viewership',
	'watched',
	'watching',
	'watch',
] as const;

export const RATING_SYNONYMS = [
	'rating',
	'ratings',
	'imdb',
	'score',
	'scores',
	'rated',
	'rate',
] as const;
