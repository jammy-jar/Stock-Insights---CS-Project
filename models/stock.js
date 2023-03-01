// Import modules used in class.
import mongoose from 'mongoose'

const stockSchema = new mongoose.Schema({
    symbol: String,
    name: String,
    price: String,
    type: String,
    data: Object
})

const Stock = mongoose.model('Stock', stockSchema)

// Exports the stock model for use in external files.
export default Stock;