exports.up = knex => {
    return knex.schema.createTable('users', (table) => {
        table.increments();
        table.string('name')
            .unique()
            .notNullable();
        table.specificType('hashed_password', 'char(60)')
            .notNullable();
        table.timestamps(true, true);
    });
};

exports.down = (knex, Promise) => {
    // .then(() => knex.raw("ALTER SEQUENCE movies_id_seq RESTART WITH 1"))
    return knex.raw("ALTER SEQUENCE users_id_seq RESTART WITH 1")
        .then(() => knex.raw('DROP TABLE users CASCADE'))
};
