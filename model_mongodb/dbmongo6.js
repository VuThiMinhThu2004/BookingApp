const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  rating:  { type: Number, required: true },
  idUser: { type: Number, required: true, unique: true },
  // date_in: {type: Date, require: true},
  timestamp: { type: Date, default: Date.now }
});

const Rating6 = mongoose.model('Rating6', ratingSchema);

module.exports = Rating6;
