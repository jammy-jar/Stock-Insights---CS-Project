// Imports yahoo finance module.
const yahooFinance = require('yahoo-finance2').default;

// Imports my math library.
const math = require('./math')

// function transpose(matrix) {
//     const rows = matrix.length;
//     const cols = matrix[0].length;
//     const transposed = [];
//     for (let i = 0; i < cols; i++) {
//       const row = [];
//       for (let j = 0; j < rows; j++) {
//         row.push({
//           close: matrix[j][i].close,
//           date: matrix[j][i].date
//         });
//       }
//       transposed.push(row);
//     }
//     return transposed;
// }

// function quantile(array, quantile) {
//     const values = array.map(day => day.close);

//     values.sort((a, b) => a - b);
//     const index = (quantile * (values.length - 1)) + 1;
//     if (Math.floor(index) === index) {
//         return values.map((close, i) => ({
//             close: values,
//             date: values[0].date,
//         }));
//     } else {
//         const integer = Math.floor(index);
//         const fraction = index - integer;
//         return { 
//             close: values[integer] + (fraction * (values[integer + 1] - values[integer])),
//             date: array[0].date,
//         };
//     }
// }

// Takes in an array of symbols as a parameter and returns the quote summary for the specified symbol.
// Runs function asyncronously.
const getStocksQuotes = async symbols => {

    // Declares the desired fields from the 'quote' function.
    const fields = ['regularMarketPrice', 'displayName', 'symbol'];
    const results = [];

    // Iterates over the symbols, and adds the quote summaries to the results array.
    for (let symbol of symbols) {

        // Sends a GET request Yahoo Finance API to get a quote summary, 
        // and pushes returned value to results array.
        let result = await yahooFinance.quoteCombine(symbol, { fields });
        results.push(result);
    }

    return results;
}

// Returns an array of symbols of the 50 top trending stocks in the US.
const getTrendingStocks = async () => {

    // Declares how many symbols are wanted, and languages of the symbols.
    // Then sends a GET request to the Yahoo Finance API for the top 50 trending stocks in the US.
    const queryOptions = { count: 50, lang: 'en-US' };
    symbols = await yahooFinance.trendingSymbols('US', queryOptions);

    // Iterates over the symbols and adds the symbols to an array.
    symbolsArr = [];
    symbols.quotes.forEach(quote => {
        symbolsArr.push(quote.symbol)
    })

    // Calls the getStocksQuotes function to get all stock data, for the trending symbols, then returns the data.
    return await getStocksQuotes(symbolsArr);
}

const getStockStats = data => {
    let dailyStockChanges = []
    const lastPrice = data[data.length - 1].close;

    for (let i = 0; i < data.length; i++) {
        const curDayPrice = data[i].close;
        const prevDayPrice = i === 0 ? lastPrice : data[i - 1].close;
        dailyStockChanges.push((curDayPrice - prevDayPrice) / prevDayPrice);
    }

    let sum = dailyStockChanges.reduce((total, change) => total + change, 0);
    let mean = sum / dailyStockChanges.length;

    // Calculates the sum of the squared differences from the mean.
    let squareDiffSum = dailyStockChanges.reduce((sum, change) => sum + (change - mean) ** 2, 0)

    // Calculates the standard deviation.
    let standardDeviation = Math.sqrt(squareDiffSum / (dailyStockChanges.length - 1))

    return {
        mean,
        standardDeviation
    };
}

function projectStockPrice(currPrice, meanDailyChange, stdDevDailyChange) {
    const drift = meanDailyChange - (stdDevDailyChange * stdDevDailyChange) / 2;
    const randomShock = stdDevDailyChange * math.normSinv(Math.random());
    return currPrice * Math.exp(drift + randomShock);
}

function projectPrices(data) {
    const lastPrice = data[data.length - 1].close;
    const lastDate = data[data.length - 1].date;

    const projection = [];
    let { mean, standardDeviation } = getStockStats(data);

    for (let i = 0; i < 365; i++) {
        const priorPrice = i === 0 ? lastPrice : projection[i - 1].close;

        projection.push({
        date: new Date(lastDate.getTime() + 86400000 * i),
        close: projectStockPrice(
            priorPrice,
            mean,
            standardDeviation
        )
        });
    }

    return projection;
}

function getQuantiles(matrix, yAccessor, quantiles) {
    const transposed = transpose(matrix).map(d =>
        d.map(dr => yAccessor(dr)).sort('ascending')
      );
    const quantileData = [];
    for (let i = 0; i < quantiles.length; i++) {
      const quantileNum = quantiles[i];
      quantileData.push(transposed.map(day => quantile(day, quantileNum)));
    }
    return quantileData;
}

module.exports = {
    getTrendingStocks,
    getQuantiles,
    projectPrices
}