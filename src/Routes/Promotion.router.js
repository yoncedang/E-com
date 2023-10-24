import express from 'express'
import { getPromotionCode } from '../Controller/Promotion/Promotion.js'


const PromotionRouter = express.Router();


PromotionRouter.get("/list", getPromotionCode)


export {
    PromotionRouter
}