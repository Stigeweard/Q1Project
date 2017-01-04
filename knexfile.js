// Update with your config settings.

module.exports = {

    development: {
        client: 'pg',
        connection: 'postgres://localhost/tripeaks_dev'
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
