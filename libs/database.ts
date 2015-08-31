import Sequelize from "sequelize";
var database = new Sequelize('postgres://docker:docker@dashnifty.cloudapp.net:5432/niftyDash');

export default database
