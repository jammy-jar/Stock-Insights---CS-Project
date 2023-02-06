// Import modules used in class.
import dataFetch from './data-fetch.js'

// Declare the Stock class.
class Stock {

    #symbol
    #name
    #marketPrice

    // Contructor to initialise the instance of the class.
    constructor(symbol, name, marketPrice) {
        // Assign attributes based on the parameters.
        this.#symbol = symbol;
        this.#name = name;
        this.#marketPrice = marketPrice;
    }

    // Declare a function to return the stocks symbol when called.
    getSymbol() {
        return this.#symbol
    }

    // Declare a function to return the stocks name when called.
    getName() {
        return this.#name
    }

    // Declare a function to return the stocks live regular market price.
    getMarketPrice() {
        return this.#marketPrice;
    }

    // Declare a function to return historical data from the stock when called.
    getHistoricalData() {
        // Fetch data from the JSON file and return.
        return dataFetch.readDataJson(this.#symbol);
    }
}

// Exports the stock class for use in external files.
export default Stock;