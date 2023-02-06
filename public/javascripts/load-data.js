import Stock from './stock.js'

let pageNum = 0;
const tableBody = document.querySelector("#stocksTable")

// Declare a function that iterates through the data and graphs the data for each stock.
const createPlot = (canvas, symbol, data) => {
    // Create a canvas context.
    const ctx = canvas.getContext('2d');

    // Set the line width for the plot.
    ctx.lineWidth = 3;

    // Check if the first data value is less than the final data value.
    // If its smaller the line is green to indicate there has been an increase in value over the past year,
    // And if its greater (or equal to) then its red to indicate that there has been a loss or no increase.
    if (data[0].close < data[data.length - 1].close) {
        ctx.strokeStyle = 'green';
    } else {
        ctx.strokeStyle = 'red';
    }

    // Set the scale for the plot.
    const xScale = canvas.width / data.length;
    const yScale = canvas.height / Math.max(...data.map(({close}) => close));

    // Begin a new path.
    ctx.beginPath();

    // Iterate through the data and draw the plot.
    for (let i = 0; i < data.length; i += 2) {
        const x = i * xScale;
        const y = canvas.height - data[i].close * yScale;
        ctx.lineTo(x, y);
    }

    // Stroke the path to draw the plot on the canvas.
    ctx.stroke();
}

const getStocks = (start, end) => {
    const selectStocks = []
    for (let i = start; i < end && i < stocks.length; i++) {
        let displayName;
        if (stocks[i].longName !== undefined) {
          displayName = stocks[i].longName;
        } else if (stocks[i].shortName !== undefined) {
          displayName = stocks[i].shortName;
        } else {
          displayName = stocks[i].symbol;
        }
        const stock = new Stock(stocks[i].symbol, displayName, stocks[i].regularMarketPrice)
    
        selectStocks.push(stock);
    }
    return selectStocks;
}

const listStocks = async pageNum => {
    const selectStocks = getStocks(pageNum*20, pageNum*20 + 20)
    for (const stock of selectStocks) {
        const row = tableBody.insertRow(-1)
        const plotCanvas = document.createElement("CANVAS");
        row.insertCell(0).append(stock.getSymbol())
        row.insertCell(1).append(stock.getName())
        row.insertCell(2).append(stock.getMarketPrice())
        row.insertCell(3)
        row.insertCell(4)
        row.insertCell(5).append(plotCanvas)

        if (await stock.getHistoricalData()) {
            createPlot(plotCanvas, stock.getSymbol(), await stock.getHistoricalData())
        }
    }
}
listStocks(pageNum);

addEventListener('scroll', evt => {
    if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
        pageNum++;
        listStocks(pageNum);
    }
})

