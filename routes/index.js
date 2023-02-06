// Import modules which will be used
import express from 'express';
import yahooFinance from 'yahoo-finance2';

// Import my modules.
import financeModule from '../libs/finance-lib.js';
import dataHandler from '../libs/data-handler.js'

// Create a router object.
const router = express.Router();

// Assign the App title to a variable.
const title = 'Stock Simulator';

// Declare the variables which will be passed to the template file. 
let stocks;
let types;
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

// Daclare recurring function to carry out repeating timed actions.
async function timedService() {
  // Call the delete old files procedure to remove historical data files that are more than a day old.
  dataHandler.deleteOldFiles();

  // Set the function to recur every hour.
  setTimeout(timedService, 3600000);
}
timedService();

async function loadData(search_query, type) {
  try {
    if (search_query) {
      // Get a list of stocks matching the query.
      stocks = await financeModule.getQueriedStocks(search_query);
    } else {
      // Get a list of trending stocks, via my finance module.
      stocks = await financeModule.getTrendingStocks();
    }

    types = new Set(stocks.map(({quoteType}) => quoteType))

    if (type) {
      stocks = stocks.filter(stock => stock.quoteType == type)
    }
    
    // Iterates through each symbol in the stocks array
    financeModule.fetchHistoricalData(stocks.map(({symbol}) => symbol).slice(0, 100));
  } catch (e) {
    console.log(e)
  }
}

// Handle GET requests for the index router.
router.get('/', async (req, res, next) => {
  const { search_query, type } = req.query;
  await loadData(search_query, type)

  // Render the index template, and passes in variables to be used.
  res.render('index', {
    title,
    stocks,
    types
    //projectionQuantiles,
    //actualData: pastData.concat(presentData),
  });
});

// Exports the index router.
export default router;