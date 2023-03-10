// Import modules which will be used.
import express from 'express';

// Import my modules.
import financeModule from '../libs/finance-lib.js';
import dataHandler from '../libs/data-handler.js'
import catchAsync from '../utils/catchAsync.js';

import Stock from '../models/stock.js'

// Create a router object.
const router = express.Router();

// Assign the App title to a variable.
const title = 'Stock Insights';

// Declare the variables which will be passed to the template file. 
const types = [
  'EQUITY',
  'CRYPTOCURRENCY',
  'FUTURE',
  'INDEX',
  'ETF',
  'CURRENCY'
]

// Declare recurring function to carry out repeating timed actions.
const updateService = async () => {
  try {
    const symbols = (await Stock.find({})).map(stock => stock.symbol)
    const stockQuotes = await financeModule.getStockQuotes(symbols);
    for (const quote of stockQuotes){
      await dataHandler.saveStock(quote)
    }

    console.log('Complete!')
  } catch {
    console.log('Could not update all Stocks!')
  }
  
  // Set the function to recur every 5 minutes.
  setTimeout(updateService, 300000);
}
updateService();

router.get('/', catchAsync(async (req, res, next) => {
  
  next()
}))

// Handle GET requests for the index router.
router.get('/', catchAsync(async (req, res, next) => {
  // Extract the variables from the request.
  const { search_all = '', search_query = '', type = '', sort = 'price', order = -1 } = req.query;
  
  // Render the index template, and passes in variables to be used.
  res.render('index', {
    title,
    types,
    search_query,
    search_all,
    type,
    sort, 
    order
  });
}));

// Exports the index router.
export default router;