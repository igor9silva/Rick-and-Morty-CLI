#!/usr/bin/env bun

import { z } from 'zod';
import { getDb, seedDatabase } from './db';

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
	console.log('seeding database...');

	const db = getDb();
	seedDatabase(db);

	console.log('database seeded successfully');
}

const ask = (question?: string) => {
	//
	if (!question) {
		console.error('Question is required');
		process.exit(1);
	}

	console.log('ask', question);
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
