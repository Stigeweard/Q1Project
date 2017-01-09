// Update with your config settings.

module.exports = {
    // process.env.HEROKU_POSTGRESQL_YELLOW_URL
    development: {
        client: 'pg',
        connection: 'postgres://localhost/tripeaks_dev',
        ssl: true
    },

    test: {
        client: 'pg',
        connection: 'postgres://localhost/tripeaks_dev',
        pool: {
            min: 1,
            max: 5
        }
        // debug:true
    },

    production: {
        client: 'pg',
        connection: process.env.DATABASE_URL,
    }

};
