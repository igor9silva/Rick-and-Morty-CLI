DROP TABLE IF EXISTS episodes;

CREATE TABLE IF NOT EXISTS episodes (
	episode_id INTEGER PRIMARY KEY,
	title TEXT NOT NULL UNIQUE,
	season INTEGER NOT NULL,
	air_date TEXT NOT NULL,
	dimension TEXT NOT NULL,
	arc TEXT NOT NULL,
	headline_character TEXT NOT NULL,
	us_viewers_millions REAL NOT NULL,
	imdb_rating REAL NOT NULL
);

DELETE FROM episodes;

INSERT INTO episodes (episode_id, title, season, air_date, dimension, arc, headline_character, us_viewers_millions, imdb_rating) VALUES
	(1, 'Pilot', 1, '2013-12-02', 'Earth C-137', 'Smith Family Origins', 'Rick Sanchez', 1.10, 8.1),
	(2, 'Rick Potion #9', 1, '2014-01-27', 'Cronenberg Earth', 'Cronenberg Fallout', 'Rick Sanchez', 1.77, 9.0),
	(3, 'Total Rickall', 2, '2015-08-16', 'Earth C-137', 'Parasite Siege', 'Beth Smith', 1.96, 9.3),
	(4, 'Get Schwifty', 2, '2015-08-23', 'Cromulon Arena', 'Planet Music', 'Morty Smith', 1.32, 8.5),
	(5, 'The Wedding Squanchers', 2, '2015-10-04', 'Birdworld', 'Galactic Federation Collapse', 'Birdperson', 1.51, 9.2),
	(6, 'Pickle Rick', 3, '2017-08-06', 'Earth C-137', 'Family Therapy', 'Rick Sanchez', 2.31, 9.2),
	(7, 'The Ricklantis Mixup', 3, '2017-09-10', 'Citadel of Ricks', 'Citadel Politics', 'Evil Morty', 2.30, 9.8),
	(8, 'The Old Man and the Seat', 4, '2019-11-17', 'Monogatron Rest Stop', 'Private Restroom', 'Rick Sanchez', 1.55, 9.0),
	(9, 'The Vat of Acid Episode', 4, '2020-05-17', 'Blips and Chitz Warehouse', 'Consequence Lesson', 'Morty Smith', 1.13, 9.5),
	(10, 'Rickmurai Jack', 5, '2021-09-05', 'Citadel of Ricks', 'Citadel Finale', 'Rick Sanchez', 0.92, 9.6);
