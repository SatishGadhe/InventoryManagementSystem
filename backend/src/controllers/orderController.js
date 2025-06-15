const { Order } = require('../models/mysql');
const{Product}=require('../models/mongo');

exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const orders = await Order.findAndCountAll({ offset: Number(offset), limit: Number(limit) });
    const ordersWithProductDetails=await Promise.all(orders.rows.map(async(order)=>{
      const product = await Product.findById(order.productId);
      return{
        ...order.toJSON(),
        products:product?[{productId:product._id,productName:product.name,quantity:order.quantity,price:product.price}]:[]
      }
    }))
    res.json({
      total: orders.count,
      page: Number(page),
      pages: Math.ceil(orders.count / limit),
      orders: ordersWithProductDetails,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const product = await Product.findById(order.productId);
    const orderWithProductDetails={
      ...order.toJSON(),
        products:product?[{productId:product._id,productName:product.name,quantity:order.quantity,price:product.price}]:[]
    }
    res.json(orderWithProductDetails)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order', error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { userId, productId, quantity, status, totalAmount, orderDate } = req.body;
    const order = await Order.create({ userId, productId, quantity, status, totalAmount, orderDate });
    res.status(201).json({ message: 'Order created', order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { quantity, status,productId,totalAmount, orderDate } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.quantity = quantity || order.quantity;
    order.status = status || order.status;
    order.productId=productId||order.productId;
    order.totalAmount=totalAmount||order.totalAmount
    order.orderDate=totalAmount||order.orderDate
    await order.save();
    res.json({ message: 'Order updated', order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order', error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await order.destroy();
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete order', error: err.message });
  }
}; 