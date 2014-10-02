function showLoading() {
	console.log("Show loading");
	$("#finding_location").show();
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getLocationResult);
    } else {
    	$("#finding_location").hide();
        console.log("Geolocation not supported")
    }
}

function getLocationResult(position) {
	showPosition(position.coords.latitude, position.coords.longitude);
	var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+position.coords.latitude+","+position.coords.longitude+"&key=AIzaSyDE9USWolKfcLaICyby4HvdnSVDDQbA7X8"
	$.get(url, function(data) {
		// console.log(data);
		if (data.status=="OK") {
			$("#address").val(data.results[0].formatted_address);
		}
	});
	$("#finding_location").hide();
}

function showPosition(lat, lng) {
	$("#hospitals").html("").append("<div class='list-group'></div>");
	var container = $("#hospitals > div");
	container.html("");
	var hospital_template = Handlebars.compile($("#hospital-template").html());
	$.get("/find", {lat: lat, lng: lng }, function(data) {
		$.each(data.result, function(id, hospital) {
			// console.log(hospital);
			hospital.distance = hospital.distance_in_km.toFixed(1);
			
			container.append(hospital_template(hospital));
		});
		// console.log(data);
	});
	// console.log("Latitude: " + position.coords.latitude + "Longitude: " + position.coords.longitude);
}

showLoading();
$("#finding_location").hide();

$("#btn_search").click(function() {
	$("#finding_location").show();
	console.log("Clicked Search");
	var address = $("#address").val();
	$.get("/address", { address: address }, function(data) {
		showPosition(data.coords[0], data.coords[1]);
		$("#address").val(data.address);
		$("#finding_location").hide();
	});
});

$("#btn_location").click(function() {
	$("#finding_location").show();
	getLocation();
});