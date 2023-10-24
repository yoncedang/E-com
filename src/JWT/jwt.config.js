



import jwt from 'jsonwebtoken'




const createAccessToken = (data) => {
     return jwt.sign(
          { data },
          process.env.ACCESS_KEY,
          { expiresIn: "60s" }
     )
}
const createRefreshToken = (data) => {
     return jwt.sign(
          { data },
          process.env.REFRESH_KEY,
          { expiresIn: "31560000s" }
     )
}
const TokenVerifyEmail = (data) => {
     return jwt.sign(
          { data },
          process.env.ACCESS_KEY,
          { expiresIn: "1h" }
     )
}

const verifyAccount = (token, cb) => {
     return jwt.verify(
          token,
          process.env.ACCESS_KEY,
          cb
     )
}

const verifyRefreshToken = (token, cb) => {
     return jwt.verify(
          token,
          process.env.REFRESH_KEY,
          cb
     )
}

const decodedToken = (token) => {
     return jwt.decode(token)
}

export {
     TokenVerifyEmail,
     createAccessToken,
     createRefreshToken,
     decodedToken,
     verifyAccount,
     verifyRefreshToken
}