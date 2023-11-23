import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
	// Deletes ALL existing entries
	await knex('results').del();

	const now = new Date();
	const oneDay = 24 * 60 * 60 * 1000;

	// Inserts seed entries
	await knex('results').insert([
		{ user_id: 2, score: 25, date: new Date() },
		{ user_id: 2, score: 27, date: new Date() },
		{ user_id: 2, score: 32, date: new Date() },
		{ user_id: 2, score: 29, date: new Date() },
		{ user_id: 2, score: 35, date: new Date() },
		{ user_id: 2, score: 44, date: new Date() },
		{ user_id: 2, score: 40, date: new Date() },
		{ user_id: 2, score: 42, date: new Date() },
		{ user_id: 2, score: 44, date: new Date() },
		{ user_id: 2, score: 47, date: new Date() },

		{ user_id: 3, score: 16, date: new Date() },
        { user_id: 3, score: 14, date: new Date() },
        { user_id: 3, score: 19, date: new Date() },
        { user_id: 3, score: 17, date: new Date() },
        { user_id: 3, score: 20, date: new Date() },
        { user_id: 3, score: 22, date: new Date() },
        { user_id: 3, score: 18, date: new Date() },
        { user_id: 3, score: 26, date: new Date() },
        { user_id: 3, score: 28, date: new Date() },
        { user_id: 3, score: 30, date: new Date() },

        { user_id: 4, score: 36, date: new Date() },
        { user_id: 4, score: 32, date: new Date() },
        { user_id: 4, score: 33, date: new Date() },
        { user_id: 4, score: 40, date: new Date() },
        { user_id: 4, score: 44, date: new Date() },
        { user_id: 4, score: 48, date: new Date() },
        { user_id: 4, score: 53, date: new Date() },
        { user_id: 4, score: 62, date: new Date() },
        { user_id: 4, score: 69, date: new Date() },
        { user_id: 4, score: 65, date: new Date() },

        { user_id: 5, score: 26, date: new Date() },
        { user_id: 5, score: 28, date: new Date() },
        { user_id: 5, score: 24, date: new Date() },
        { user_id: 5, score: 30, date: new Date() },
        { user_id: 5, score: 34, date: new Date() },
        { user_id: 5, score: 32, date: new Date() },
        { user_id: 5, score: 34, date: new Date() },
        { user_id: 5, score: 38, date: new Date() },
        { user_id: 5, score: 40, date: new Date() },
        { user_id: 5, score: 37, date: new Date() },
	]);
}
