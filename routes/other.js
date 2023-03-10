import express from 'express'
import catchAsync from '../utils/catchAsync.js'

const router = express.Router();

const title = 'Login'

router.get('/color', catchAsync(async (req, res, next) => {
    if (req.session.colorMode == 'light') {
        res.locals.colorMode = 'dark';
        req.session.colorMode = 'dark';
    }
    if (req.session.colorMode == 'dark') {
        res.locals.colorMode = 'light';
        req.session.colorMode = 'light';
    }
    redirect();
}));