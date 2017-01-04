exports.up = knex => {
    return knex.schema.createTable('scores', (table) => {
        table.increments();
        table.integer('score').notNullable();
        // TODO: add time ?
        table.integer('user_id').unsigned().references('users.id').notNullable().onDelete('CASCADE');
    });
};

exports.down = knex => {
    return knex.raw('DROP TABLE scores CASCADE');
};
