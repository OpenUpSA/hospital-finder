var mysql = require("mysql");

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'c4sa_hospitals',
	password : 'RZaAS24MHes2rB9c'
});

connection.connect(function(err) {
	if (err) {
		console.log(err);
		return;
	}
});

module.exports = connection;