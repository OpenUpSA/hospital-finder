var express = require('express');
var router = express.Router();
var request = require("request");

router.get('/', function(req, res) {
	var address = req.query.address;
	var url = "http://wards.code4sa.org/?address=" + address;
	request(url, function(err, response, body){
		if (err) {
			res.status(500).send("Error fetching address");
			console.log(err);
			return;
		}
        var result = JSON.parse(body);
        res.json(result[0]);
    });
});

module.exports = router;
