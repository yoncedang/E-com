

import dotenv from "dotenv";
dotenv.config();


const sequelize_DB = {
     DATABASE: process.env.SEQUELIZE_DATABASE,
     USERNAME: process.env.SEQUELIZE_USER,
     PASSWORD: process.env.SEQUELIZE_PASSWORD,
     HOST: process.env.SEQUELIZE_HOST,
     DIALECT: process.env.SEQUELIZE_DIALECT,
     PORT: 3306,
}

const RedisClient = {
     host: process.env.REDIS_HOST,
     port: process.env.REDIS_PORT,
     password: process.env.REDIS_PASSWORD,

}

const StripeClient = {
     SECRET_KEY: process.env.STRIPE_SECRET_KEY
}

const ADDRESS = {
     PORT: process.env.IP_ADDRESS,
}

export {
     sequelize_DB,
     RedisClient,
     StripeClient,
     ADDRESS
}