import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('users', function (table) {
		table.increments('id').primary();
		table.string('username', 100).notNullable();
		table .string('salt').notNullable();
		table.string('hashedPass').notNullable();
	});
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('users');
}

