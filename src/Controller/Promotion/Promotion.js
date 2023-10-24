import { StripeClient } from "../../Config/env.config.js";
import Stripe from "stripe";
import { Response_General, Server_500 } from "../../Config/status.repsonse.js";
const stripe = new Stripe(StripeClient.SECRET_KEY);



const getPromotionCode = async (req, res) => {
    try {
        const promotionCode = await stripe.promotionCodes.list({
            active: true,
        });
        if (!promotionCode) return Response_General(res, 404, "Not found")
        const { data } = promotionCode

        const newData = data.map(items => ({
            code: items.code,
            percent_off: items.coupon.percent_off ? items.coupon.percent_off : "No percent off",
            coupon: items.coupon.amount_off ? items.coupon.amount_off : "No amount off",
            max_redemptions: items.max_redemptions ? items.max_redemptions : "No max redemptions",
            current_redemptions: items.times_redeemed,
            first_transaction: items.restrictions.first_time_transaction,
            minimum_amount: items.restrictions.minimum_amount,
            expires_at: items.expires_at ? new Date(items.expires_at * 1000) : "No expires",
        }))
        // console.log(data)
        return Response_General(res, 200, newData)
    } catch (error) {
        Server_500(res, error)
    }
}

export {
    getPromotionCode
}