import { NotFound_404, Server_500 } from "../../Config/status.repsonse.js"
import query from "../../Model/Main.js"
import Stripe from "stripe";
import { StripeClient } from "../../Config/env.config.js";

const stripe = new Stripe(StripeClient.SECRET_KEY);


const updateQuantityProduct = async (user_id) => {
     try {
          const checkHistory = await query.orderHistory.findAll({
               where: { user_id, isProductUpdate: false }
          })

          if (!checkHistory || checkHistory.length === 0) {
               throw new Error("Not found");
          }

          for (const historyItem of checkHistory) {
               const product = await query.Products.findOne({
                    where: { product_id: historyItem.product_id }
               });
               if (!product || product.quantity_stock < historyItem.quantity) {
                    throw new Error("Product not found or SOLD OUT");
               }

               await product.update({
                    quantity_stock: product.quantity_stock - historyItem.quantity,
               });
               await historyItem.update({
                    isProductUpdate: true
               })
          }
     } catch (error) {
          console.log(error.message);
     }
}

const OrderCheckout = async (cart, checkout) => {

     try {

          const session = await stripe.checkout.sessions.create({
               payment_method_types: ['card'],
               line_items: cart.map(item => ({
                    price_data: {
                         currency: 'vnd',
                         product_data: {
                              name: item.name,
                         },
                         unit_amount: item.price
                    },
                    quantity: item.quantity,
               })),
               allow_promotion_codes: true,
               mode: 'payment',
               success_url: "http://localhost:1234/api/order/success",
               cancel_url: 'http://localhost:1234/api/order/cancel',
               metadata: {
                    user_id: checkout.user_id,
               }
          })
          const session_id = session.id;

          // 3. Sử dụng session_id để lấy thông tin về PaymentIntent
          const paymentIntent = await stripe.checkout.sessions.listLineItems(session_id);
          console.log(paymentIntent)
          console.log(session)
          return session;
     } catch (error) {
          console.log(error.message)
     }

}



export {
     updateQuantityProduct,
     OrderCheckout
}

