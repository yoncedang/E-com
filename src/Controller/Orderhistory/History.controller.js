import { Server_500, NotFound_404, OK_200, Found_422, Response_General } from "../../Config/status.repsonse.js";
import query from "../../Model/Main.js";
import { RedisClass } from "../../Redis/Redis.js";


const redis = new RedisClass()
const orderHistory = async (req, res) => {
    try {
        const { data } = req.user;
        const { user_id } = data;
        const currentUser = await query.USER.findByPk(user_id);

        if (!currentUser) return NotFound_404(res, "User not found");

        const orderHistory = await query.orderHistory.findAll({
            where: { user_id },

            include: [
                {
                    model: query.Products,
                    as: "product",
                    attributes: ["product_id", "product_name", "desc", "price", "category_id"],
                    include: [
                        {
                            model: query.Categories,
                            as: "category",
                            attributes: ["category_id", "category_name"]
                        }
                    ]
                }
            ]
        })
        if (!orderHistory || orderHistory.length === 0) return NotFound_404(res, "Order history is empty!!!")
        // for (const address of orderHistory) {
        //     const addressShipping = await redis.GET_REDIS(`address: ${address.shipping_id}`)
        //     const addressShippingParse = JSON.parse(addressShipping)
        //     orderHistory.push(addressShippingParse)
        // }

        return OK_200(res, orderHistory)
    } catch (error) {
        Server_500(res, error)
    }
}

export {
    orderHistory
}