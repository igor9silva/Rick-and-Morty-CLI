#!/usr/bin/env bun

import { z } from 'zod';
import { getAllEpisodeTitles, getDb, getEpisodeMetric, seedDatabase } from './db';
import { identifyEpisodeTitle, identifyMetricType } from './query-parser';

const commandSchema = z.enum(['ingest', 'ask'], {
	message: "Invalid command. Available commands: ingest, ask"
});

const questionSchema = z.string().min(1, {
	message: "Question is required and cannot be empty"
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
}

const ingest = () => {
	//
	console.info('seeding database...');

	const db = getDb();
	seedDatabase(db);

	console.info('database seeded successfully');
}

const ask = (question?: string) => {
	//
	if (!question) {
		console.error('Question is required');
		process.exit(1);
	}

	const db = getDb();
	const episodeTitles = getAllEpisodeTitles(db);

	const episodeTitle = identifyEpisodeTitle(question, episodeTitles);
	const metricType = identifyMetricType(question);

	if (!episodeTitle || !metricType) {
		console.error('Sorry, I couldn\'t understand your question. Make sure to include a valid episode title.');
		process.exit(1);
	}

	const value = getEpisodeMetric(db, episodeTitle, metricType);

	if (!value) {
		console.error(`No data found for episode "${episodeTitle}"`);
		process.exit(1);
	}

	if (metricType === 'viewers') {
		console.log(`${episodeTitle} had ${value} million US viewers.`);
	} else {
		console.log(`${episodeTitle} has an IMDb rating of ${value}.`);
	}
}

const main = () => {
	//
	const { command, question } = parseArgs(process.argv);

	switch (command) {
		case 'ingest': ingest(); break;
		case 'ask': ask(question); break;
	}
};

main();
