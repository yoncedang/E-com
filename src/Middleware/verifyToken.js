import { NotFound_404, Server_500, Unauthorized_401, Response_General } from "../Config/status.repsonse.js"
import CryptoJS from "crypto-js";
import { verifyAccount } from "../JWT/jwt.config.js";
import query from "../Model/Main.js";


const AuthVerifyToken = (req, res, next) => {

     try {
          const { accessToken } = req.cookies;
          if (!accessToken) {
               return Response_General(res, 400, 'AccessToken is required')
          }
          const decryptToken = CryptoJS.AES.decrypt(accessToken, process.env.CRYPTO_KEY).toString(CryptoJS.enc.Utf8);
          verifyAccount(decryptToken, (err, user) => {
               if (err) return Response_General(res, 400, err.message)
               req.user = user
               next()
               // console.log(user)
          })

     } catch (error) {
          Server_500(res, error.message)
     }
}


const AuthVerifyAdmin = (req, res, next) => {

     try {
          AuthVerifyToken(req, res, async () => {

               const { data } = req.user;
               const { user_id } = data;

               const checkRole = await query.USER.findOne({
                    where: { user_id }
               })
               if (!checkRole) return Response_General(res, 404, 'User not found')
               if (checkRole.role !== "admin") return Unauthorized_401(res, 'You are not admin')
               return next()
          })
     } catch (error) {
          Server_500(res, error)
     }
}

const AuthVerifyUser = (req, res, next) => {

     try {
          AuthVerifyToken(req, res, async () => {

               const { data } = req.user;
               const { user_id } = data;

               const checkRole = await query.USER.findOne({
                    where: { user_id }
               })
               if (!checkRole) {
                    return NotFound_404(res, 'User not found')
               }
               if (checkRole.role !== "user") return Unauthorized_401(res, 'You are not user')
               return next()

          })
     } catch (error) {
          Server_500(res, error)
     }
}



export {
     AuthVerifyToken,
     AuthVerifyAdmin,
     AuthVerifyUser
}