// Import modules which will be used.
import express from 'express';
import yahooFinance from 'yahoo-finance2';

// Import my modules.
import financeModule from '../libs/finance-lib.js';

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
  stockQuotes.forEach(quote => saveStock(quote))

  // Set the function to recur every 5 minutes.
  setTimeout(updateService, 300000);
}
// updateService();

const saveStock = async (quote) => {
  // Search the database for an existing stock and finds the first one matching the symbol.
  let stockDbObject = await Stock.findOne({symbol: quote.symbol})

  // Get a display name for the stock, by default it is the long name,
  // if it doesnt have one it is set to the short name, else it is set to the symbol.
  let displayName;
  if (quote.longName !== undefined) {
      displayName = quote.longName;
  } else if (quote.shortName !== undefined) {
      displayName = quote.shortName;
  } else {
      displayName = quote.symbol;
  }

  // Calculate last years date by taking todays date and subtracting milliseconds in a year.
  const todaysDate = new Date()
  const dateLastYear = new Date(todaysDate - 86400000 * 365);

  // Check if the found object was undefined, meaning no data currently 
  // exists for it in the database. If so, then it fetches data for the stock via the API.
  
  // If data exists for it but the data is not up to date, then it fetches the new data,
  // and appends it to the current data.
  
  // Else it just ends the function.
  if (!stockDbObject) {
    const data = await yahooFinance.historical(quote.symbol, { period1: dateLastYear })

    // Create a new stock object.
    stockDbObject = new Stock({
        symbol: quote.symbol,
        name: displayName,
        price: quote.regularMarketPrice,
        type: quote.quoteType,
        data
    })
  } else if (stockDbObject.data[stockDbObject.data.length - 1].date < todaysDate - 86400000) {
    // Get the date of the last time data was updated but not recorded.
    const lastUnrecordedData = new Date(stockDbObject.data[stockDbObject.data.length - 1].date.valueOf() + 86400000)

    if (lastUnrecordedData > new Date()) {
      return
    }

    // Fetch data from the last time data was not recorded.
    const data = await yahooFinance.historical(quote.symbol, { period1: lastUnrecordedData })

    if (data[0].date >= lastUnrecordedData) {
      console.log(stockDbObject.symbol)
      console.log('Last Recorded: ' + stockDbObject.data[stockDbObject.data.length - 1].date)
      console.log('New Data: ' + data[0].date)
      console.log('Updating Outdated Data')

      // Push data to the rest of the data on the stock object.
      stockDbObject.data = stockDbObject.data.concat(data)
      console.log(stockDbObject.data[stockDbObject.data.length - 1])
    }
    // Update the regular market price to reflect up to date price which is constantly updating.
    stockDbObject.price = quote.regularMarketPrice
  }
  else {
    // Update the regular market price to reflect up to date price which is constantly updating.
    stockDbObject.price = quote.regularMarketPrice
  }

  // Save any changes.
  await stockDbObject.save()
  return stockDbObject
}

// Handle GET requests for the index router.
router.get('/', async (req, res, next) => {
  const { search_all, search_query, type } = req.query;

  let stocks = [];
  if (type && search_query){
    stocks = await Stock.find({ type, $or:[ { name: { $regex: search_query, $options: 'i' }, symbol: { $regex: search_query, $options: 'i' } } ] }).limit(100)
  } else if (search_all && type) {
    const quotes = await financeModule.getQueriedStocks(search_all)
    for (const quote of quotes) {
      stocks.push(await saveStock(quote))
    }
    stocks = stocks.filter(stock => stock.type == type)
  } else if (type) {
    stocks = await Stock.find({ type }).limit(100)
  } else if (search_query) {
    stocks = await Stock.find({ $or:[ { name: { $regex: search_query, $options: 'i' } },  { symbol: { $regex: search_query, $options: 'i' } } ] }).limit(100)
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