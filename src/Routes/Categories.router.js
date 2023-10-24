



import express from 'express'
import { create_categories, edit_Categories, All_categories, Del_categories, get_categoriesID } from '../Controller/Categories/Categories.controller.js';
import { AuthVerifyAdmin } from '../Middleware/verifyToken.js';

const CategoriesRouter = express.Router();



CategoriesRouter.post("/create", AuthVerifyAdmin, create_categories)
CategoriesRouter.get("/get-categories-id", get_categoriesID)
CategoriesRouter.put("/edit", AuthVerifyAdmin, edit_Categories)
CategoriesRouter.get("/all-categories", All_categories)
CategoriesRouter.delete("/delete", AuthVerifyAdmin, Del_categories)





export { CategoriesRouter }
