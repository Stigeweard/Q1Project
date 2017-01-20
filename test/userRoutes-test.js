process.env.NODE_ENV = 'development';

const request = require('supertest');
const expect = require('chai').expect;
const app = require('../server');
const knex = require('../knex');

beforeEach((done) => {
  Promise.all([
    knex('users').insert({
      name: 'bruh',
      hashed_password: '$2a$12$IPOhMu0dNHyf8qIVqdw8uO2NZQJR4nPCmvoUouHB8OQ8YAy7DtIva',
      created_at: '2017-01-09T17:16:50.530Z',
      updated_at: '2017-01-09T17:16:50.530Z',
    }),
    knex('users').insert({
      name: 'bigdog',
      hashed_password: '$2b$12$IPOhMu0dNHyf8qIVqdw8uO2NZQJR4nPCmvoUouHB8OQ8YAy7DtIva',
      created_at: '2017-01-09T17:16:50.530Z',
      updated_at: '2017-01-09T17:16:50.530Z',
    }),
    knex('users').insert({
      name: 'minnie',
      hashed_password: '$2c$12$IPOhMu0dNHyf8qIVqdw8uO2NZQJR4nPCmvoUouHB8OQ8YAy7DtIva',
      created_at: '2017-01-09T17:16:50.530Z',
      updated_at: '2017-01-09T17:16:50.530Z',
    }),
  ])
        .then(() => {
          Promise.all([
            knex('scores').insert({
              score: 15,
              user_id: 1,
            }),
            knex('scores').insert({
              score: 30,
              user_id: 2,
            }),
            knex('scores').insert({
              score: 25,
              user_id: 3,
            }),
            knex('scores').insert({
              score: 77,
              user_id: 3,
            }),
          ]);
        })
        .then(() => done());
});

afterEach((done) => {
  knex('users').del()
        .then(() => knex.raw('ALTER SEQUENCE users_id_seq RESTART WITH 1'))
        .then(() => knex('scores').del())
        .then(() => knex.raw('ALTER SEQUENCE scores_id_seq RESTART WITH 1'))
        .then(() => done());
});

describe('GET /scores', () => {
  it('responds with JSON', (done) => {
    request(app)
            .get('/users')
            .expect('Content-Type', /json/)
            .expect(200, done);
  });

  it('returns an array of all user objects when responding with JSON', (done) => {
    request(app)
            .get('/users')
            .end((err, res) => {
              expect(res.body).to.deep.equal([{
                id: 1,
                name: 'bruh',
                hashed_password: '$2a$12$IPOhMu0dNHyf8qIVqdw8uO2NZQJR4nPCmvoUouHB8OQ8YAy7DtIva',
                created_at: '2017-01-09T17:16:50.530Z',
                updated_at: '2017-01-09T17:16:50.530Z',
              }, {
                id: 2,
                name: 'bigdog',
                hashed_password: '$2b$12$IPOhMu0dNHyf8qIVqdw8uO2NZQJR4nPCmvoUouHB8OQ8YAy7DtIva',
                created_at: '2017-01-09T17:16:50.530Z',
                updated_at: '2017-01-09T17:16:50.530Z',
              }, {
                id: 3,
                name: 'minnie',
                hashed_password: '$2c$12$IPOhMu0dNHyf8qIVqdw8uO2NZQJR4nPCmvoUouHB8OQ8YAy7DtIva',
                created_at: '2017-01-09T17:16:50.530Z',
                updated_at: '2017-01-09T17:16:50.530Z',
              }]);
              done();
            });
  });
});

describe('GET /users/:id', () => {
  it('responds with JSON', (done) => {
    request(app)
            .get('/users/:id')
            .expect('Content-Type', /json/)
            .expect(200, done);
  });

  it('returns a specific sloth given an id', (done) => {
    request(app)
            .get('/users/1')
            .end((err, res) => {
              expect(res.body).to.deep.equal({
                id: 1,
                name: 'Jerry',
                age: 4,
                image: 'https://gifts.worldwildlife.org/gift-center/Images/large-species-photo/large-Three-toed-Sloth-photo.jpg',
              });
              done();
            });
  });

  it('should 404 with nonexisting key', (done) => {
    request(app)
            .get('/users/1000')
            .expect(404)
            .end((err, res) => {
              if (err) {
                return done(err);
              } // if response is 500 or 404 & err, test case will fail
              done();
            });
  });
});

xdescribe('POST /users', () => {
  const newSloth = {
    sloth: {
      id: 4,
      name: 'Veronica',
      age: 8,
      image: 'http://www.wherecoolthingshappen.com/wp-content/uploads/2016/01/1200.jpg',
    },
  };

  it('responds with JSON', (done) => {
    request(app)
            .post('/users')
            .type('form')
            .send(newSloth)
            .expect('Content-Type', /json/)
            .expect(200, done);
  });

  it('adds the new sloth to the database', (done) => {
    request(app)
            .post('/users')
            .type('form')
            .send(newSloth)
            .end((err, res) => {
              knex('users').select().then((users) => {
                expect(users).to.have.lengthOf(4);
                expect(users).to.deep.include(newSloth.sloth);
                done();
              });
            });
  });
});

xdescribe('PUT /users/:id', () => {
  const updatedSloth = {
    sloth: {
      name: 'Homunculus',
      age: 500,
      image: 'http://i878.photobucket.com/albums/ab344/TheScav/FMA%20Characters/sloth.png',
    },
  };

  it('responds with JSON', (done) => {
    request(app)
            .put('/users/1')
            .type('form')
            .send(updatedSloth)
            .expect('Content-Type', /json/)
            .expect(200, done);
  });

  it('updates the sloth in the database', (done) => {
    request(app)
            .put('/users/1')
            .type('form')
            .send(updatedSloth)
            .end((err, res) => {
              knex('users').where('id', 1).first().then((sloth) => {
                expect(sloth.name).to.equal(updatedSloth.sloth.name);
                expect(sloth.age).to.equal(updatedSloth.sloth.age);
                expect(sloth.image).to.equal(updatedSloth.sloth.image);
                done();
              });
            });
  });

  it('returns the updated sloth in the response', (done) => {
    request(app)
            .put('/users/1')
            .type('form')
            .send(updatedSloth)
            .end((err, res) => {
              expect(res.name).to.equal(updatedSloth.sloth.name);
              expect(res.age).to.equal(updatedSloth.sloth.age);
              expect(res.image).to.equal(updatedSloth.sloth.image);
              done();
            });
  });
});

xdescribe('DELETE /users/:id', () => {
  it('responds with 200 status', (done) => {
    request(app)
            .delete('/users/:id')
            .expect(200, done);
  });

  it('should remove a naughty sloth', (done) => {
    request(app)
            .delete('/users/1')
            .end((err, res) => {
              knex('users').select().then((users) => {
                expect(users).to.have.lengthOf(2);
                done();
              });
            });
  });
});
