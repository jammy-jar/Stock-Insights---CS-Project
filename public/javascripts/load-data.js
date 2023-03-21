const tableBody = document.querySelector("#stocksTable")

const runClickable = () => {
    // jQuery executed when a element with class 'clickable-row' is clicked,
    // and sets the users window location './{Stock Symbol}'.
    jQuery(document).ready(function($) {
        $(".clickable-row").click(function() {
            window.location = $(this).data('href');
        });
    });
}

// Function displays stocks in the table on the index page.
const listStocks = stocks => {    
    // Iterate through the selected stocks.
    for (const stock of stocks) {
        // Create a new row, with the 'clickable-row' class, 
        // and a data-href of the stocks symbol.
        const row = tableBody.insertRow(-1)
        row.classList.add('clickable-row', 'align-middle')
        $(row).attr('data-href', stock.symbol);

        // Create a new canvas element, and plot the data with the 'createIndexPlot' function.
        const plotCanvas = document.createElement("CANVAS");
        plotCanvas.style.blockSize = '4em';
        createIndexPlot(plotCanvas, stock.symbol, stock.data)

        // Insert cells with the stock's data.
        const rowHeader = document.createElement('th')
        rowHeader.setAttribute('scope', 'row')
        rowHeader.append(stock.symbol)

        const price = stock.price > 1000 ? Math.round(stock.price) : stock.price.toPrecision(4);

        row.append(rowHeader)
        row.insertCell(1).append(stock.name)
        row.insertCell(2).append(price)
        row.insertCell(3)
        row.insertCell(4)
        row.insertCell(5).append(plotCanvas)
    }

    runClickable();
}

// Function displays stocks in the table on the watchlist page.
const listWatchedStocks = stocks => {

    // Iterate through the selected stocks.
    for (const stock of stocks) {
        // Create a new row, with the 'clickable-row' class, 
        // and a data-href of the stocks symbol.
        const row = tableBody.insertRow(-1)
        row.classList.add('clickable-row', 'align-middle')
        $(row).attr('data-href', stock.symbol);

        // Calculate the percentage change for the stock, by comparing the value when it was
        // first watched, to the value now.
        let percentageChange;
        user.watchlist.forEach(item => {
            if (item[0] == stock.symbol) {
                percentageChange = (100 * ((stock.price / item[2]) - 1)).toPrecision(2) + '%';
            }
        }) 

        // Create a form, with a button.
        // Add a name attribute to the button, along with a value attribute, this is to fetch
        // information from the button via the server-side watchlist route when posted.
        const button = document.createElement('button')
        const form = document.createElement('form')
        button.classList.add('btn', 'btn-primary')
        button.setAttribute('name', 'stockSymbol')
        button.setAttribute('value', stock.symbol)
        button.append('Remove')

        // Add an action attribute, and a method attribute, to tell the form to POST to
        // 'watchlist/remove' when submitted.
        form.setAttribute('action', '/watchlist/remove')
        form.setAttribute('method', 'POST')

        // Add the button to the form.
        form.append(button)

        // Insert cells with the stock's data, and the 'remove' button/ form.
        // Insert cells with the stock's data.
        const rowHeader = document.createElement('th')
        rowHeader.setAttribute('scope', 'row')
        rowHeader.append(stock.symbol)

        const price = stock.price > 1 ? Math.round(stock.price) : stock.price.toPrecision(2);

        row.append(rowHeader)
        row.insertCell(1).append(stock.name)
        row.insertCell(2).append(price)
        row.insertCell(3)
        row.insertCell(4)
        row.insertCell(5).append(percentageChange)
        row.insertCell(6).append(form)
    }

    runClickable();
}

const getStocks = async () => {
    let res;
    if (window.location.search) {
        res = await fetch(
            `/list${window.location.search}&pageNum=${pageNum}`
            );
    } else {
        res = await fetch(`/list?pageNum=${pageNum}`);
    }
    return await res.json();
}
