const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactInfo: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Supplier', SupplierSchema); 