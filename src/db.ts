
import { Database } from "bun:sqlite";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const __dirname = join(__filename, "..");
const PROJECT_ROOT = join(__dirname, "..");

export const STORE_DIR = join(PROJECT_ROOT, "store");
export const DATA_DIR = join(PROJECT_ROOT, "data");
export const SQL_DIR = join(DATA_DIR, "sql");
export const SQLITE_DB_PATH = join(STORE_DIR, "metrics.db");
export const SQL_SEED_PATH = join(SQL_DIR, "seed.sql");

let dbInstance: Database | undefined;

export const ensureDir = (path: string): void => {
	//
	if (existsSync(path)) return;

	mkdirSync(path, { recursive: true });
};

export const seedDatabase = (db: Database): void => {
	//
	const seed = readFileSync(SQL_SEED_PATH, "utf-8");

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

export const getAllEpisodeTitles = (db: Database): string[] => {
	//
	const query = db.query('SELECT title FROM episodes');
	const rows = query.all() as { title: string }[];
	
	return rows.map(row => row.title);
};

export const getEpisodeMetric = (
	db: Database,
	episodeTitle: string,
	metricType: 'viewers' | 'rating'
): number | undefined => {
	//
	const column = metricType === 'viewers' ? 'us_viewers_millions' : 'imdb_rating';
	const query = db.query(`SELECT ${column} FROM episodes WHERE title = ?`);
	const row = query.get(episodeTitle) as { [key: string]: number } | null;
	
	return row ? row[column] : undefined;
};
