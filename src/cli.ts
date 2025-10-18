#!/usr/bin/env bun

import { z } from 'zod';
import { searchContent } from './content-search';
import { getEpisodeMetric, seedDatabase } from './db';
import { identifyEpisodeTitle, identifyMetricType } from './query-parser';
import { buildSearchIndex } from './search-index';

const commandSchema = z.enum(['ingest', 'ask'], {
	message: 'Invalid command. Available commands: ingest, ask',
});

const questionSchema = z.string().min(1, {
	message: 'Question is required and cannot be empty',
});

const argsSchema = z.tuple([
		z.string(), // node
		z.string(), // script path
		commandSchema,
		questionSchema.optional(),
], {
	message: "Usage: <script> <command> <question>"
});

const parseArgs = (args: string[]) => {
	const parsedArgs = argsSchema.safeParse(args);

	if (!parsedArgs.success) {
		console.error(parsedArgs.error.issues[0]?.message || 'Invalid arguments');
		process.exit(1);
	}

	const [, , command, question] = parsedArgs.data;

	return { command, question };
};

const ingest = () => {
	//
	console.info('seeding database...');
	seedDatabase();
	console.info('database seeded successfully');

	console.info('building search index...');
	buildSearchIndex();
	console.info('search index built successfully');
};

const ask = (question?: string) => {
	//
	if (!question) {
		console.error('Question is required');
		process.exit(1);
	}

	const episodeTitle = identifyEpisodeTitle(question);
	const metricType = identifyMetricType(question);

	if (episodeTitle && metricType) {
		//
		const value = getEpisodeMetric(episodeTitle, metricType);

		if (!value) {
			console.error(`No data found for episode "${episodeTitle}"`);
			process.exit(1);
		}

		if (metricType === 'viewers') {
			console.log(`${episodeTitle} had ${value} million US viewers.`);
		} else {
			console.log(`${episodeTitle} has an IMDb rating of ${value}.`);
		}

		return;
	}

	const result = searchContent(question);

	if (result) {
		console.log(result.text);
	} else {
		console.error("Sorry, I couldn't understand your question.");
	}
};

const main = () => {
	//
	const { command, question } = parseArgs(process.argv);

	switch (command) {
		case 'ingest': ingest(); break;
		case 'ask': ask(question); break;
	}
};

main();
