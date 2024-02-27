const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  images: [String], // Массив путей к изображениям
  creationDate: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
