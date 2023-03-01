import mongoose from 'mongoose'

// Define schema for users
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
})

const User = mongoose.model('User', userSchema)

// Exports the stock model for use in external files.
export default User;