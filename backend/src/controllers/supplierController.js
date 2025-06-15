const { Supplier } = require('../models/mongo');

exports.getAllSuppliers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const suppliers = await Supplier.find()
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Supplier.countDocuments();
    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      suppliers,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch suppliers', error: err.message });
  }
};

exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch supplier', error: err.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { name, contactInfo } = req.body;
    const supplier = await Supplier.create({ name, contactInfo });
    res.status(201).json({ message: 'Supplier created', supplier });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create supplier', error: err.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const { name, contactInfo } = req.body;
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    if (name) supplier.name = name;
    if (contactInfo) supplier.contactInfo = contactInfo;
    await supplier.save();
    res.json({ message: 'Supplier updated', supplier });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update supplier', error: err.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    await supplier.deleteOne();
    res.json({ message: 'Supplier deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete supplier', error: err.message });
  }
}; 