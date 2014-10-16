
function stars(perc) { // Fuck DRY
  var count = Math.round(perc/20);
  var s = "";
  for (var i = 0; i < count; i++) {
    s += "<i class='fa fa-star'></i>";
  }
  for (var i = count; i < 5; i++) {
    s += "<i class='fa fa-star-o'></i>";
  }
  return s;
}

function initialize() {
  if (hospital) {
    var isDraggable = $(document).width() > 480 ? true : false;
    var myLatlng = new google.maps.LatLng(hospital.latitude, hospital.longitude);
    var mapOptions = {
      zoom: 14,
      center: myLatlng,
      draggable: isDraggable,
      scrollwheel: false,
    }
    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    var points = [];
    
    $.get("/find", {lat: hospital.latitude, lng: hospital.longitude }, function(data) {
      $.each(data.result, function(id, h) {
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(h.latitude, h.longitude),
          map: map,
          title: h.name
        });
        var infowindow = new google.maps.InfoWindow({
          content: "<h3><a href='/hospital/" + h.uid + "'>" + h.name + "</a></h3><h4>" + stars(h.overall_performance) + "</h4>"
        });
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, marker);
        });
        points.push({ marker: marker, infowindow: infowindow });
      });
      var first_point = points[0];
      first_point.infowindow.open(map, first_point.marker); // This makes the primary hospital's infopage pop up
    });
  }

}

google.maps.event.addDomListener(window, 'load', initialize);
