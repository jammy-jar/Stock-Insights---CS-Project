import { deviation, mean, transpose, quantile, ascending } from 'd3';
import yahooFinance from 'yahoo-finance2';
import normSinv from './math.js';

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

const getStockStats = (lastPrice, data) => {
    const dailyStockChanges = []

    for (let i = 0; i < data.length; i++) {
        const curDayPrice = data[i].close;
        const prevDayPrice = i === 0 ? lastPrice : data[i - 1].close;
        dailyStockChanges.push((curDayPrice - prevDayPrice) / prevDayPrice);
    }

    return {
        mean: mean(dailyStockChanges),
        standardDeviation: deviation(dailyStockChanges)
    }
}

const projectStockPrice = (currPrice, meanDailyChange, stdDevDailyChange) => {
    const drift = meanDailyChange - (stdDevDailyChange * stdDevDailyChange) / 2;
    const randomShock = stdDevDailyChange * normSinv(Math.random());
    return currPrice * Math.exp(drift + randomShock);
}

const projectPrices = data => {
    const lastPrice = data[0].close;
    const lastDate = data[data.length - 1].date;
    data.shift();

    let { mean, standardDeviation } = getStockStats(lastPrice, data);
    const projections = []

    for (let i = 0; i < 1000; i++) {
        const projection = [];

        for (let j = 0; j < 365; j++) {
            const priorPrice = j === 0 ? data[data.length - 1].close : projection[j - 1].close;

            projection.push({
            date: new Date(lastDate.getTime() + 86400000 * j),
            close: projectStockPrice(
                priorPrice,
                mean,
                standardDeviation
            )
            });
        }

        projections.push(projection)
    }

    return projections;
}

const getQuantiles = (matrix, yAccessor, quantiles) => {
    const dates = matrix[0].map(day => day.date);

    const transposed = transpose(matrix).map(d =>
        d.map(dr => yAccessor(dr)).sort(ascending)
      );
    const quantilesArr = [];
    for (let i = 0; i < quantiles.length; i++) {
      const quantileNum = quantiles[i];
      const quantileData = transposed.map(day => quantile(day, quantileNum));
      const quantileArr = []
      quantileData.forEach((day, i) => quantileArr.push({ close: day, date: dates[i] }));

      quantilesArr.push(quantileArr)
    }
    return quantilesArr;
}

const financeModule = {
    getTrendingStocks,
    getQueriedStocks,
    getQuantiles,
    projectPrices
}

export default financeModule;