import { describe, expect, test } from "bun:test";
import {
	calculateInverseDocumentFrequency,
	calculateTFIDF,
	calculateTermFrequency,
	cosineSimilarity,
	tokenize,
} from "../src/tfidf";

describe("Tokenization", () => {
	//
	test("converts to lowercase", () => {
		//
		const tokens = tokenize("Rick AND Morty");
		expect(tokens).toEqual(["rick", "and", "morty"]);
	});

	test("removes punctuation", () => {
		//
		const tokens = tokenize("Beth shoots Mr.Poopybutthole!");
		expect(tokens).toEqual(["beth", "shoots", "mrpoopybutthole"]);
	});

	test("splits on whitespace", () => {
		//
		const tokens = tokenize("one   two\tthree\nfour");
		expect(tokens).toEqual(["one", "two", "three", "four"]);
	});

	test("filters empty strings", () => {
		//
		const tokens = tokenize("  hello   world  ");
		expect(tokens).toEqual(["hello", "world"]);
	});

	test("handles empty string", () => {
		//
		const tokens = tokenize("");
		expect(tokens).toEqual([]);
	});
});

describe("Term Frequency", () => {
	//
	test("calculates frequency for single occurrence", () => {
		//
		const tokens = ["rick", "and", "morty"];
		const tf = calculateTermFrequency(tokens);

		expect(tf.get("rick")).toBe(1 / 3);
		expect(tf.get("and")).toBe(1 / 3);
		expect(tf.get("morty")).toBe(1 / 3);
	});

	test("calculates frequency for repeated terms", () => {
		//
		const tokens = ["rick", "rick", "morty"];
		const tf = calculateTermFrequency(tokens);

		expect(tf.get("rick")).toBe(2 / 3);
		expect(tf.get("morty")).toBe(1 / 3);
	});

	test("handles empty array", () => {
		//
		const tokens: string[] = [];
		const tf = calculateTermFrequency(tokens);

		expect(tf.size).toBe(0);
	});
});

describe("Inverse Document Frequency", () => {
	//
	test("calculates IDF for unique terms", () => {
		//
		const docs = [["rick"], ["morty"], ["beth"]];
		const idf = calculateInverseDocumentFrequency(docs);

		// Each term appears in 1 of 3 docs: log(3/1) = 1.0986
		expect(idf.get("rick")).toBeCloseTo(1.0986, 3);
		expect(idf.get("morty")).toBeCloseTo(1.0986, 3);
		expect(idf.get("beth")).toBeCloseTo(1.0986, 3);
	});

	test("calculates IDF for common terms", () => {
		//
		const docs = [
			["rick", "morty"],
			["rick", "beth"],
			["rick", "summer"],
		];
		const idf = calculateInverseDocumentFrequency(docs);

		// "rick" appears in all 3 docs: log(3/3) = 0
		expect(idf.get("rick")).toBe(0);

		// Other terms appear in 1 of 3 docs: log(3/1)
		expect(idf.get("morty")).toBeCloseTo(1.0986, 3);
	});

	test("handles empty documents", () => {
		//
		const docs: string[][] = [[], [], []];
		const idf = calculateInverseDocumentFrequency(docs);

		expect(idf.size).toBe(0);
	});
});

describe("TF-IDF Calculation", () => {
	//
	test("combines TF and IDF correctly", () => {
		//
		const docs = [
			["rick", "morty"],
			["rick", "beth"],
		];
		const idf = calculateInverseDocumentFrequency(docs);

		const tokens = ["rick", "morty"];
		const tfidf = calculateTFIDF(tokens, idf);

		// rick: TF = 0.5, IDF = log(2/2) = 0, TF-IDF = 0
		expect(tfidf.get("rick")).toBe(0);

		// morty: TF = 0.5, IDF = log(2/1) = 0.693, TF-IDF = 0.347
		expect(tfidf.get("morty")).toBeCloseTo(0.347, 2);
	});

	test("returns 0 for terms not in IDF", () => {
		//
		const idf = new Map([["rick", 1.0]]);
		const tokens = ["unknown", "term"];
		const tfidf = calculateTFIDF(tokens, idf);

		expect(tfidf.get("unknown")).toBe(0);
		expect(tfidf.get("term")).toBe(0);
	});
});

describe("Cosine Similarity", () => {
	//
	test("returns 1 for identical vectors", () => {
		//
		const vectorA = new Map([
			["rick", 0.5],
			["morty", 0.5],
		]);
		const vectorB = new Map([
			["rick", 0.5],
			["morty", 0.5],
		]);

		const similarity = cosineSimilarity(vectorA, vectorB);
		expect(similarity).toBeCloseTo(1, 10);
	});

	test("returns 0 for completely different vectors", () => {
		//
		const vectorA = new Map([["rick", 1.0]]);
		const vectorB = new Map([["morty", 1.0]]);

		const similarity = cosineSimilarity(vectorA, vectorB);
		expect(similarity).toBe(0);
	});

	test("returns value between 0 and 1 for partial overlap", () => {
		//
		const vectorA = new Map([
			["rick", 0.5],
			["morty", 0.5],
		]);
		const vectorB = new Map([
			["rick", 0.5],
			["beth", 0.5],
		]);

		const similarity = cosineSimilarity(vectorA, vectorB);
		expect(similarity).toBeGreaterThan(0);
		expect(similarity).toBeLessThan(1);
	});

	test("handles empty vectors", () => {
		//
		const vectorA = new Map<string, number>();
		const vectorB = new Map([["rick", 1.0]]);

		const similarity = cosineSimilarity(vectorA, vectorB);
		expect(similarity).toBe(0);
	});
});

describe("End-to-end TF-IDF Search", () => {
	//
	test("finds most relevant document for query", () => {
		//
		const documents = [
			"Beth shoots Mr.Poopybutthole",
			"Rick turns himself into a pickle",
			"Beth mistaking him for a parasite",
		];

		const tokenizedDocs = documents.map(tokenize);
		const idf = calculateInverseDocumentFrequency(tokenizedDocs);

		const query = "Who shoots Mr.Poopybutthole";
		const queryTokens = tokenize(query);
		const queryTFIDF = calculateTFIDF(queryTokens, idf);

		const similarities = tokenizedDocs.map((docTokens) => {
			const docTFIDF = calculateTFIDF(docTokens, idf);
			return cosineSimilarity(queryTFIDF, docTFIDF);
		});

		// First document should have highest similarity
		expect(similarities[0]).toBeGreaterThan(similarities[1]);
		expect(similarities[0]).toBeGreaterThan(similarities[2]);
		expect(similarities[0]).toBeGreaterThan(0.9);
	});

	test("ranks documents by relevance", () => {
		//
		const documents = [
			"Rick is a scientist and inventor",
			"Morty is Rick's grandson",
			"Rick and Morty go on adventures",
		];

		const tokenizedDocs = documents.map(tokenize);
		const idf = calculateInverseDocumentFrequency(tokenizedDocs);

		const query = "Rick scientist";
		const queryTokens = tokenize(query);
		const queryTFIDF = calculateTFIDF(queryTokens, idf);

		const similarities = tokenizedDocs.map((docTokens, index) => {
			const docTFIDF = calculateTFIDF(docTokens, idf);
			return {
				index,
				similarity: cosineSimilarity(queryTFIDF, docTFIDF),
			};
		});

		// Sort by similarity descending
		similarities.sort((a, b) => b.similarity - a.similarity);

		// Document 0 should be most relevant (contains "Rick" and "scientist")
		expect(similarities[0].index).toBe(0);
	});
});

