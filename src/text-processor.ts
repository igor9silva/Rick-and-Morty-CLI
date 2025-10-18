import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { DATA_DIR } from "./db";

export const CORPUS_DIR = join(DATA_DIR, "corpus");

export interface Chunk {
	episodeTitle: string;
	text: string;
}

export const parseAllEpisodes = (): Chunk[] => {
	//
	const files = readdirSync(CORPUS_DIR).filter((f) => f.endsWith(".md"));

	const allChunks: Chunk[] = [];

	for (const file of files) {
		const filePath = join(CORPUS_DIR, file);
		const chunks = parseEpisodeFile(filePath);
		allChunks.push(...chunks);
	}

	return allChunks;
};

/**
 * Parse a single markdown file and extract chunks.
 * Format:
 * - Line 1: # Episode Title
 * - Line 2: empty
 * - Line 3+: Synopsis paragraph
 * - Then: Bullet points starting with -
 */
export const parseEpisodeFile = (filePath: string): Chunk[] => {
	//
	const content = readFileSync(filePath, "utf-8");
	const lines = content.split("\n").filter((line) => line.trim());

	if (lines.length === 0) return [];

	// extract episode title (first line)
	const episodeTitle = lines[0].replace(/^#\s*/, "").trim();

	const chunks: Chunk[] = [];

	// extract synopsis and bullet points
	let synopsisLines: string[] = [];
	let bulletPoints: string[] = [];
	let inBullets = false;

	for (let i = 1; i < lines.length; i++) {
		//
		const line = lines[i];

		if (line.startsWith("-")) {
			//
			inBullets = true;
			bulletPoints.push(line.replace(/^-\s*/, "").trim()); // remove leading dash and space

		} else if (!inBullets) {
			synopsisLines.push(line);
		}
	}

	// split synopsis into sentences
	if (synopsisLines.length > 0) {
		//
		const synopsis = synopsisLines.join(" ").trim();
		const sentences = splitIntoSentencesByPunctuation(synopsis);

		for (const sentence of sentences) {
			chunks.push({ episodeTitle, text: sentence });
		}
	}

	for (const bullet of bulletPoints) {
		chunks.push({ episodeTitle, text: bullet });
	}

	return chunks;
};

export const splitIntoSentencesByPunctuation = (text: string): string[] => {
	//
	return text
		.split(/[.!?]\s+/) // . ! ? followed by a space
		.map(s => s.trim())
		.filter(s => s.length > 0);
};