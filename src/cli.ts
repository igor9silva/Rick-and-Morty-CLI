#!/usr/bin/env bun

import { z } from 'zod';

const commandSchema = z.enum(['ask'], {
	message: "Invalid command. Available commands: ask"
});

const questionSchema = z.string().min(1, {
	message: "Question is required and cannot be empty"
});

const argsSchema = z.tuple([
	z.string(), // node
	z.string(), // script path
	commandSchema,
	questionSchema,
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

const main = () => {
	//
	const { command, question } = parseArgs(process.argv);

	console.log(command, question);
};

main();
