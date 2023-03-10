let pageNum = 0;
let fetching = false;

// Listen for when the user scrolls.
addEventListener('scroll', async evt => {
    if (fetching) {
        return;
    }

    // If user is at the bottom of the page, 
    // increment the 'page' number and list the next set of stocks.
    if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
        pageNum++;
        fetching = true;
        const stocks = await getStocks(pageNum);
        listStocks(stocks)
        fetching = false;
    }
})