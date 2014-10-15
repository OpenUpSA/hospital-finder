var express = require('express');
var router = express.Router();
var request = require("request");
var connection = require("./connection");
var multer  = require('multer')
var fs = require('fs');
var GoogleSpreadsheet = require("google-spreadsheet");
var config = require("../config");

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
		connection.escape(photo_originalname) + ")", function(err) {
			if (err) { console.log(err); }
			var my_sheet = new GoogleSpreadsheet('1BqmCL63QwL7RFPnzW9DQP_uPwRw4mr3Z7TqPl4LbOuQ');
			my_sheet.setAuth(config.google_email, config.google_pass, function(err) {
					my_sheet.getInfo( function( err, sheet_info ) {
						console.log( sheet_info.worksheets[0] );
						// use worksheet object if you want to forget about ids
						sheet_info.worksheets[0].addRow({ 
							timestamp: new Date().toString('yyyy-MM-dd HH:mm:i'),
							ipaddress: req.connection.remoteAddress,
							hospitaluid: req.params.hospital_id,
							rating: req.body.rating,
							comments: req.body.comments,
							cancontact: req.body.can_contact,
							contactdetails: req.body.contact_details,
							contactname: req.body.contact_name,
							photo: photo,
							photooriginalname: photo_originalname,
							hospitallink: req.protocol + '://' + req.get('host') + "/hospital/" + req.params.hospital_id,
							photolink: req.protocol + '://' + req.get('host') + "/" + photo,
						});
    				});
    			});


			res.render("thanks", { title: "Thanks for your submission" });
	});
	
});

module.exports = router;
