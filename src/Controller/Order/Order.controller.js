



import { Server_500, NotFound_404, OK_200, Found_422, Response_General } from "../../Config/status.repsonse.js";
import query from "../../Model/Main.js";
import { updateQuantityProduct, OrderCheckout } from "./MiddleWare.js";
import Stripe from "stripe";
import { StripeClient } from "../../Config/env.config.js";
import moment from "moment";
import { Op } from "sequelize";
import { RedisClass } from "../../Redis/Redis.js";

const redis = new RedisClass()
const stripe = new Stripe(StripeClient.SECRET_KEY);


const orderItems = async (req, res) => {

     try {
          const { data } = req.user;
          const { user_id } = data;
          const currentUser = await query.USER.findByPk(user_id);

          if (!currentUser) return NotFound_404(res, "User not found");

          const checkout = await query.checkout.findOne({
               where: { user_id: currentUser.user_id }
          });

          if (!checkout) return NotFound_404(res, "User still not checkout - Please checkout first before order");

          const { note } = req.body;
          const { address_id, payment_id } = req.query;

          if (!address_id) return Response_General(res, 400, "Shipping id (Address) must required");
          if (!payment_id) return Response_General(res, 400, "Payment id must required");
          const checkAddress = await query.shipping.findOne({
               where: { shipping_id: address_id }
          })
          if (!checkAddress) return NotFound_404(res, "Address shipping not found")
          const checkPay_Methods = await query.payment_methods.findOne({
               where: { payment_id }
          })
          if (!checkPay_Methods) return NotFound_404(res, "Not found payment methods")

          const orderProduct = await query.ORDER.create({
               total: checkout.totalPrice,
               shipping_id: checkAddress.shipping_id,
               note,
               payment_id: checkPay_Methods.payment_id,
               user_order: checkout.user_id,
          });
          if (!orderProduct) return Response_General(res, 400, "Error creating order");
          const userCart = await query.cart.findAll({ where: { user_id } })

          if (!userCart || userCart.length === 0) return NotFound_404(res, "Cart is empty!!!");

          const session = await OrderCheckout(userCart, checkout);
          if (!session) return Response_General(res, 400, "Error creating session");
          await query.ORDER.update({
               session_id: session.id
          }, {
               where: { order_id: orderProduct.order_id, user_order: checkout.user_id }
          })
          const orderHistory = userCart.map(cartProduct => ({
               product_id: cartProduct.product_id,
               quantity: cartProduct.quantity,
               price: cartProduct.price,
               totalPrice: cartProduct.totalprice,
               user_id: cartProduct.user_id,
               status: "pending",
               session_id: session.id,
          }));
          await query.orderHistory.bulkCreate(
               orderHistory,
          );
          const card = {
               cardNumber: "4242 4242 4242 4242 || 5555 5555 5555 4444",
               cardExpMonth: "random <= 12",
               cardExpYear: "random => this year",
               cardCvc: "Any 3 digits",
          }
          return OK_200(res, { payment: session.url, id: session.id, card }, "Waiting for payment");

     } catch (error) {
          Server_500(res, error);
     }
};

const success = async (req, res) => {
     try {
          const { session_id } = req.query;
          if (session_id) {
               stripe.checkout.sessions.retrieve(session_id, async (err, session) => {
                    if (err) {
                         console.error(err);
                         return Response_General(res, 400, err.message);
                    }
                    const { payment_status, metadata } = session;
                    const { user_id } = metadata;
                    console.log(session)
                    if (payment_status === "paid") {
                         const checkOrder = await query.ORDER.findOne({
                              where: { session_id, user_order: user_id }
                         })
                         if (!checkOrder) return NotFound_404(res, "Order not found")
                         await checkOrder.update({ status: "completed" })

                         const checkOrderHistory = await query.orderHistory.findAll({
                              where: { session_id }
                         })
                         if (!checkOrderHistory || checkOrderHistory.length === 0) return NotFound_404(res, "Order history not found")
                         for (const history of checkOrderHistory) {
                              await history.update({ status: "completed" })
                         }
                         await query.cart.destroy({
                              where: { user_id }
                         });
                         await query.checkout.destroy({
                              where: { user_id }
                         });
                         await updateQuantityProduct(user_id)
                         return Response_General(res, 200, "Payment successfull")
                    }
                    console.log(session)
                    return Response_General(res, 400, "This transaction is not paid yet")
               });
          } else {
               return Response_General(res, 400, "Session id must required")
          }
     } catch (error) {
          Server_500(res, error);
     }
}

const cancel = async (req, res) => {
     try {
          const { session_id } = req.query;
          if (session_id) {
               stripe.checkout.sessions.retrieve(session_id, async (err, session) => {
                    if (err) {
                         console.error(err);
                         return Response_General(res, 400, err.message);
                    }
                    const { payment_status, metadata } = session;
                    const { user_id } = metadata;
                    if (payment_status === "unpaid") {
                         const checkOrder = await query.ORDER.findOne({
                              where: { session_id, user_order: user_id }
                         })
                         if (!checkOrder) return NotFound_404(res, "Order not found")
                         await checkOrder.update({ status: "cancelled" })

                         const checkOrderHistory = await query.orderHistory.findAll({
                              where: { session_id }
                         })
                         if (!checkOrderHistory || checkOrderHistory.length === 0) return NotFound_404(res, "Order history not found")
                         for (const history of checkOrderHistory) {
                              await history.update({ status: "cancelled" })
                         }
                         await query.cart.destroy({
                              where: { user_id }
                         });
                         await query.checkout.destroy({
                              where: { user_id }
                         });
                         return Response_General(res, 200, "Payment cancelled")
                    }
                    return Response_General(res, 400, "This transaction already paid")
               });
          } else {
               return Response_General(res, 400, "Session id must required")
          }
     } catch (error) {
          Server_500(res, error);
     }
}

const getOrderPaid = async (req, res) => {
     try {
          const completed = await query.ORDER.findAll({
               where: { status: "completed" }
          })
          if (!completed || completed.length === 0) return NotFound_404(res, "Order not found")
          const completedWithAddressShipping = await Promise.all(
               completed.map(async (address) => {
                    const addressShipping = await redis.GET_REDIS(`address: ${address.shipping_id}`);
                    const addressShippingParse = JSON.parse(addressShipping);

                    return {
                         ...address.get(),
                         addressShippingParse,
                    };
               })
          );
          return OK_200(res, completedWithAddressShipping, "Get orders Paid")

     } catch (error) {
          Server_500(res, error);
     }
}

const getOrderPending = async (req, res) => {
     try {
          const pending = await query.ORDER.findAll({
               where: { status: "pending" }
          })
          if (!pending || pending.length === 0) return NotFound_404(res, "Order not found")
          const completedWithAddressShipping = await Promise.all(
               pending.map(async (address) => {
                    const addressShipping = await redis.GET_REDIS(`address: ${address.shipping_id}`);
                    const addressShippingParse = JSON.parse(addressShipping);

                    return {
                         ...address.get(),
                         addressShippingParse,
                    };
               })
          );
          return OK_200(res, completedWithAddressShipping, "Get orders Pending")

     } catch (error) {
          Server_500(res, error);
     }
}

const getOrderCancelled = async (req, res) => {
     try {
          const cancelled = await query.ORDER.findAll({
               where: { status: "cancelled" }
          })
          if (!cancelled || cancelled.length === 0) return NotFound_404(res, "Order not found")
          const completedWithAddressShipping = await Promise.all(
               cancelled.map(async (address) => {
                    const addressShipping = await redis.GET_REDIS(`address: ${address.shipping_id}`);
                    const addressShippingParse = JSON.parse(addressShipping);

                    return {
                         ...address.get(),
                         addressShippingParse,
                    };
               })
          );
          return OK_200(res, completedWithAddressShipping, "Get orders Cancelled")

     } catch (error) {
          Server_500(res, error);
     }
}

const searchOrderDate = async (req, res) => {
     try {
          const { date } = req.query;
          if (!date) return Response_General(res, 400, "Date must required")
          if (!moment(date, 'YYYY-MM-DD', true).isValid()) return Found_422(res, "Date is invalid")
          const startDate = moment(date, 'YYYY-MM-DD').startOf('day');
          const endDate = moment(date, 'YYYY-MM-DD').add(1, 'days').endOf('day');

          const order = await query.ORDER.findAll({
               where: {
                    updatedAt: {
                         [Op.between]: [startDate.toDate(), endDate.toDate()],
                    },
               },
          });
          if (!order || order.length === 0) return NotFound_404(res, "Order not found")
          const completedWithAddressShipping = await Promise.all(
               order.map(async (address) => {
                    const addressShipping = await redis.GET_REDIS(`address: ${address.shipping_id}`);
                    const addressShippingParse = JSON.parse(addressShipping);

                    return {
                         ...address.get(),
                         addressShippingParse,
                    };
               })
          );
          return OK_200(res, completedWithAddressShipping, "Get orders by date")
     } catch (error) {
          Server_500(res, error);
     }
}

export {
     orderItems,
     success,
     cancel,
     getOrderPaid,
     getOrderPending,
     getOrderCancelled,
     searchOrderDate
}