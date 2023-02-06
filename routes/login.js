import express from 'express';

const router = express.Router();

const title = 'Stock Predict'

/* GET login page. */
router.get('/', function(req, res, next) {
  res.render('login', { 
    title: title,
  });
});

export default router;
