#!/usr/bin/env bun

import { basename } from 'node:path';
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

// biome-ignore format: easier to read
const argsSchema = z.tuple([
		z.string(), // node
		z.string(), // script path
		commandSchema,
		questionSchema.optional(),
], {
	message: 'Usage: <script> <command> <question>'
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
		const result = getEpisodeMetric(episodeTitle, metricType);

		if (!result) {
			console.error(`No data found for episode "${episodeTitle}"`);
			process.exit(1);
		}

		const text =
			metricType === 'viewers'
				? `${episodeTitle} had ${result.value} million US viewers.`
				: `${episodeTitle} has an IMDb rating of ${result.value}.`;

		render(text, result.query);
		return;
	}

	const result = searchContent(question);

	if (result) {
		const filename = basename(result.filePath);
		render(result.text, filename, result.similarity);
	} else {
		console.error("Sorry, I couldn't understand your question.");
	}
};

const render = (text: string, source: string, confidence?: number) => {
	//
	const colors = {
		reset: '\x1b[0m',
		bright: '\x1b[1m',
		dim: '\x1b[2m',
		green: '\x1b[32m',
		cyan: '\x1b[36m',
		yellow: '\x1b[33m',
		gray: '\x1b[90m',
	};

	console.log(`\n${colors.bright}${colors.cyan}${text}${colors.reset}`);
	console.log(`${colors.gray}───────────────────────────────────────${colors.reset}`);
	console.log(`${colors.dim}Source: ${colors.reset}${colors.yellow}${source}${colors.reset}`);

	if (confidence) {
		console.log(
			`${colors.dim}Confidence: ${colors.reset}${colors.green}${(confidence * 100).toFixed(1)}%${colors.reset}`,
		);
	}
};

const main = () => {
	//
	const { command, question } = parseArgs(process.argv);

	// biome-ignore format: prefer compact switch statement
	switch (command) {
		case 'ingest': ingest(); break;
		case 'ask': ask(question); break;
	}
};

main();
