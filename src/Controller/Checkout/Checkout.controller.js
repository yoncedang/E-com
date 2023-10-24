



import { Server_500, NotFound_404, Unauthorized_401, Forbiden_403, OK_200, Found_422, Response_General } from "../../Config/status.repsonse.js";
import query from "../../Model/Main.js";
import { RedisClass } from "../../Redis/Redis.js";


const redis = new RedisClass()

const checkCount = async (req, res) => {

     try {
          const { data } = req.user;
          const { user_id } = data
          const checkEmail = await query.USER.findOne({ where: { user_id } })

          if (!checkEmail) return NotFound_404(res, "User not found")

          const total = await query.cart.sum("totalPrice", {
               where: { user_id: checkEmail.user_id }
          })
          if (!total) return NotFound_404(res, "Cart is empty !!!")

          const checkUpdateDiscount = await query.checkout.findOne({
               where: { user_id: checkEmail.user_id }
          })
          const dataCheckout = {
               user_id: checkEmail.user_id,
               totalPrice: total,
          }

          if (!checkUpdateDiscount) {
               const checkOut = await query.checkout.create(
                    dataCheckout
               )
               return OK_200(res, checkOut, `Checkout success`)
          }
          const checkOut = await checkUpdateDiscount.update(
               dataCheckout
          )
          return OK_200(res, checkOut, `Checkout success`)

     } catch (error) {
          Server_500(res, error)
     }

};


const delCheckout = async (req, res) => {

     try {
          const { data } = req.user;
          const { user_id } = data;
          const checkEmail = await query.USER.findOne({ where: { user_id } })

          if (!checkEmail) return NotFound_404(res, "User not found")

          const checkDataCheckout = await query.checkout.findOne({
               where: { user_id: checkEmail.user_id }
          })
          if (!checkDataCheckout) return NotFound_404(res, "Checkout is empty !!!")
          await checkDataCheckout.destroy()
          return Response_General(res, 200, "Clear checkout success !!!")
     } catch (error) {
          Server_500(res, error)
     }
}


export {
     checkCount,
     delCheckout
}