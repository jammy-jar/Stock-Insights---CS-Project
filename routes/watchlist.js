import express from 'express'
import { isLoggedIn } from '../libs/middleware.js';
import catchAsync from '../utils/catchAsync.js';

import User from '../models/user.js'
import Stock from '../models/stock.js';

const router = express.Router();

const title = 'Watchlist'

router.post('/add', isLoggedIn, catchAsync(async (req, res, next) => {
    const symbol = req.body.stockSymbol;
    const user = await User.findOne({username: req.session.passport.user});
    const stock = await Stock.findOne({symbol})

    if (user.watchlist) {
        if (user.watchlist.some(stock => stock[0] == symbol)) {
            req.flash('error', 'This stock is already in your watchlist!')
            return res.redirect('/' + symbol)
        }
        user.watchlist.push([symbol, new Date(), stock.price]);
    } else {
        user.watchlist = [ [symbol, new Date(), stock.price] ]
    }

    await user.save();

    req.flash('success', 'Added Stock to your Watchlist!')
    res.redirect('/' + symbol)
}));

router.post('/remove', isLoggedIn, catchAsync(async (req, res, next) => {
    const symbol = req.body.stockSymbol;
    const user = await User.findOne({username: req.session.passport.user});

    if (user.watchlist && user.watchlist.some(stock => stock[0] == symbol)) {
        let i = 0;
        let found = false;
        while (!found) {
            if (user.watchlist[i][0] == symbol) {
                found = true;
            } else {
                i++;
            }
        }
        user.watchlist.splice(i, 1)
    } else {
        req.flash('error', 'This stock not in your watchlist!')
        return res.redirect('/watchlist')
    }

    await user.save();

    req.flash('success', 'Removed Stock from your Watchlist!')
    return res.redirect('/watchlist')
}));

router.get('/', isLoggedIn, catchAsync(async (req, res, next) => {
    const user = await User.findOne({username: req.session.passport.user});
    const stocks = []

    for (const symbol of user.watchlist) {
        stocks.push(await Stock.findOne({symbol}))
    }

    res.render('user/watchlist', {
      title,
      stocks,
      user
    });
}));

export default router;