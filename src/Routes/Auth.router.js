


import express from 'express'
import { signup, verify_Email, resend_verification, verify_OTP, login, forgotPassword, passRetset_Verify, reqToken, logout, getProfile, All_User, Profile_by_ID } from '../Controller/Auth/Auth.controller.js';
import { AuthVerifyToken, AuthVerifyAdmin } from '../Middleware/verifyToken.js';
const AuthRouter = express.Router();



AuthRouter.post("/signup", signup)
AuthRouter.get("/verification-email", verify_Email)
AuthRouter.post("/verification-otp", verify_OTP)
AuthRouter.get("/resend-verification", resend_verification)
AuthRouter.post("/login", login)
AuthRouter.post("/forgot-password", forgotPassword)
AuthRouter.put("/reset-password", passRetset_Verify)
AuthRouter.get("/request-accesstoken", reqToken)
AuthRouter.get("/profile", AuthVerifyToken, getProfile)
AuthRouter.post("/logout", AuthVerifyToken, logout)
AuthRouter.get("/all-user", AuthVerifyAdmin, All_User)
AuthRouter.get("/profile-by-ID", Profile_by_ID)









export {
     AuthRouter
}