import yahooFinance from 'yahoo-finance2'
import Stock from '../models/stock.js'
import prediction from './prediction-lib.js';

const saveStock = async (quote) => {
  const regularMarketTime = quote.regularMarketTime;
  const regularMarketDate = new Date(regularMarketTime.getFullYear(), regularMarketTime.getMonth(), regularMarketTime.getDate())

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
    const data = await yahooFinance.historical(quote.symbol, { period1: dateLastYear });

    // Get projection quantiles.
    const projections = await prediction.projectStocks(data);

    // Create a new stock object.
    stockDbObject = new Stock({
        symbol: quote.symbol,
        name: displayName,
        price: quote.regularMarketPrice,
        type: quote.quoteType,
        data,
        projections
    })
  } else if (stockDbObject.data[stockDbObject.data.length - 1].date < regularMarketDate) {
    // Get the date of the last time data was updated but not recorded.
    const lastUnrecordedData = new Date(stockDbObject.data[stockDbObject.data.length - 1].date.valueOf() + 86400000)

    if (lastUnrecordedData > new Date()) {
      return
    }

    console.log('Fetching historical data for: ' + stockDbObject.symbol)

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

    // Update stock projections
    stockDbObject.projections = await prediction.projectStocks(stockDbObject.data)
  }
  else {
    // Update the regular market price to reflect up to date price which is constantly updating.
    stockDbObject.price = quote.regularMarketPrice
  }

  // Save any changes.
  await stockDbObject.save()

  return stockDbObject
}

  const dataHandler = {
    saveStock,
  }

  export default dataHandler