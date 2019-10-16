import path from 'path';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import devConfig from '../../webpack.dev.config.js';

const cacheControl = require('express-cache-controller');

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cacheControl({
    maxAge: 31557600, // 1=1sec
  }),
);

const HTML_FILE = path.join(__dirname, 'dist', 'index.html');
const compiler = webpack(devConfig);

app.use(
  webpackDevMiddleware(compiler, {
    publicPath: devConfig.output.publicPath,
  }),
);

// Set robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /');
});

app.use(webpackHotMiddleware(compiler));

app.get('*', (req, res, next) => {
  compiler.outputFileSystem.readFile(HTML_FILE, (err, result) => {
    if (err) {
      return next(err);
    }
    res.set('content-type', 'text/html');
    res.send(result);
    res.end();
  });
});

// Stripe payment function
app.post('/payment', (req, res) => {
  const body = {
    source: req.body.token.id,
    amount: req.body.amount,
    currency: 'usd',
  };

  stripe.charges.create(body, (stripeErr, stripeRes) => {
    if (stripeErr) {
      res.status(500).send({ error: stripeErr });
    } else {
      res.status(200).send({ success: stripeRes });
    }
  });
});

// server fundamental
// app.get('*', (req, res) => {
//   res.sendFile(HTML_FILE);
// });

const PORT = process.env.PORT || 5000;
app.get('/service-worker.js', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'service-worker.js'));
});
app.listen(PORT, err => {
  if (err) throw err;
  console.log(`App listening to ${PORT}....`);
  console.log('Press Ctrl+C to quit.');
});
