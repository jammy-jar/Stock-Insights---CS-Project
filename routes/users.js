import express from 'express'
import User from '../models/user.js'
import catchAsync from '../utils/catchAsync.js'
import passport from 'passport'
import { ExpressError } from '../utils/ExpressError.js';
import { body, validationResult } from 'express-validator';
import { isLoggedIn, isGuest } from '../libs/middleware.js';

const router = express.Router();

const title = 'Login'

// Return and render the template when a request is made to /register.
router.get('/register', (req, res, next) => {
  res.render('user/register', {
    title
  });
});

// When the registration form is posted, respond by making a new user, and registering
// the new user to the database.
// Use the register function which is added to the request object by the passport library.
router.post('/register', isGuest,
  body('username').isLength({
    min: 3,
    max: 20
  }).matches(/[a-z0-9]+/i).trim().escape()
    .withMessage('Username must be between 3 and 20 characters, and must be alphanumeric!'),
  body('email').isEmail().normalizeEmail().withMessage("Entered Email is invalid!"),
  body('password').isLength({
    min: 8,
  }).withMessage("Password must be greater than 8 characters."), 
  catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      throw new ExpressError(errors.array()[0].msg, 400)
    }
    const user = new User({ username, email })
    const registeredUser = await User.register(user, password)
    req.login(registeredUser, err => {
      if (err) { return next(err); }
    });
  } catch (e) {
    // If an error is thrown when registering the user, reload the page and 'flash' the error.
    req.flash('error', e.message)
    return res.redirect('register')
  }

  // Check if 'returnTo' is defined, if so, when it returns the user it returns them to the
  // 'returnTo' page, else it returns them to the base directory ('/').
  const redirectUrl = req.session.returnTo || '/';
  delete req.session.returnTo;
  req.flash('success', 'Your account has been created, and you are logged in!')
  res.redirect(redirectUrl);
}))

// Return and render the template when a request is made to /login.
router.get('/login', isGuest, (req, res, next) => {
  res.render('user/login', { 
    title
  });
});

// Authenticate if login info is valid, using the passport library's built in 'authenticate'
// function.
// If the an error occurs, it will flash, and it is set to redirect them to the login
// page upon failure.
router.post('/login', isGuest, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), async (req, res) => {
  // Check if 'returnTo' is defined, if so, when it returns the user it returns them to the
  // 'returnTo' page, else it returns them to the base directory ('/').
  const redirectUrl = req.session.returnTo || '/';
  delete req.session.returnTo;
  req.flash('success', 'You are now logged in!')
  res.redirect(redirectUrl);
})

// Log out a user when a request is made to '/logout'.
// Use the logout function which is added to the request object by the passport library.
router.get('/logout', isLoggedIn, catchAsync(async (req, res, next) => {
  req.logout(err => {
    if (err) { return next(err); }
    req.flash('success', 'You are now logged out!');
    res.redirect('/');
  });
}));

export default router;
