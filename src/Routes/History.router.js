import { orderHistory } from "../Controller/Orderhistory/History.controller.js";
import { AuthVerifyUser } from "../Middleware/verifyToken.js";
import express from "express";
const routerHistory = express.Router();




routerHistory.get("/order-history", AuthVerifyUser, orderHistory);




export default routerHistory;