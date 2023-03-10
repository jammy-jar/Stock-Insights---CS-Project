import mongoose from 'mongoose'

// Create a schema, to define the layout of the stocks in the database.
const stockSchema = new mongoose.Schema({
    symbol: String, // Identifier for the stock (separate to the stocks primary id key).
    name: String, // Display name of the stock.
    price: Number, // Live regular market price for the stock.
    type: String, // Type of stock (Equity, Crypto, Index etc).
    data: Object, // Historical Data of the stock.
    projections: Array // Projected Data for the stock.
})

// Create the Stock model from the schema defined above.
const Stock = mongoose.model('Stock', stockSchema)

// Exports the Stock model for use in external files.
export default Stock;