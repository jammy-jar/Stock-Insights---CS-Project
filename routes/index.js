// Import modules which will be used.
import express from 'express';
import yahooFinance from 'yahoo-finance2';

// Import my modules.
import financeModule from '../libs/finance-lib.js';
import dataHandler from '../libs/data-handler.js'

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
let projectionQuantiles;
let pastData;
let presentData;

const projectStocks = async () => {
  const startDate = '2015-12-01';
  const endDate = '2016-12-01';

  const pastPeriod1 = new Date(new Date(startDate) - 86400000 - 365*86400000);

  pastData = await yahooFinance.historical('^FTSE', { period1: pastPeriod1, period2: startDate });
  presentData = await yahooFinance.historical('^FTSE', { period1: startDate, period2: endDate });

  const projections = financeModule.projectPrices(pastData)

  projectionQuantiles = financeModule.getQuantiles(projections, d => d.close, [
    0.1,
    0.25,
    0.5,
    0.75,
    0.9
  ]);
}

const test = async symbols => {
  pastData = await yahooFinance.historical('^FTSE', { period1: pastPeriod1, period2: startDate });
}

// Declare recurring function to carry out repeating timed actions.
async function updateService() {
  // Get a list of trending stock quotes, via my finance module.
  const stockQuotes = await financeModule.getTrendingStocks();
  
  // Iterate through each stock quote in the list and call the save function for each.
  stockQuotes.forEach(quote => dataHandler.saveStock(quote))

  // Set the function to recur every 5 minutes.
  setTimeout(updateService, 300000);
}
// updateService();

// Handle GET requests for the index router.
router.get('/', async (req, res, next) => {
  // Extract the variables from the request.
  const { search_all, search_query, type } = req.query;

  let stocks = [];
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
        { 
          name: { $regex: search_query, $options: 'i' },
          symbol: { $regex: search_query, $options: 'i' } 
        } 
    ] }).limit(100) 

  } else if (search_all && type) {
    const quotes = await financeModule.getQueriedStocks(search_all)
    for (const quote of quotes) {
      stocks.push(await dataHandler.saveStock(quote))
    }
    stocks = stocks.filter(stock => stock.type == type)

  } else if (type) {
    stocks = await Stock.find({ type }).limit(100)

  } else if (search_query) {
    stocks = await Stock.find(
      { $or:[ 
        { 
          name: { $regex: search_query, $options: 'i' },
          symbol: { $regex: search_query, $options: 'i' } 
        } 
    ] }).limit(100)  

  } else if (search_all) {
    const quotes = await financeModule.getQueriedStocks(search_all)
    for (const quote of quotes) {
      stocks.push(await saveStock(quote))
    }
    
  }
  else {
    stocks = await Stock.find({}).limit(100)
  }

  // Render the index template, and passes in variables to be used.
  res.render('index', {
    title,
    stocks,
    types,
    type,
    search_query
    //projectionQuantiles,
    //actualData: pastData.concat(presentData),
  });
});

// Exports the index router.
export default router;

// Handle GET requests for the index router.
router.get('/', async (req, res, next) => {
  // Extract the search_query and type variables from the request.
  const { search_query, type } = req.query;

  let stocks = [];
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
        { 
          name: { $regex: search_query, $options: 'i' }, 
          symbol: { $regex: search_query, $options: 'i' } 
        } 
      ] }).limit(100)

  } else if (type) {
    stocks = await Stock.find({ type }).limit(100)
  } else if (search_query) {
    stocks = await Stock.find(
      { $or:[ 
        { 
          name: { $regex: search_query, $options: 'i' },
          symbol: { $regex: search_query, $options: 'i' } 
        } 
    ] }).limit(100)
  }
  else {
    stocks = await Stock.find({}).limit(100)
  }

  // Render the index template, and passes in variables to be used.
  res.render('index', {
    title,
    stocks,
    types,
    type,
    search_query
    //projectionQuantiles,
    //actualData: pastData.concat(presentData),
  });
});