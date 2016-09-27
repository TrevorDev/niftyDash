import Sequelize = require("sequelize")
import config from "../libs/config"

var database = new Sequelize(config.database.connectionString);

export default database
