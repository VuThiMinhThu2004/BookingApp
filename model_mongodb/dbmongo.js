const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  rating:  { type: Number, required: true },
  idUser: { type: Number, required: true, unique: true},
  timestamp: { type: Date, default: Date.now }
});

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
