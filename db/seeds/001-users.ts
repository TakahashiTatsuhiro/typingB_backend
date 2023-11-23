import { Knex } from 'knex';
import crypto from 'crypto';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('users').del();
    await knex('results').del();

    const users = ['admin', 'tatsu', 'taro', 'jiro', 'sabro'];

    for (const name of users) {
        const salt = crypto.randomBytes(6).toString('hex');
        const saltAndPass = `${salt}${name}`;
        const hashedPass = crypto.createHash('sha256').update(saltAndPass).digest('hex');
        await knex('users').insert({ username: name, salt: salt, hashedPass: hashedPass });
    }
}
