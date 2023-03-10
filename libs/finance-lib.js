import yahooFinance from 'yahoo-finance2';

// Returns an array of symbols of the top trending stocks in the US.
const getTrendingStocks = async () => {
    // Declares how many symbols are wanted, and languages of the symbols.
    // Then sends a GET request to the Yahoo Finance API for the top trending stocks in the US.
    const queryOptions = { count: 250, lang: 'en-US' };
    const results = await yahooFinance.trendingSymbols('US', queryOptions);

    const symbolsArr = results.quotes.map(({symbol}) => symbol);

    // Calls the getStocksQuotes function to get all stock data, for the trending symbols, then returns the data.
    return await yahooFinance.quote(symbolsArr, {}, { validateResult: false });
}

// Returns an array of symbols matching the search query.
const getQueriedStocks = async (query) => {
    // Then sends a GET request to the Yahoo Finance API for the queried stocks.
    const queryOptions = { quotesCount: 100 };
    const results = await yahooFinance.search(query, queryOptions);
  
    const symbolsArr = results.quotes.map(({symbol}) => symbol)
    if (symbolsArr.length == 0) {
        return []
    }

    // Calls the getStocksQuotes function to get all stock data, for the trending symbols, then returns the data.
    return await yahooFinance.quote(symbolsArr, {}, { validateResult: false });
}

const getStockQuotes = async (symbols) => {
    return await yahooFinance.quote(symbols, {}, { validateResult: false });
}

const financeModule = {
    getTrendingStocks,
    getQueriedStocks,
    getStockQuotes
}

export default financeModule;