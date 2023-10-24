

import { Op } from "sequelize";
import { OK_200, NotFound_404, Found_422, Server_500, Unauthorized_401, Forbiden_403, BadRequest, Response_General } from "../../Config/status.repsonse.js";
import query from "../../Model/Main.js";
import bcrypt from 'bcrypt'
import { SendLinkVerification, generateRandomCode, SendLinkRetsetPassword, Notifications } from "../../Middleware/nodeMailer.js";
import { TokenVerifyEmail, createAccessToken, createRefreshToken, decodedToken, verifyAccount, verifyRefreshToken } from "../../JWT/jwt.config.js";
import crypto from "crypto-js";
import { AuthVerifyToken, AuthVerifyAdmin } from "../../Middleware/verifyToken.js";
import { RedisClass } from "../../Redis/Redis.js";

const redis = new RedisClass()

const signup = async (req, res) => {
     try {
          const { email, password } = req.body;
          if (!email || !password) {
               return Response_General(res, 404, 'Please input email and password')
          }
          const checkEmail = await query.USER.findOne({
               where: { email }
          })
          if (checkEmail) {
               Response_General(res, 422, 'Email already exists !!!')
          }
          else {
               const code = generateRandomCode()
               const data = await query.USER.create({
                    email,
                    password: bcrypt.hashSync(password, 10),
               })
               redis.SET_REDIS(code, email)
               res.cookie("email", email, { maxAge: 3600000 * 24 })
               const token = TokenVerifyEmail({ email, code })
               SendLinkVerification(email, token, code) // Send email will send after 
               return OK_200(res, data, `Please check your Email: ${email} to verification`)

          }
     } catch (error) {
          Server_500(res, error.message)
     }
}

const verify_Email = async (req, res) => {
     try {
          const { token } = req.query;
          if (!token) {
               return Response_General(res, 404, 'Token verification must required')
          }
          await verifyAccount(token, async (err, value) => {
               if (err) return Unauthorized_401(res, err.message)
               const { email, code } = value.data
               const currentUSER = await query.USER.findOne({
                    where: { email }
               })
               if (!currentUSER) return Response_General(res, 404, 'User verification not found')
               if (currentUSER.activity === "online") {
                    return OK_200(res, 'Account already verification')
               }

               await currentUSER.update({
                    activity: "online",
                    isUpdated: true,
               })
               await redis.DEL_REDIS(code)
               Notifications(email)
               await res.clearCookie("email")
               return OK_200(res, 'Success: account verification success')
          })


     } catch (error) {
          Server_500(res, error.message)
     }
}

const verify_OTP = async (req, res) => {

     try {
          const { OTP } = req.body;
          if (!OTP) {
               return Response_General(res, 404, 'OTP must required to verification !!!')
          }
          const checkOTP = await redis.GET_REDIS(OTP)
          console.log(checkOTP)
          if (!checkOTP) return Response_General(res, 404, 'OTP not match')
          const checkUser = await query.USER.findOne({
               where: { email: checkOTP }
          })
          if (!checkUser) return Response_General(res, 404, 'User not found')
          if (checkUser.activity === "online") {
               return OK_200(res, 'Account already activated')
          }
          await checkUser.update({
               activity: "online",
               isUpdated: true,
          })
          await redis.DEL_REDIS(OTP)
          await res.clearCookie("email")
          return OK_200(res, 'Success: account verification success')


     } catch (error) {
          Server_500(res, error.message)
     }


}

const resend_verification = async (req, res) => {
     try {
          const { email } = req.cookies;
          if (!email) return Response_General(res, 404, 'Your verification is expired, please register again or contact admin')
          const mail = decodeURIComponent(email)
          const checkEmail = await query.USER.findOne({
               where: { email: mail }
          })
          if (!checkEmail) return Response_General(res, 404, 'Email not found')
          if (checkEmail.activity === "online") {
               return OK_200(res, 'Account already activated')
          }
          const code = generateRandomCode()
          const token = TokenVerifyEmail({ email: mail })
          await SendLinkVerification(mail, token, code)
          return OK_200(res, 'Resend success, please check email')
     } catch (error) {
          Server_500(res, error.message)
     }
}

const login = async (req, res) => {
     try {
          const { email, password } = req.body;
          if (!email || email.lenght === 0) return Response_General(res, 400, 'Please input email')
          if (!password || password.lenght === 0) return Response_General(res, 400, 'Please input password')

          const currentUser = await query.USER.findOne({
               where: { email }
          })
          if (currentUser.activity !== "online") return Response_General(res, 403, 'Please verification your account or contact admin')
          if (!currentUser) {
               return Response_General(res, 404, 'Email not match')
          }

          const comparePassword = bcrypt.compareSync(password, currentUser.password);
          if (!comparePassword) {
               return Response_General(res, 404, 'Password not match')
          }

          const accessToken = createAccessToken({ user_id: currentUser.user_id })
          const refreshToken = createRefreshToken({ user_id: currentUser.user_id })

          const hashToken = crypto.AES.encrypt(accessToken, process.env.CRYPTO_KEY).toString();
          await redis.REFRESH_TOKEN(currentUser.user_id, refreshToken)
          res.cookie("accessToken", hashToken)
          return OK_200(res, { user_id: currentUser.user_id }, 'Login success')


     } catch (error) {
          Server_500(res, error)
     }

}

const forgotPassword = async (req, res) => {

     try {
          const { email } = req.body;
          if (!email || email.lenght === 0) return Response_General(res, 400, 'Please input email')

          const checkEmail = await query.USER.findOne({ where: { email } })
          if (!checkEmail) return Response_General(res, 404, 'Account not found')

          const verification = TokenVerifyEmail({ user_id: checkEmail.user_id });

          SendLinkRetsetPassword(email, verification)
          return OK_200(res, checkEmail.email, 'Please check your email to reset password')

     } catch (error) {
          Server_500(res, error)
     }
}

const passRetset_Verify = async (req, res) => {

     try {
          const { token } = req.query;
          const { password } = req.body
          if (!password || password.lenght === 0) return Response_General(res, 400, 'Please input password')
          if (!token || token.lenght === 0) return Response_General(res, 400, "Token verification is required")
          await verifyAccount(token, async (err, value) => {
               if (err) return BadRequest(res, err.message)

               const { user_id } = value.data
               const currentUser = await query.USER.findOne({ where: { user_id } })
               if (!currentUser) return Response_General(res, 404, 'User not found')
               await currentUser.update({
                    password: bcrypt.hashSync(password, 10),
               })
               return OK_200(res, 'Update Password Success')
          })
     } catch (error) {
          Server_500(res, error.message)
     }
}


const reqToken = async (req, res) => {
     try {
          const { id } = req.query;
          if (!id || id.lenght === 0) return Response_General(res, 400, 'Id is required')
          const user_id = await redis.GET_REDIS(id)
          if (!user_id) return Response_General(res, 404, 'Please login to get access token')
          await verifyRefreshToken(user_id, async (err, value) => {
               if (err) return BadRequest(res, err.message)
               const { user_id } = value.data
               const checkUser = await query.USER.findOne({ where: { user_id } })
               if (!checkUser) return Response_General(res, 404, 'User not found')

               const accessToken = createAccessToken({ user_id: checkUser.user_id })
               const hashToken = crypto.AES.encrypt(accessToken, process.env.CRYPTO_KEY).toString();
               res.cookie("accessToken", hashToken)
               return Response_General(res, 200, 'Request access token success')
          })
     } catch (error) {
          Server_500(res, error)
     }
}

const logout = async (req, res) => {

     try {
          const { data } = req.user;
          console.log(data)
          const { user_id } = data;

          const checkUser = await query.USER.findOne({
               where: { user_id }
          })
          if (!checkUser) {
               return Response_General(res, 404, 'User not found')
          }
          await redis.DEL_REDIS(user_id)
          res.clearCookie("accessToken")
          return Response_General(res, 200, "Logout success")
     } catch (error) {
          Server_500(res, error)
     }


}

const getProfile = async (req, res) => {
     try {
          const { data } = req.user;
          const { user_id } = data;
          const checkUser = await query.USER.findOne({
               where: { user_id },
               attributes: { exclude: ['password'] }
          })
          if (!checkUser) {
               return Response_General(res, 404, 'User not found')
          }
          return OK_200(res, checkUser, 'Get profile success')
     } catch (error) {
          Server_500(res, error.message)
     }
}

const All_User = async (req, res) => {
     try {
          const { page } = req.query;
          if (!page || page.lenght === 0) return Response_General(res, 400, 'Page is required')
          const size = 15;
          const currentPage = parseInt(page);
          const offset = (currentPage - 1) * size;
          const totalUser = await query.USER.count({
               where: {
                    role: {
                         [Op.not]: 'admin'
                    }
               }
          });
          const totalPages = Math.ceil(totalUser / size);
          if (currentPage > totalPages) return Response_General(res, 404, 'Page not found')
          const checkUser = await query.USER.findAll({
               limit: size,
               offset: offset,
               where: { role: "user" },
               attributes: { exclude: ['password'] }
          })
          if (checkUser.length === 0) return Response_General(res, 404, 'Do not found any USER')
          const results = {
               totalUser,
               totalPages,
               currentPage,
               data: checkUser
          }
          return OK_200(res, results, 'Get profile success')
     } catch (error) {
          Server_500(res, error.message)
     }
}

const Profile_by_ID = async (req, res) => {
     try {
          const { id } = req.query;
          if (!id || id.lenght === 0) return Response_General(res, 400, 'Id is required')
          const checkUser = await query.USER.findOne({
               where: { user_id: id, role: "user" },
               attributes: { exclude: ['password'] }
          })
          if (!checkUser) return Response_General(res, 404, 'User not found')
          return OK_200(res, checkUser, 'Get profile success')
     } catch (error) {
          Server_500(res, error.message)
     }
}


export {
     signup,
     verify_Email,
     verify_OTP,
     login,
     forgotPassword,
     passRetset_Verify,
     reqToken,
     logout,
     resend_verification,
     getProfile,
     All_User,
     Profile_by_ID,
}



// https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Version=2.0.1&vnp_Command=pay&vnp_TmnCode=VV6SHL4S&vnp_Locale=vn&vnp_CurrCode=VND&vnp_TxnRef=191&vnp_OrderInfo=Payment:#191&vnp_Amount=102000000&vnp_ReturnUrl=http://localhost:8080/payment/callback&vnp_OrderType=other&vnp_IpAddr=127.0.0.1&vnp_CreateDate=20230818090813&vnp_SecureHash=e743188cdf5d66009f16e7277ef15a53468ee6a8038d5f2c85696222e0d10e85b21e5ac0cb0dfe0a947a2367ec9eebe80cfb49e6e8bf88d16bf841c6e3125433



// https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=1806000&vnp_Command=pay&vnp_CreateDate=20210801153333&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+%3A5&vnp_OrderType=other&vnp_ReturnUrl=https%3A%2F%2Fdomainmerchant.vn%2FReturnUrl&vnp_TmnCode=DEMOV210&vnp_TxnRef=5&vnp_Version=2.1.0&vnp_SecureHash=3e0d61a0c0534b2e36680b3f7277743e8784cc4e1d68fa7d276e79c23be7d6318d338b477910a27992f5057bb1582bd44bd82ae8009ffaf6d141219218625c42