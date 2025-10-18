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

export const SEARCH_TOP_K = 1;
export const SEARCH_CONFIDENCE_THRESHOLD = 0.25;
