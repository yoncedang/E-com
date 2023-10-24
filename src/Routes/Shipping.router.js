


import express from "express"
import { new_ShippingAddress, edit_ShippingAddress, del_ShippingAddress, all_ShippingAddress } from "../Controller/Shipping/Shipping.Controller.js";
import { AuthVerifyUser } from "../Middleware/verifyToken.js";
const ShippingRouter = express.Router();



ShippingRouter.post("/new-address", AuthVerifyUser, new_ShippingAddress)
ShippingRouter.put("/edit", AuthVerifyUser, edit_ShippingAddress)
ShippingRouter.delete("/delete", AuthVerifyUser, del_ShippingAddress)
ShippingRouter.get("/list", AuthVerifyUser, all_ShippingAddress)



export default ShippingRouter