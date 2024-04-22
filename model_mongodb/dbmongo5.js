const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  rating:  { type: Number, required: true },
  idUser: { type: Number, required: true, unique: true },
  // date_in: {type: Date, require: true},
  timestamp: { type: Date, default: Date.now }
});

const Rating5 = mongoose.model('Rating5', ratingSchema);

module.exports = Rating5;
