// Import modules which will be used.
import express from 'express';
import yahooFinance from 'yahoo-finance2';

// Import my modules.
import catchAsync from '../utils/catchAsync.js';

import Stock from '../models/stock.js'

// Create a router object.
const router = express.Router();

let stock;
let insight;
let bullishScore;

router.get('/list', catchAsync(async (req, res, next) => {
    let stocks = [];

    // Extract the variables from the request.
    const { pageNum, search_all, search_query, type, sort = 'price', order = -1 } = req.query;

    const skip = pageNum*40;
    const limit = pageNum*40 + 40;

    // If there is both a type filter and search query then it queries the database 
    // and filters the results by type, and uses regex to filter if the name OR symbol
    // matches the search query (ignoring the case).

    // Else if there's only a type filter, it finds stocks by the type.
    
    // Else if there's only a search query it finds matching stocks using regex 
    // to filter if the name OR symbol matches the search query (ignoring the case).

    // Else it just fetches the first 100 stocks.
    if (type && search_query){
        stocks = await Stock.find(
        { type, $or:[ 
            { name: { $regex: search_query, $options: 'i' } },
            { symbol: { $regex: search_query, $options: 'i' } } 
        ] }).sort({[sort]: order}).skip(skip).limit(limit)
    } else if (search_all && type) {
        try {
        const quotes = await financeModule.getQueriedStocks(search_all)

        for (const quote of quotes) {
            await dataHandler.saveStock(quote)
        }
        } catch {}

        stocks = await Stock.find(
            { $or:[   
                { name: { $regex: search_all, $options: 'i' } },
                { symbol: { $regex: search_all, $options: 'i' } } 
            ] }).sort({[sort]: order}).skip(skip).limit(limit)
        stocks = stocks.filter(stock => stock.type == type)
    } else if (type) {
        stocks = await Stock.find({ type }).sort({[sort]: order}).skip(skip).limit(limit)
    } else if (search_query) {
        stocks = await Stock.find(
        { $or:[   
            { name: { $regex: search_query, $options: 'i' } },
            { symbol: { $regex: search_query, $options: 'i' } } 
        ] }).sort({[sort]: order}).skip(skip).limit(limit)
    } else if (search_all) {
        try {
            const quotes = await financeModule.getQueriedStocks(search_all)
    
            for (const quote of quotes) {
                await dataHandler.saveStock(quote)
            }
            } catch {}
    
            stocks = await Stock.find(
                { $or:[   
                    { name: { $regex: search_all, $options: 'i' } },
                    { symbol: { $regex: search_all, $options: 'i' } } 
                ] }).sort({[sort]: order}).skip(skip).limit(limit)
    }
    else {
        stocks = await Stock.find({}).sort({[sort]: order}).skip(skip).limit(limit)
    }
    res.json(stocks)
}));

router.get('/:id', catchAsync(async (req, res, next) => {
    stock = await Stock.findOne({ symbol: req.params.id });
    insight = await yahooFinance.insights(stock.symbol)
    next()
}));

router.get('/:id', catchAsync(async (req, res, next) => {
    if(insight && insight.instrumentInfo) {
        bullishScore = insight.instrumentInfo.technicalEvents.intermediateTermOutlook.score
        if (insight.instrumentInfo.technicalEvents.intermediateTermOutlook.direction == 'Bearish') {
            bullishScore = -bullishScore
        }
    } else {
        bullishScore = undefined;
    }

    const title = `${stock.name} (${stock.symbol})`;

    res.render('stocks', {
      title,
      bullishScore,
      stock
    });
}))

export default router