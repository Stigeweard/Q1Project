const express = require('express');
const app = express();
const knex = require('./knex');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/users', (req, res) => {
    knex('users').select().then(users => {
        res.send(users);
    });
});

app.listen(3000, () => console.log("Listening on localhost:3000"));

module.exports = app
