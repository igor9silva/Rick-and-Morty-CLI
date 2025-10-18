import { RATING_SYNONYMS, VIEWER_SYNONYMS, type MetricType } from './config';
import { getAllEpisodeTitles } from './db';

// remove special characters and convert to lowercase
export const normalizeString = (str: string): string => {
	return str.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
};

export const identifyEpisodeTitle = (query: string): string | undefined => {
	//
	const episodeTitles = getAllEpisodeTitles();
	const normalizedQuery = normalizeString(query);

	for (const title of episodeTitles) {
		//
		const normalizedTitle = normalizeString(title);
		
		if (normalizedQuery.includes(normalizedTitle)) {
			return title;
		}
	}

	// console.debug(`Could not identify episode title in query: "${query}". Please include a valid episode title.`);

	return undefined;
};

export const identifyMetricType = (query: string): MetricType | undefined => {
	//
	const normalizedQuery = normalizeString(query);

	for (const synonym of VIEWER_SYNONYMS) {
		if (normalizedQuery.includes(synonym)) {
			return 'viewers';
		}
	}

	for (const synonym of RATING_SYNONYMS) {
		if (normalizedQuery.includes(synonym)) {
			return 'rating';
		}
	}

	// console.debug(`Could not identify metric type in query: "${query}". Please specify either viewer count or rating.`);

	return undefined;
};

