'use strict';

const express = require('express');
const knex = require('../knex');
const router = express.Router();
const bcrypt = require('bcrypt-as-promised');


router.get('/users', (req, res) => {
    knex('users').then((users) => {
        res.send(users);
    });
});

router.post('/users', (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    if (!username || username.trim() === '') {
        const err = new Error('Username must not be blank');
        err.status = 400;

        return next(err);
    }
    if (!password || password.trim() === '') {
        const err = new Error('Password must not be blank');
        err.status = 400;

        return next(err);
    }
    knex('users')
        .select(knex.raw('1=1'))
        .where('name', username)
        .first()
        .then((exists) => {
            if (exists) {
                const err = new Error('Username already exists');
                err.status = 400;
                throw err;
            }
            return bcrypt.hash(password, 12);
        })
        .then((hashed_password) => {
            return knex('users').insert({
                'name': username,
                'hashed_password': hashed_password
            });
        })
        .then(() => {
            res.sendStatus(200);
        })
        .catch((err) => {
            next(err);
        });
});

module.exports = router;
