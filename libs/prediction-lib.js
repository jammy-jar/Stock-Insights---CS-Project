import * as tf from '@tensorflow/tfjs-node'
import { deviation, mean, transpose, quantile, ascending } from 'd3';
import normSinv from './math.js';
import Stock from '../models/stock.js'


function ComputeSMA(data, window_size)
{
  let r_avgs = [], avg_prev = 0;
  for (let i = 0; i <= data.length - window_size; i++){
    let curr_avg = 0.00, t = i + window_size;
    for (let k = i; k < t && k <= data.length; k++){
      curr_avg += data[k]['price'] / window_size;
    }
    r_avgs.push({ set: data.slice(i, i + window_size), avg: curr_avg });
    avg_prev = curr_avg;
  }
  return r_avgs;
}

async function trainModel(inputs, outputs, trainingsize, window_size, n_epochs, learning_rate, n_layers, callback){

    const input_layer_shape  = window_size;
    const input_layer_neurons = 100;
  
    const rnn_input_layer_features = 10;
    const rnn_input_layer_timesteps = input_layer_neurons / rnn_input_layer_features;
  
    const rnn_input_shape  = [rnn_input_layer_features, rnn_input_layer_timesteps];
    const rnn_output_neurons = 20;
  
    const rnn_batch_size = window_size;
  
    const output_layer_shape = rnn_output_neurons;
    const output_layer_neurons = 1;
  
    const model = tf.sequential();
  
    let X = inputs.slice(0, Math.floor(trainingsize / 100 * inputs.length));
    let Y = outputs.slice(0, Math.floor(trainingsize / 100 * outputs.length));
  
    const xs = tf.tensor2d(X, [X.length, X[0].length]).div(tf.scalar(10));
    const ys = tf.tensor2d(Y, [Y.length, 1]).reshape([Y.length, 1]).div(tf.scalar(10));
  
    model.add(tf.layers.dense({units: input_layer_neurons, inputShape: [input_layer_shape]}));
    model.add(tf.layers.reshape({targetShape: rnn_input_shape}));
  
    let lstm_cells = [];
    for (let index = 0; index < n_layers; index++) {
         lstm_cells.push(tf.layers.lstmCell({units: rnn_output_neurons}));
    }
  
    model.add(tf.layers.rnn({
      cell: lstm_cells,
      inputShape: rnn_input_shape,
      returnSequences: false
    }));
  
    model.add(tf.layers.dense({units: output_layer_neurons, inputShape: [output_layer_shape]}));
  
    model.compile({
      optimizer: tf.train.adam(learning_rate),
      loss: 'meanSquaredError'
    });
  
    const hist = await model.fit(xs, ys,
      { batchSize: rnn_batch_size, epochs: n_epochs, callbacks: {
        onEpochEnd: async (epoch, log) => {
          callback(epoch, log);
        }
      }
    });
  
    return { model: model, stats: hist };
}

// Get an object containing the mean and deviation of the data in the argument.
const getStockStats = (lastPrice, data) => {
  const dailyStockChanges = []

  for (let i = 0; i < data.length; i++) {
      const curDayPrice = data[i].close;
      const prevDayPrice = i === 0 ? lastPrice : data[i - 1].close;
      dailyStockChanges.push((curDayPrice - prevDayPrice) / prevDayPrice);
  }

  return {
      mean: mean(dailyStockChanges),
      standardDeviation: deviation(dailyStockChanges)
  }
}

const projectNextData = (currPrice, meanDailyChange, stdDevDailyChange) => {
  const drift = meanDailyChange - (stdDevDailyChange * stdDevDailyChange) / 2;
  const randomShock = stdDevDailyChange * normSinv(Math.random());
  return currPrice * Math.exp(drift + randomShock);
}

const projectPrices = data => {
  const lastPrice = data[0].close;
  const lastDate = data[data.length - 1].date;
  data.shift();

  let { mean, standardDeviation } = getStockStats(lastPrice, data);
  const projections = []

  for (let i = 0; i < 30; i++) {
      const projection = [];

      for (let j = 0; j < data.length; j++) {
          const priorPrice = j === 0 ? data[data.length - 1].close : projection[j - 1].close;

          projection.push({
          date: new Date(lastDate.getTime() + 86400000 * j),
          close: projectNextData(
              priorPrice,
              mean,
              standardDeviation
          )
          });
      }

      projections.push(projection)
  }

  return projections;
}

const getQuantiles = (matrix, yAccessor, quantiles) => {
  const dates = matrix[0].map(day => day.date);

  const transposed = transpose(matrix).map(d =>
      d.map(dr => yAccessor(dr)).sort(ascending)
    );
  const quantilesArr = [];
  for (let i = 0; i < quantiles.length; i++) {
    const quantileNum = quantiles[i];
    const quantileData = transposed.map(day => quantile(day, quantileNum));
    const quantileArr = []
    quantileData.forEach((day, i) => quantileArr.push({ close: day, date: dates[i] }));

    quantilesArr.push(quantileArr)
  }
  return quantilesArr;
}

// Use the Monte Carlo Method to, create projections for the stocks, based on last years trend,
// Return an array of projections at the 0.1, 0.25, 0.5, 0.75, and 0.9th quantiles.
const projectStocks = async (symbol) => {
  // Find the first (and only) stock in the database with the given symbol.
  const stock = await Stock.findOne({symbol})

  // Simulate 30 projections, using Geometric Brownian Motion for random projections,
  // with a trend.
  const projections = projectPrices(stock.data)

  // Break the projections down and get the corresponding quanitiles.
  const projectionQuantiles = getQuantiles(projections, d => d.close, [
    0.1,
    0.25,
    0.5,
    0.75,
    0.9
  ]);

  return projectionQuantiles;
}

export default {
  projectStocks,
}