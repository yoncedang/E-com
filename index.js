


import express from 'express'
import cors from 'cors'
import { AuthRouter } from './src/Routes/Auth.router.js'
import { CategoriesRouter } from './src/Routes/Categories.router.js'
import { RedisClass } from './src/Redis/Redis.js'
import { PromotionRouter } from './src/Routes/Promotion.router.js'
import MethodsRouter from './src/Routes/PaymentMethods.router.js'
import OrderRouter from './src/Routes/Order.router.js'
import ShippingRouter from './src/Routes/Shipping.router.js'
import checkoutRouter from './src/Routes/Checkout.router.js'
import cartRouter from './src/Routes/Cart.router.js'
import productsRouter from './src/Routes/Products.router.js'
import routerHistory from './src/Routes/History.router.js'
import cookieParser from 'cookie-parser'
import swaggerUI from "swagger-ui-express"
import YAML from "yaml"
import fs from "fs"
import path from 'path';

const redis = new RedisClass()
const file = fs.readFileSync(path.resolve("swagger.yaml"), "utf-8")
const swaggerDocument = YAML.parse(file)

const app = express()

app.use(express.static("."))
app.use(cors())
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", AuthRouter)
app.use("/api/categories", CategoriesRouter)
app.use("/api/product", productsRouter)
app.use("/api/cart", cartRouter)
app.use("/api/promotion", PromotionRouter)
app.use("/api/checkout", checkoutRouter)
app.use("/api/address", ShippingRouter)
app.use("/api/order", OrderRouter)
app.use("/api/payment-methods", MethodsRouter)
app.use("/api/history", routerHistory)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.listen(1234, async () => {
     await redis.connect()
     console.log("Connecting port 1234")
})