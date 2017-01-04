exports.seed = function(knex, Promise) {
    // Deletes ALL existing entries
    return knex('scores').del()
        .then(function() {
            return Promise.all([
                // Inserts seed entries
                knex('scores').insert({
                    score: 55,
                    user_id: 1
                }),
                knex('scores').insert({
                    score: 155,
                    user_id: 2
                }),
                knex('scores').insert({
                    score: 552,
                    user_id: 2
                })
            ]);
        });
};
