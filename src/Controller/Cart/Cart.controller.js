


import { Server_500, NotFound_404, OK_200, Response_General } from "../../Config/status.repsonse.js";
import query from "../../Model/Main.js";

const addProductCart = async (req, res) => {

     try {
          const { data } = req.user;
          const { user_id } = data;
          const { id } = req.query;
          const { quantity } = req.body

          if (!id) return Response_General(res, 400, "Product ID is required")
          if (quantity === undefined || quantity === null) return Response_General(res, 400, "Quantity is required")

          const currentUser = await query.USER.findOne({ where: { user_id } })
          if (!currentUser) return NotFound_404(res, "User not found")

          const checkProducts = await query.Products.findOne({ where: { product_id: id } })
          if (!checkProducts) return NotFound_404(res, "Products not found")
          if (checkProducts.quantity_stock <= 0) return NotFound_404(res, "SOLD OUT !!!")

          if (quantity > checkProducts.quantity_stock) return NotFound_404(res, `Not enough quantity --- MAX: ${checkProducts.quantity_stock} products`);
          const checkCart = await query.cart.findOne({ where: { product_id: id, user_id: currentUser.user_id } })

          if (!checkCart) {
               const checkInputQuantity = quantity ? quantity : 1
               const addProduct = await query.cart.create({
                    user_id: currentUser.user_id,
                    product_id: checkProducts.product_id,
                    name: checkProducts.product_name,
                    quantity: checkInputQuantity,
                    price: checkProducts.price,
                    totalprice: checkInputQuantity * checkProducts.price
               })
               return OK_200(res, addProduct, `Add success Product`)
          }
          if (quantity < 1) {
               await checkCart.destroy();
               return Response_General(res, 200, "Del success product from cart")
          }
          const updateProductCart = await checkCart.update({
               quantity,
               totalprice: quantity * checkProducts.price
          })
          return OK_200(res, updateProductCart, "Update success")



     } catch (error) {
          Server_500(res, error)
     }
}

const GETaddProductCart = async (req, res) => {

     try {
          const { data } = req.user;
          const { user_id } = data;

          const checkUser = await query.USER.findOne({
               where: { user_id }
          })
          if (!checkUser) return NotFound_404(res, "User not found")

          const results = await query.cart.findAll({
               include: [
                    "product",
               ],
               where: { user_id: checkUser.user_id },
          });
          if (results.length === 0) return NotFound_404(res, "Product cart is empty !!!")

          return OK_200(res, results, 'List product Cart')

     } catch (error) {
          Server_500(res, error)
     }

}

const delProductFromCart = async (req, res) => {

     try {
          const { id } = req.query
          const { data } = req.user;
          const { user_id } = data;

          if (!id) return Response_General(res, 400, "Product ID is required")

          const checkUser = await query.USER.findOne({
               where: { user_id }
          })

          if (!checkUser) return NotFound_404(res, "User not found")

          const productCart = await query.cart.findOne({
               where: { user_id: checkUser.user_id, cart_id: id }
          })
          if (!productCart) return NotFound_404(res, 'Product is empty !!!')

          await productCart.destroy()
          return Response_General(res, 200, 'Delete success from cart')

     } catch (error) {
          Server_500(res, error)
     }


}




export {
     addProductCart,
     GETaddProductCart,
     delProductFromCart,

}