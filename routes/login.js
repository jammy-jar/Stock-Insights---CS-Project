import express from 'express'
import bcrypt from 'bcrypt'
import session from 'express-session'
import User from '../models/user.js'

const router = express.Router();

const title = 'Login'

router.post('/', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username })
  const validPass = await bcrypt.compare(password, user.password)
  if (!validPass) {
    res.send('INCORRECT USERNAME OR PASSWORD!')
    return
  }
  req.session.user_id = user._id;
  res.redirect('/')
})

router.get('/', function(req, res, next) {
  res.render('login', { 
    title
  });
});

export default router;
