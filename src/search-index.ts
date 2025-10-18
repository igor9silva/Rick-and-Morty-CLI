import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { STORE_DIR } from "./db";
import { parseAllEpisodes } from "./text-processor";
import {
	calculateInverseDocumentFrequency,
	calculateTFIDF,
	tokenize,
} from "./tfidf";

export const SEARCH_INDEX_PATH = join(STORE_DIR, "search-index.json");

export interface IndexedChunk {
	id: number;
	episodeTitle: string;
	text: string;
	tokens: string[];
	tfidf: Record<string, number>; // term -> TF-IDF score
}

export interface SearchIndex {
	chunks: IndexedChunk[];
	idf: Record<string, number>; // term -> IDF score
}

export const buildSearchIndex = () => {
	//
	const chunks = parseAllEpisodes();

	const tokenizedChunks = chunks.map((chunk) => ({
		chunk,
		tokens: tokenize(chunk.text),
	}));

	const allTokens = tokenizedChunks.map((tc) => tc.tokens);
	const idf = calculateInverseDocumentFrequency(allTokens);

	// build index with pre-calculated TF-IDF
	const indexedChunks: IndexedChunk[] = tokenizedChunks.map(
		({ chunk, tokens }, index) => {
			//
			const tfidfMap = calculateTFIDF(tokens, idf);

			const tfidfObj: Record<string, number> = {};
			for (const [term, score] of tfidfMap) {
				tfidfObj[term] = score;
			}

			return {
				id: index,
				episodeTitle: chunk.episodeTitle,
				text: chunk.text,
				tokens,
				tfidf: tfidfObj,
			};
		}
	);

	// convert map to plain object for JSON serialization
	const idfObj: Record<string, number> = {};
	for (const [term, score] of idf) {
		idfObj[term] = score;
	}

	const json = JSON.stringify({
		chunks: indexedChunks,
		idf: idfObj,
	});
	
	writeFileSync(SEARCH_INDEX_PATH, json, "utf-8");
};

export const loadSearchIndex = (): SearchIndex | undefined => {
	//
	if (!existsSync(SEARCH_INDEX_PATH)) {
		return undefined;
	}

	const json = readFileSync(SEARCH_INDEX_PATH, "utf-8");

	return JSON.parse(json) as SearchIndex;
};

