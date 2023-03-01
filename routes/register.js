import express from 'express';
import bcrypt from 'bcrypt'
import User from '../models/user.js'

const router = express.Router();

const title = 'Register'

router.post('/', async (req, res) => {
  const { username, email, password } = req.body;
  const hash = await bcrypt.hash(password, 12)
  const user = new User({
    username,
    email,
    password: hash
  })
  await user.save()
  req.session.user_id = user._id;
  res.redirect('/')
})

router.get('/', function(req, res, next) {
  res.render('register', {
    title
  });
});

export default router;
