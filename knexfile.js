// Update with your config settings.

module.exports = {

    development: {
        client: 'pg',
        connection: HEROKU_POSTGRESQL_YELLOW_URL,
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
    }

};
