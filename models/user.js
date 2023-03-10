import mongoose from 'mongoose'
import passportLocalMongoose from 'passport-local-mongoose'

// Define schema for users.
const userSchema = new mongoose.Schema({
    // Email will be stored as a string, and is required, and must be unique.
    email: {
        type: String,
        required: true,
        unique: true
    },
    // Watchlist will be stored as an array of symbols (Strings).
    watchlist: {
        type: Array,
    }
})

// Apply the passport mongoose plugin (from the passport mongoose library) to the schema.
// This will allow using Passport functions on the user model, for easier management of
// users on the website.
userSchema.plugin(passportLocalMongoose)

// Create the User model from the schema defined above.
const User = mongoose.model('User', userSchema)

// Exports the User model for use in external files.
export default User;