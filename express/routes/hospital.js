var express = require('express');
var router = express.Router();
var request = require("request");
var connection = require("./connection");
var multer  = require('multer')
var fs = require('fs');

router.use(multer({ dest: './uploads/'}));

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
		res.render("hospital", { hospital: hospital, title: hospital.name });
	});
});

router.post('/:hospital_id', function(req, res) {
	console.log(req.body);
	console.log(req.files);
	var photo = "";
	var photo_originalname = "";
	if (req.files.photo) {
		photo = req.files.photo.name;
		photo_originalname = req.files.photo.originalname;
	}
	connection.query("INSERT INTO hospitals.feedback (hospital_uid, ip, rating, comments, can_contact, contact_details, contact_name, photo, photo_originalname) VALUES (" +
		connection.escape(req.params.hospital_id) + ", " + 
		connection.escape(req.connection.remoteAddress) + ", " + 
		connection.escape(req.body.rating) + ", " + 
		connection.escape((req.body.comments)? req.body.comments : "" ) + ", " + 
		connection.escape((req.body.can_contact)? 1 : 0) + ", " + 
		connection.escape((req.body.contact_details)? req.body.contact_details : "" ) + ", " + 
		connection.escape((req.body.contact_name)? req.body.contact_name : "") + ", " + 
		connection.escape(photo) + ", " + 
		connection.escape(photo_originalname) + ")");
	res.render("thanks", { title: "Thanks for your submission" });
});

module.exports = router;
