


import express from 'express'
import { orderItems, success, cancel, getOrderPaid, getOrderPending, getOrderCancelled, searchOrderDate } from '../Controller/Order/Order.controller.js';
import { AuthVerifyUser, AuthVerifyAdmin } from '../Middleware/verifyToken.js';
const OrderRouter = express.Router();



OrderRouter.post("/make-order", AuthVerifyUser, orderItems)
OrderRouter.post("/success", success)
OrderRouter.post("/cancel", cancel)
OrderRouter.get("/list-paid", AuthVerifyAdmin, getOrderPaid)
OrderRouter.get("/list-pending", AuthVerifyAdmin, getOrderPending)
OrderRouter.get("/list-cancelled", AuthVerifyAdmin, getOrderCancelled)
OrderRouter.get("/search-date", AuthVerifyAdmin, searchOrderDate)


export default OrderRouter