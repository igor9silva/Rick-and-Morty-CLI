import { SEARCH_CONFIDENCE_THRESHOLD } from './config';
import { loadSearchIndex } from './search-index';
import { calculateTFIDF, cosineSimilarity, tokenize } from './tfidf';

export interface SearchResult {
	episodeTitle: string;
	text: string;
	similarity: number;
}

const index = loadSearchIndex();

// compute TF*IDF for the query and compare with each chunk's using cosine similarity
export const searchContent = (query: string): SearchResult | undefined => {
	//
	if (!index) {
		console.error("Search index not found. Run 'bun ingest' first.");
		return undefined;
	}

	const queryTokens = tokenize(query);
	const idfMap = new Map(Object.entries(index.idf));
	const queryTFIDFMap = calculateTFIDF(queryTokens, idfMap);

	const results: SearchResult[] = [];

	for (const chunk of index.chunks) {
		//
		const chunkTFIDF = new Map(Object.entries(chunk.tfidf));
		const similarity = cosineSimilarity(queryTFIDFMap, chunkTFIDF);

		results.push({
			episodeTitle: chunk.episodeTitle,
			text: chunk.text,
			similarity,
		});
	}

	results.sort((a, b) => b.similarity - a.similarity);

	// check if meets confidence threshold
	const bestResult = results[0];
	if (bestResult && bestResult.similarity >= SEARCH_CONFIDENCE_THRESHOLD) {
		return bestResult;
	}

	return undefined;
};
