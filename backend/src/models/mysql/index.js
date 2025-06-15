const User = require('./User');
const Order = require('./Order');

// Associations (if needed)
Order.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Order, { foreignKey: 'userId' });

module.exports = {
  User,
  Order,
}; 