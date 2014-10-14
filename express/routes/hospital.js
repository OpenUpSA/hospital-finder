var express = require('express');
var router = express.Router();
var request = require("request");
var connection = require("./connection");

router.get('/:hospital_id', function(req, res) {
	var uid = req.params.hospital_id;
	connection.query( "SELECT * FROM hospitals.hospitals WHERE uid = " + connection.escape(uid),
	function(err, rows, fields) {
		if (err) {
			res.status(500).send("Database broken :(");
			console.log(err);
			return;
		}
		var hospital = rows[0];
		res.render("hospital", { hospital: hospital });
	});

});

module.exports = router;
