var express = require('express');
var router = express.Router();
var request = require("request");
var connection = require("./connection");
var multer  = require('multer')
var fs = require('fs');
var GoogleSpreadsheet = require("google-spreadsheet");
var config = require("../config");
var nodemailer = require('nodemailer');
var jade = require('jade');

router.use(multer({ dest: './uploads/'}));

var transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: config.email_user,
		pass: config.email_pass
	}
});

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
	connection.query( "SELECT * FROM hospitals.hospitals WHERE uid = " + connection.escape(req.params.hospital_id),
	function(err, rows, fields) {
		if (err) {
			res.status(500).send("Database broken :(");
			console.log(err);
			return;
		}
		var photo = "";
		var photo_originalname = "";
		if (req.files.photo) {
			photo = req.files.photo.name;
			photo_originalname = req.files.photo.originalname;
		}

		var data = {
			base_url: req.protocol + '://' + req.get('host'),
			ip_address: (req.connection.remoteAddress) ? req.connection.remoteAddress : (request.headers['X-Forwarded-For']) ? request.headers['X-Forwarded-For'] : "",
			hospital_id: req.params.hospital_id,
			rating: req.body.rating,
			comments: (req.body.comments)? req.body.comments : "",
			can_contact: (req.body.can_contact)? true : false,
			contact_details: (req.body.contact_details)? req.body.contact_details : "",
			contact_name: (req.body.contact_name)? req.body.contact_name : "",
			photo: photo,
			photo_originalname: photo_originalname,
			hospital_link: req.protocol + '://' + req.get('host') + "/hospital/" + req.params.hospital_id,
			photo_link: req.protocol + '://' + req.get('host') + "/" + photo,
			timestamp: new Date().toString('yyyy-MM-dd HH:mm:i'),
			hospital: rows[0],
		}
		// First save to Database
		connection.query("INSERT INTO hospitals.feedback (hospital_uid, ip, rating, comments, can_contact, contact_details, contact_name, photo, photo_originalname) VALUES (" +
			connection.escape(data.hospital_id) + ", " + 
			connection.escape(data.ip_address) + ", " + 
			connection.escape(data.rating) + ", " + 
			connection.escape(data.comments) + ", " + 
			connection.escape(data.can_contact) + ", " + 
			connection.escape(data.contact_details) + ", " + 
			connection.escape(data.contact_name) + ", " + 
			connection.escape(data.photo) + ", " + 
			connection.escape(data.photo_originalname) + ")", function(err) {
				if (err) { console.log(err); }
				// Save to Google Spreadsheet
				var my_sheet = new GoogleSpreadsheet('1BqmCL63QwL7RFPnzW9DQP_uPwRw4mr3Z7TqPl4LbOuQ');
				my_sheet.setAuth(config.google_email, config.google_pass, function(err) {
						my_sheet.getInfo( function( err, sheet_info ) {
							sheet_info.worksheets[0].addRow({ 
								timestamp: data.timestamp,
								ipaddress: data.ip_address,
								hospitaluid: data.hospital_id,
								rating: data.rating,
								comments: data.comments,
								cancontact: data.can_contact,
								contactdetails: data.contact_details,
								contactname: data.contact_name,
								photo: data.photo,
								photooriginalname: data.photo_originalname,
								hospitallink: data.hospital_link,
								photolink: data.photo_link,
							});
	    				});
	    			});
				// Send an email
				var mailBody = res.render("../views/email_update.jade", data, function(err, html) {
						var mailOptions = {
							from: config.email_from,
							to: config.email_to,
							subject: config.email_subject,
							html: html
						};
						transporter.sendMail(mailOptions, function(error, info){
							if(error) {
								console.log(error);
							} else {
								console.log('Message sent: ' + info.response);
							}
						});
					});
		});
	});
	res.render("thanks", { title: "Thanks for your submission" });
	
});

module.exports = router;
