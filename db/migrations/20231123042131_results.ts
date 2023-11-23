import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('results', function (table) {
		table.increments('id').primary();
		table.integer('user_id').references('id').inTable('users');
		table.date('date');
        table.float('score').notNullable();
	});
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('results');
}

