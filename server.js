const express = require('express');
const app = express();
const knex = require('./knex');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const path = require('path');
const cookieSession = require('cookie-session');
const dotenv = require('dotenv').config();
const ejs = require('ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cookieSession({
  name: 'tripeaks_login_session',
  secret: process.env.SESSION_SECRET
}));

app.use(express.static('views'));
// app.use(favicon(path.join(__dirname,'views','images','favicon.ico')));
app.set('view engine', 'ejs');
const userRoutes = require('./routes/userRoutes');

app.use(userRoutes)

app.listen(8000, () => console.log('Listening on localhost:8000'));

module.exports = app;
