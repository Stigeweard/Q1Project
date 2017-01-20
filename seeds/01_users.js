exports.seed = function (knex, Promise) {
    // Deletes ALL existing entries
  return knex('users').del()
        .then(() => Promise.all([
                // Inserts seed entries
          knex('users').insert({
            name: 'justin',
            hashed_password: 'pw1',
          }),
          knex('users').insert({
            name: 'stig',
            hashed_password: 'pw2',
          }),
          knex('users').insert({
            name: 'szyq',
            hashed_password: 'pw3',
          }),
        ]));
};
