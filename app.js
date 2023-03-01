// Includes the modules and frameworks for my app.
import express from 'express';
import path from 'path'
import * as url from 'url';
import mongoose from 'mongoose'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// Includes the routes for my app.
import indexRouter from './routes/index.js'
import loginRouter from './routes/login.js'
import registerRouter from './routes/register.js'

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

// When the home directory receives a request, 
// the request calls the functions defined in the index router file.
app.use('/', indexRouter);
app.use('/login', loginRouter)
app.use('/register', registerRouter)

// Sets my app to be listening to connections to port 8080. 
app.listen(8080, () => {
    console.log("Connected to port 8080");
});