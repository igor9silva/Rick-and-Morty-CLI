import { describe, expect, test } from 'bun:test';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseAllEpisodes, parseEpisodeFile, splitIntoSentencesByPunctuation } from '../src/text-processor';

describe('Sentence Splitting', () => {
	//
	test('splits on period followed by space', () => {
		//
		const text = 'First sentence. Second sentence.';
		const sentences = splitIntoSentencesByPunctuation(text);

		expect(sentences).toEqual(['First sentence', 'Second sentence.']);
	});

	test('splits on exclamation mark', () => {
		//
		const text = 'Wow! Amazing!';
		const sentences = splitIntoSentencesByPunctuation(text);

		expect(sentences).toEqual(['Wow', 'Amazing!']);
	});

	test('splits on question mark', () => {
		//
		const text = 'Who is Rick? What about Morty?';
		const sentences = splitIntoSentencesByPunctuation(text);

		expect(sentences).toEqual(['Who is Rick', 'What about Morty?']);
	});

	test('handles mixed punctuation', () => {
		//
		const text = 'Statement. Question? Exclamation!';
		const sentences = splitIntoSentencesByPunctuation(text);

		expect(sentences).toEqual(['Statement', 'Question', 'Exclamation!']);
	});

	test('does not split on abbreviations without space', () => {
		//
		const text = 'Mr.Poopybutthole is a character. He appears often.';
		const sentences = splitIntoSentencesByPunctuation(text);

		expect(sentences).toEqual(['Mr.Poopybutthole is a character', 'He appears often.']);
	});

	test('trims whitespace', () => {
		//
		const text = '  First.   Second.  ';
		const sentences = splitIntoSentencesByPunctuation(text);

		expect(sentences).toEqual(['First', 'Second']);
	});

	test('handles single sentence', () => {
		//
		const text = 'Only one sentence';
		const sentences = splitIntoSentencesByPunctuation(text);

		expect(sentences).toEqual(['Only one sentence']);
	});

	test('handles empty string', () => {
		//
		const text = '';
		const sentences = splitIntoSentencesByPunctuation(text);

		expect(sentences).toEqual([]);
	});
});

describe('Episode File Parsing', () => {
	//
	const testDir = join(process.cwd(), 'tests', 'fixtures');
	const testFile = join(testDir, 'test-episode.md');

	test('parses episode with synopsis and bullets', () => {
		//
		// Create test markdown file
		mkdirSync(testDir, { recursive: true });
		const markdown = `# Test Episode

Rick does something crazy. Morty follows along reluctantly.

- Rick builds a device.
- Morty questions the ethics.
- Beth drinks wine.`;

		writeFileSync(testFile, markdown, 'utf-8');

		const chunks = parseEpisodeFile(testFile);

		expect(chunks.length).toBe(5);

		// Check synopsis sentences
		expect(chunks[0]).toEqual({
			episodeTitle: 'Test Episode',
			text: 'Rick does something crazy',
		});
		expect(chunks[1]).toEqual({
			episodeTitle: 'Test Episode',
			text: 'Morty follows along reluctantly.',
		});

		// Check bullet points
		expect(chunks[2]).toEqual({
			episodeTitle: 'Test Episode',
			text: 'Rick builds a device.',
		});
		expect(chunks[3]).toEqual({
			episodeTitle: 'Test Episode',
			text: 'Morty questions the ethics.',
		});
		expect(chunks[4]).toEqual({
			episodeTitle: 'Test Episode',
			text: 'Beth drinks wine.',
		});

		// Cleanup
		rmSync(testDir, { recursive: true });
	});

	test('handles episode with no bullets', () => {
		//
		mkdirSync(testDir, { recursive: true });
		const markdown = `# Simple Episode

Just a synopsis here.`;

		writeFileSync(testFile, markdown, 'utf-8');

		const chunks = parseEpisodeFile(testFile);

		expect(chunks.length).toBe(1);
		expect(chunks[0]).toEqual({
			episodeTitle: 'Simple Episode',
			text: 'Just a synopsis here.',
		});

		rmSync(testDir, { recursive: true });
	});

	test('handles episode with multi-sentence synopsis', () => {
		//
		mkdirSync(testDir, { recursive: true });
		const markdown = `# Complex Episode

First sentence. Second sentence! Third sentence?

- Bullet one.`;

		writeFileSync(testFile, markdown, 'utf-8');

		const chunks = parseEpisodeFile(testFile);

		expect(chunks.length).toBe(4);
		expect(chunks[0].text).toBe('First sentence');
		expect(chunks[1].text).toBe('Second sentence');
		expect(chunks[2].text).toBe('Third sentence?');
		expect(chunks[3].text).toBe('Bullet one.');

		rmSync(testDir, { recursive: true });
	});

	test('extracts correct episode title', () => {
		//
		mkdirSync(testDir, { recursive: true });
		const markdown = `# The Ricklantis Mixup

Synopsis text.

- Bullet.`;

		writeFileSync(testFile, markdown, 'utf-8');

		const chunks = parseEpisodeFile(testFile);

		expect(chunks.every((c) => c.episodeTitle === 'The Ricklantis Mixup')).toBe(true);

		rmSync(testDir, { recursive: true });
	});

	test('handles empty file', () => {
		//
		mkdirSync(testDir, { recursive: true });
		writeFileSync(testFile, '', 'utf-8');

		const chunks = parseEpisodeFile(testFile);

		expect(chunks).toEqual([]);

		rmSync(testDir, { recursive: true });
	});
});

describe('Parse All Episodes', () => {
	//
	test('parses all corpus files', () => {
		//
		const chunks = parseAllEpisodes();

		// Should have chunks from all 10 episodes
		expect(chunks.length).toBeGreaterThan(0);

		// Check that we have multiple episodes
		const uniqueEpisodes = new Set(chunks.map((c) => c.episodeTitle));
		expect(uniqueEpisodes.size).toBe(10);

		// Check specific episodes exist
		expect(uniqueEpisodes.has('Pickle Rick')).toBe(true);
		expect(uniqueEpisodes.has('Total Rickall')).toBe(true);
	});

	test('all chunks have episode title and text', () => {
		//
		const chunks = parseAllEpisodes();

		for (const chunk of chunks) {
			expect(chunk.episodeTitle).toBeTruthy();
			expect(chunk.episodeTitle.length).toBeGreaterThan(0);
			expect(chunk.text).toBeTruthy();
			expect(chunk.text.length).toBeGreaterThan(0);
		}
	});
});
