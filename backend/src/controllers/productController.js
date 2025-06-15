const { Product } = require('../models/mongo');

exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, supplier, minQty, maxQty, category } = req.query;
    const filter = {};
    if (supplier) filter.supplierId = supplier;
    if (category) filter.category = category;
    if (minQty || maxQty) filter.quantity = {};
    if (minQty) filter.quantity.$gte = Number(minQty);
    if (maxQty) filter.quantity.$lte = Number(maxQty);
    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Product.countDocuments(filter);
    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product', error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, category, supplierId, quantity, threshold, price } = req.body;
    const product = await Product.create({ name, category, supplierId, quantity, threshold, price });
    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, category, supplierId, quantity, threshold, price } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (name) product.name = name;
    if (category) product.category = category;
    if (supplierId) product.supplierId = supplierId;
    if (quantity !== undefined) product.quantity = quantity;
    if (threshold !== undefined) product.threshold = threshold;
    if (price !== undefined) product.price = price;
    await product.save();
    res.json({ message: 'Product updated', product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
}; 