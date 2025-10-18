/**
 * TF-IDF (Term Frequency - Inverse Document Frequency) implementation
 *
 * TF-IDF is a numerical statistic that reflects how important a word is
 * to a document in a collection of documents.
 *
 * The math:
 * - TF (Term Frequency) = (number of times term appears in document) / (total terms in document)
 * - IDF (Inverse Document Frequency) = log(total documents / documents containing term)
 * - TF-IDF = TF * IDF
 */

// split on whitespace and filter out empty strings and punctuation
export const tokenize = (text: string): string[] => {
	//
	return text
		.toLowerCase()
		.replace(/[^\w\s]/g, '') // Remove punctuation
		.split(/\s+/) // Split on whitespace
		.filter((word) => word.length > 0);
};

// count occurrences of each term and convert to frequencies
export const calculateTermFrequency = (tokens: string[]): Map<string, number> => {
	//
	const termCounts = new Map<string, number>();

	// count occurrences of each term
	for (const token of tokens) {
		termCounts.set(token, (termCounts.get(token) || 0) + 1);
	}

	const totalTerms = tokens.length;
	const termFrequency = new Map<string, number>();

	for (const [term, count] of termCounts) {
		termFrequency.set(term, count / totalTerms);
	}

	return termFrequency;
};

// compute inverse document frequency for all terms into a global map (term => IDF)
export const calculateInverseDocumentFrequency = (documents: string[][]): Map<string, number> => {
	//
	const totalDocs = documents.length;
	const docFrequency = new Map<string, number>();

	// count term frequency within each document
	for (const doc of documents) {
		//
		const uniqueTerms = new Set(doc);

		for (const term of uniqueTerms) {
			docFrequency.set(term, (docFrequency.get(term) || 0) + 1);
		}
	}

	// compute IDF for each term
	const idf = new Map<string, number>();

	for (const [term, docCount] of docFrequency) {
		idf.set(term, Math.log(totalDocs / docCount));
	}

	return idf;
};

// compute TF-IDF vector for a document.
export const calculateTFIDF = (tokens: string[], idf: Map<string, number>): Map<string, number> => {
	//
	const tf = calculateTermFrequency(tokens);
	const tfidf = new Map<string, number>();

	for (const [term, tfValue] of tf) {
		const idfValue = idf.get(term) || 0;
		tfidf.set(term, tfValue * idfValue);
	}

	return tfidf;
};

/**
 * Compute cosine similarity between two TF-IDF vectors.
 *
 * Measures the angle between two vectors.
 * Result ranges from 0 (completely different) to 1 (identical).
 *
 * Formula: similarity = (A · B) / (|A| * |B|)
 * Where A · B is the dot product and |A| is the magnitude
 */
export const cosineSimilarity = (
	vectorA: Map<string, number>, //
	vectorB: Map<string, number>,
): number => {
	//
	// dot product (A · B)
	let dotProduct = 0;
	for (const [term, valueA] of vectorA) {
		const valueB = vectorB.get(term) || 0;
		dotProduct += valueA * valueB;
	}

	// magnitudes |A| and |B|
	let magnitudeA = 0;
	for (const value of vectorA.values()) {
		magnitudeA += value * value;
	}
	magnitudeA = Math.sqrt(magnitudeA);

	let magnitudeB = 0;
	for (const value of vectorB.values()) {
		magnitudeB += value * value;
	}
	magnitudeB = Math.sqrt(magnitudeB);

	// avoid division by zero
	if (magnitudeA === 0 || magnitudeB === 0) {
		return 0;
	}

	return dotProduct / (magnitudeA * magnitudeB);
};
