var mysql = require("mysql");
var config = require("../config");
var connection = mysql.createConnection(config.db_url);

connection.connect(function(err) {
	if (err) {
		console.log(err);
		return;
	}
});

module.exports = connection;
