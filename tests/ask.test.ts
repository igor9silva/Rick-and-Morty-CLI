import { beforeAll, describe, expect, test } from "bun:test";
import { getAllEpisodeTitles, getEpisodeMetric, seedDatabase } from "../src/db";
import { identifyEpisodeTitle, identifyMetricType } from "../src/query-parser";

beforeAll(() => {
	seedDatabase();
});

describe("Database queries", () => {
	//
	test("getAllEpisodeTitles returns all episode titles", () => {
		//
		const titles = getAllEpisodeTitles();
		
		expect(titles).toContain("Pilot");
		expect(titles).toContain("Pickle Rick");
		expect(titles).toContain("The Ricklantis Mixup");
		expect(titles.length).toBe(10);
	});

	test("getEpisodeMetric returns correct viewer count", () => {
		//
		const viewers = getEpisodeMetric("Pickle Rick", "viewers");
		
		expect(viewers).toBe(2.31);
	});

	test("getEpisodeMetric returns correct rating", () => {
		//
		const rating = getEpisodeMetric("The Ricklantis Mixup", "rating");
		
		expect(rating).toBe(9.8);
	});

	test("getEpisodeMetric returns undefined for non-existent episode", () => {
		//
		const result = getEpisodeMetric("Non-existent Episode", "rating");
		
		expect(result).toBeUndefined();
	});
});

describe("Episode title identification", () => {
	//
	test("identifies exact episode title", () => {
		//
		const result = identifyEpisodeTitle("What's the rating for Pickle Rick?");
		expect(result).toBe("Pickle Rick");
	});

	test("identifies episode title with case insensitivity", () => {
		//
		const result = identifyEpisodeTitle("how many viewers for PICKLE RICK?");
		expect(result).toBe("Pickle Rick");
	});

	test("identifies episode title with extra whitespace", () => {
		//
		const result = identifyEpisodeTitle("  total rickall  viewers  ");
		expect(result).toBe("Total Rickall");
	});

	test("identifies episode title with special characters", () => {
		//
		const result = identifyEpisodeTitle("What about Rick Potion #9?");
		expect(result).toBe("Rick Potion #9");
	});

	test("identifies full episode title 'The Ricklantis Mixup'", () => {
		//
		const result = identifyEpisodeTitle("The Ricklantis Mixup rating");
		expect(result).toBe("The Ricklantis Mixup");
	});

	test("identifies partial episode title 'Get Schwifty'", () => {
		//
		const result = identifyEpisodeTitle("get schwifty viewers");
		expect(result).toBe("Get Schwifty");
	});

	test("returns undefined for non-existent episode", () => {
		//
		const result = identifyEpisodeTitle("Some Random Episode Title");
		expect(result).toBeUndefined();
	});

	test("returns undefined for empty string", () => {
		//
		const result = identifyEpisodeTitle("");
		expect(result).toBeUndefined();
	});
});

describe("Metric type identification", () => {
	//
	test("identifies 'viewers' metric", () => {
		//
		const result = identifyMetricType("How many viewers watched Pickle Rick?");
		expect(result).toBe("viewers");
	});

	test("identifies 'rating' metric", () => {
		//
		const result = identifyMetricType("What's the rating for Pickle Rick?");
		expect(result).toBe("rating");
	});

	test("identifies 'viewers' with synonym 'viewership'", () => {
		//
		const result = identifyMetricType("What was the viewership for the Pilot?");
		expect(result).toBe("viewers");
	});

	test("identifies 'viewers' with synonym 'audience'", () => {
		//
		const result = identifyMetricType("What was the audience for Total Rickall?");
		expect(result).toBe("viewers");
	});

	test("identifies 'rating' with synonym 'imdb'", () => {
		//
		const result = identifyMetricType("What's the IMDB score for Pickle Rick?");
		expect(result).toBe("rating");
	});

	test("identifies 'rating' with synonym 'score'", () => {
		//
		const result = identifyMetricType("What score did The Ricklantis Mixup get?");
		expect(result).toBe("rating");
	});

	test("identifies metric with case insensitivity", () => {
		//
		const result = identifyMetricType("VIEWERS for pickle rick");
		expect(result).toBe("viewers");
	});

	test("returns undefined when no metric mentioned", () => {
		//
		const result = identifyMetricType("Tell me about Pickle Rick");
		expect(result).toBeUndefined();
	});

	test("returns undefined for empty string", () => {
		//
		const result = identifyMetricType("");
		expect(result).toBeUndefined();
	});
});
