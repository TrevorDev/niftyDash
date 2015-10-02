import Sequelize from "sequelize";
import config from "../libs/config"

var database = new Sequelize(config.database.connectionString);

export default database
