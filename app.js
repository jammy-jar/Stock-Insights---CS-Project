// Includes the modules and frameworks for my app.
import express from 'express';
import path from 'path'
import * as url from 'url';
import mongoose from 'mongoose'
import session from 'express-session'
import flash from 'connect-flash'
import passport from 'passport';
import LocalStrategy from 'passport-local'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

import User from './models/user.js'

// Includes the routes for my app.
import indexRouter from './routes/index.js'
import userRouter from './routes/users.js'
import stocksRouter from './routes/stocks.js'
import watchlistRouter from './routes/watchlist.js'

const app = express();

// Sets the templating engine to pug for the app, 
// and sets the path for the template files to the '/views' directory.
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

mongoose.connect('mongodb://127.0.0.1:27017/stockApp')
    .then(() => {
        console.log('Mongo Connection Open!')
    })
    .catch(err => {
        console.log('Failed to open Mongo Connection. Err: ' + err)
    })

const sessionConfig = {
    secret: 'weaksecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())
app.use(express.json())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.colorMode = req.colorMode;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next()
})

// When the home directory receives a request, 
// the request calls the functions defined in the index router file.
app.use('/watchlist', watchlistRouter);
app.use('/', userRouter);
app.use('/', stocksRouter);
app.use('/', indexRouter);

// Sets my app to be listening to connections to port 8080. 
app.listen(8080, () => {
    console.log("Connected to port 8080");
});