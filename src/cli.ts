#!/usr/bin/env bun

const parseArgs = (args: string[]) => {
	return {
		question: args[2],
	};
};

const main = () => {
	//
	const { question } = parseArgs(process.argv);

	if (!question) {
		console.error('Missing question');
		process.exit(1);
	}

	console.log(question);
};

main();
