var express = require('express');
var isNumeric = require("isnumeric");
var router = express.Router();
var connection = require("./connection");


/* GET home page. */
router.get('/', function(req, res) {
	lat = req.query.lat;
	lng= req.query.lng;
	if ((!lat) || (!lng)) {
		res.status(400).send("Parameters lat and lng required")
	}
	if (!isNumeric(lat) || (!isNumeric(lng))) {
		res.status(400).send("Parameters lat and lng must be numeric")
	}
	
	connection.query('SELECT uid, name, province, latitude, longitude, tel, cel, street_address, overall_performance, `emergency_unit-hours_per_day`, `emergency_unit-days_per_week`, classification, \
      111.045* DEGREES(ACOS(COS(RADIANS(latpoint)) \
                 * COS(RADIANS(latitude)) \
                 * COS(RADIANS(longpoint) - RADIANS(longitude)) \
                 + SIN(RADIANS(latpoint)) \
                 * SIN(RADIANS(latitude)))) AS distance_in_km \
 FROM hospitals.hospitals \
 JOIN ( \
     SELECT  ' + connection.escape(lat) + '  AS latpoint,  ' + connection.escape(lng) + ' AS longpoint \
   ) AS p \
 ORDER BY distance_in_km \
 LIMIT 15', function(err, rows, fields) {
		if (err) {
			res.status(500).send("Database broken :(");
			console.log(err);
			return;
		}
		res.json({ lat: lat, lng: lng, result: rows });
	});
	// connection.end();
});

module.exports = router;
