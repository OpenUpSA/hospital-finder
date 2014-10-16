
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
    var marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      title: hospital.name
    });
    var count = Math.round(hospital.rating/20);
    var s = "";
    for (var i = 0; i < count; i++) {
      s += "<i class='fa fa-star'></i>";
    }
    for (var i = count; i < 5; i++) {
      s += "<i class='fa fa-star-o'></i>";
    }
    var infowindow = new google.maps.InfoWindow({
      content: "<h3>" + hospital.name + "</h3><h4>" + s + "</h4>"
    });
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map,marker);
    });
  }

}

google.maps.event.addDomListener(window, 'load', initialize);
