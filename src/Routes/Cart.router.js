



import express from 'express'
import { AuthVerifyUser } from '../Middleware/verifyToken.js';
import { addProductCart, GETaddProductCart, delProductFromCart } from '../Controller/Cart/Cart.controller.js';


const cartRouter = express.Router();


cartRouter.post("/addcart", AuthVerifyUser, addProductCart)
cartRouter.get("/listcart", AuthVerifyUser, GETaddProductCart)
cartRouter.delete("/delete", AuthVerifyUser, delProductFromCart)







export default cartRouter