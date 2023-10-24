


import { Server_500, NotFound_404, OK_200, Response_General } from "../../Config/status.repsonse.js";
import query from "../../Model/Main.js";
import { RedisClass } from "../../Redis/Redis.js";

const redis = new RedisClass()
const new_ShippingAddress = async (req, res) => {
     try {
          const { data } = req.user;
          const { user_id } = data

          const { fullname, phone, city, district, ward, address } = req.body
          if (!fullname || !phone || !city || !district || !ward || !address) return Response_General(res, 400, "All fields are required")
          const addNewAddess = await query.shipping.create({
               fullname,
               phone,
               city,
               district,
               ward,
               address,
               user_id
          })
          await redis.ADDRESS_REDIS(`address: ${addNewAddess.shipping_id}`, JSON.stringify(addNewAddess))
          return OK_200(res, addNewAddess, "Add new Address success")

     } catch (error) {
          Server_500(res, error)
     }

}

const edit_ShippingAddress = async (req, res) => {
     try {
          const { data } = req.user;
          const { user_id } = data
          const { id } = req.query
          if (!id) return NotFound_404(res, "Select an address to edit")

          const checkAddress = await query.shipping.findOne({
               where: { shipping_id: id, user_id }
          })
          if (!checkAddress) return NotFound_404(res, "Address not found")

          const { fullname, phone, city, district, ward, address } = req.body
          // At least one field is required
          if (!fullname && !phone && !city && !district && !ward && !address) return Response_General(res, 400, "At least one field is required")
          const updateAddress = await checkAddress.update({
               fullname,
               phone,
               city,
               district,
               ward,
               address
          })
          await redis.ADDRESS_REDIS(`address: ${updateAddress.shipping_id}`, JSON.stringify(updateAddress))
          return OK_200(res, updateAddress, "Update success")
     } catch (error) {
          Server_500(res, error)
     }

}

const del_ShippingAddress = async (req, res) => {
     try {
          const { data } = req.user;
          const { user_id } = data

          const { id } = req.query
          if (!id) {
               return Response_General(res, 400, "Select an address to Delete")
          }

          const checkAddress = await query.shipping.findOne({
               where: { shipping_id: id, user_id }
          })
          if (!checkAddress) return NotFound_404(res, "Address not found")

          await checkAddress.destroy()

          return OK_200(res, `Delete success`)
     } catch (error) {
          Server_500(res, error)
     }

}

const all_ShippingAddress = async (req, res) => {

     try {
          const { data } = req.user;
          const { user_id } = data

          const allAdress = await query.shipping.findAll({
               where: { user_id }
          })
          if (allAdress.length === 0) return NotFound_404(res, "Address is empty !!!")
          return OK_200(res, allAdress, "All address")

     } catch (error) {
          Server_500(res, error)
     }
}



export {
     new_ShippingAddress,
     edit_ShippingAddress,
     del_ShippingAddress,
     all_ShippingAddress
}