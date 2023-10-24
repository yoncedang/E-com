import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _Categories from  "./Categories.js";
import _ORDER from  "./ORDER.js";
import _Products from  "./Products.js";
import _USER from  "./USER.js";
import _cart from  "./cart.js";
import _checkout from  "./checkout.js";
import _orderHistory from  "./orderHistory.js";
import _payment_methods from  "./payment_methods.js";
import _shipping from  "./shipping.js";

export default function initModels(sequelize) {
  const Categories = _Categories.init(sequelize, DataTypes);
  const ORDER = _ORDER.init(sequelize, DataTypes);
  const Products = _Products.init(sequelize, DataTypes);
  const USER = _USER.init(sequelize, DataTypes);
  const cart = _cart.init(sequelize, DataTypes);
  const checkout = _checkout.init(sequelize, DataTypes);
  const orderHistory = _orderHistory.init(sequelize, DataTypes);
  const payment_methods = _payment_methods.init(sequelize, DataTypes);
  const shipping = _shipping.init(sequelize, DataTypes);

  Products.belongsTo(Categories, { as: "category", foreignKey: "category_id"});
  Categories.hasMany(Products, { as: "Products", foreignKey: "category_id"});
  cart.belongsTo(Products, { as: "product", foreignKey: "product_id"});
  Products.hasMany(cart, { as: "carts", foreignKey: "product_id"});
  orderHistory.belongsTo(Products, { as: "product", foreignKey: "product_id"});
  Products.hasMany(orderHistory, { as: "orderHistories", foreignKey: "product_id"});
  Products.belongsTo(USER, { as: "addByUser_USER", foreignKey: "addByUser"});
  USER.hasMany(Products, { as: "Products", foreignKey: "addByUser"});
  cart.belongsTo(USER, { as: "user", foreignKey: "user_id"});
  USER.hasMany(cart, { as: "carts", foreignKey: "user_id"});
  checkout.belongsTo(USER, { as: "user", foreignKey: "user_id"});
  USER.hasMany(checkout, { as: "checkouts", foreignKey: "user_id"});
  orderHistory.belongsTo(USER, { as: "user", foreignKey: "user_id"});
  USER.hasMany(orderHistory, { as: "orderHistories", foreignKey: "user_id"});
  shipping.belongsTo(USER, { as: "user", foreignKey: "user_id"});
  USER.hasMany(shipping, { as: "shippings", foreignKey: "user_id"});
  ORDER.belongsTo(payment_methods, { as: "payment", foreignKey: "payment_id"});
  payment_methods.hasMany(ORDER, { as: "ORDERs", foreignKey: "payment_id"});
  ORDER.belongsTo(shipping, { as: "shipping", foreignKey: "shipping_id"});
  shipping.hasMany(ORDER, { as: "ORDERs", foreignKey: "shipping_id"});

  return {
    Categories,
    ORDER,
    Products,
    USER,
    cart,
    checkout,
    orderHistory,
    payment_methods,
    shipping,
  };
}
