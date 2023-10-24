

import { Sequelize } from 'sequelize'
import { sequelize_DB } from '../Config/env.config.js'
import initModels from './db/init-models.js';

const {DATABASE, USERNAME, PASSWORD, HOST, DIALECT, PORT} = sequelize_DB

const sequelize = new Sequelize(DATABASE, USERNAME, PASSWORD, {
     host: HOST,
     dialect: DIALECT,
     port: PORT
});


try {
     await sequelize.authenticate();
     console.log('Connection has been established successfully.');
} catch (error) {
     console.error('Unable to connect to the database:', error);
}


const query = initModels(sequelize)

export default query
