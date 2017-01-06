'use strict';

const express = require('express');
const knex = require('../knex');
const router = express.Router();
const bcrypt = require('bcrypt-as-promised');
const path = require('path');

router.get('/', (req, res) => {
    res.render('index')
});

router.get('/game', (req, res) => {
    console.log('hit game route');
    res.render('gameBoard')
});

router.get('/users', (req, res) => {
    knex('users').then((users) => {
        res.send(users);
    });
});

router.post('/users', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
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
        // .select(knex.raw('1=1'))
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

router.post('/session', (req, res, next) => {

    const username = req.body.username;
    const password = req.body.password;

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

    let user;

    knex('users')
        .where('name', username)
        .first()
        .then((row) => {
            if (!row) {
                const err = new Error('Unauthorized');
                err.status = 401;

                throw err;
            }
            user = row
            return bcrypt.compare(password, row.hashed_password);
        })
        .then(() => {
            req.session.userId = user.id;
            res.send('logged in!')
        })
        .catch(bcrypt.MISMATCH_ERROR, () => {
            const err = new Error('Unauthorized');
            err.status = 401;

            throw err;
        })
        .catch((err) => {
            next(err);
        });
});

router.delete('/session', (req, res) => {
    req.session = null;
    res.sendStatus(200);
});

module.exports = router;
