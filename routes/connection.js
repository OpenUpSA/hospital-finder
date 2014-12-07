var mysql = require("mysql");
var config = require("../config");
var pool = mysql.createPool(config.db_url);
pool.config.connectionLimit = 1;

module.exports = pool;
