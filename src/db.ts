import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const __dirname = join(__filename, '..');
const PROJECT_ROOT = join(__dirname, '..');

export const STORE_DIR = join(PROJECT_ROOT, 'store');
export const DATA_DIR = join(PROJECT_ROOT, 'data');
export const SQL_DIR = join(DATA_DIR, 'sql');
export const SQLITE_DB_PATH = join(STORE_DIR, 'metrics.db');
export const SQL_SEED_PATH = join(SQL_DIR, 'seed.sql');

let dbInstance: Database | undefined;

export const ensureDir = (path: string): void => {
	//
	if (existsSync(path)) return;

	mkdirSync(path, { recursive: true });
};

export const seedDatabase = () => {
	//
	const db = getDb();
	const seed = readFileSync(SQL_SEED_PATH, 'utf-8');

	db.run(seed);
};

export const getDb = (): Database => {
	//
	if (dbInstance) return dbInstance;

	ensureDir(STORE_DIR);
	dbInstance = new Database(SQLITE_DB_PATH);

	return dbInstance;
};

// ===========================================================================

export const getAllEpisodeTitles = (): string[] => {
	//
	const db = getDb();
	const query = db.query('SELECT title FROM episodes');
	const rows = query.all() as { title: string }[];

	return rows.map((row) => row.title);
};

export const getEpisodeMetric = (
	episodeTitle: string, //
	metricType: 'viewers' | 'rating',
): { value: number; query: string } | undefined => {
	//
	const db = getDb();
	const column = metricType === 'viewers' ? 'us_viewers_millions' : 'imdb_rating';
	const sqlQuery = `SELECT ${column} FROM episodes WHERE title = ?`;
	const query = db.query(sqlQuery);
	const row = query.get(episodeTitle) as { [key: string]: number } | null;

	return row ? { value: row[column], query: sqlQuery.replace('?', `'${episodeTitle}'`) } : undefined;
};
