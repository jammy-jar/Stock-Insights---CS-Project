// Define a function for validating if a user is logged in.
export const isLoggedIn = (req, res, next) => {
    // Use the 'isAuthenticated()' function to check if the user is logged in.
    if (req.isAuthenticated()) {
        // If the user is authenticated, just continue as usual
        return next();
    }

    // If the user is not logged in, it sets a return URL, 
    // for ease of access for the user.
    req.session.returnTo = req.originalUrl;

    // Flash an error when sent to the login page.
    req.flash('error', 'You must be signed in to do this!');

    return res.redirect('/login')
}

export const isGuest = (req, res, next) => {
    // Use the 'isAuthenticated()' function to check if the user is logged in.
    if (!req.isAuthenticated()) {
        // If the user is not yet authenticated, continue.
        return next()
    }

    // Flash an error when sent to the login page.
    req.flash('error', 'You are already signed in!')

    return res.redirect('/')
}