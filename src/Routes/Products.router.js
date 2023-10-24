

import express from 'express';
import { All_Products, search_Products, edit_Products, del_Products, add_Products, get_Products_byID, getProductsByCategory } from '../Controller/Products/Products.controller.js';
import { AuthVerifyAdmin } from '../Middleware/verifyToken.js';
import multer from 'multer'

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })


const productsRouter = express.Router();


productsRouter.get("/all-products", All_Products)
productsRouter.get("/product-ID", get_Products_byID)
productsRouter.get("/categories-ID", getProductsByCategory)
productsRouter.get("/search", search_Products)
productsRouter.post("/add", AuthVerifyAdmin, upload.single("file"), add_Products)
productsRouter.put("/edit", AuthVerifyAdmin, upload.single("file"), edit_Products)
productsRouter.delete("/delete", AuthVerifyAdmin, del_Products)



export default productsRouter