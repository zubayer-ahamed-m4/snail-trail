var map;
var marker;
var prevMarker;
var currentMarker;
var directionDisplay;
var directionService;
var latestMarkers = [];
var markerArray = [];
var allLatLong = [];
var style = [ {
		featureType : "poi",
		elementType : "labels",
		stylers : [ {
			visibility : "off"
		} ]
	}, {
		featureType : "transit",
		elementType : "labels",
		stylers : [ {
			visibility : "off"
		} ]
	} ];
var resourceUrl;

// MAIN
$(document).ready(function() {
	resourceUrl = $('#resourceUrl').attr('href');
	initializeMap();
	//generateControlDiv();

	// TODO: Driver search functionality will work before go down
	getAllLatLongOfDriver();
	controlPosition(allLatLong);

	var i = 0;
	var markerInterval = setInterval(() => {
		if(i > 1) latestMarkers.shift();
		latestMarkers.push(allLatLong[i]);
		controlPosition(latestMarkers);

		setTimeout(() => {
			generateMarkers(i);
			updatePreviousMarkerIcon(i - 1);
			if (i > 0) generateDirection();
			i++;

			// STOP DISPLAY INTERVAL LOGIC
			if(i == allLatLong.length) stopDisplayInterval(markerInterval);

		}, 500);
	}, 3000);
});

// INITIALIZE MAP
function initializeMap(){
	map = new google.maps.Map(document.getElementById('map'), {
		center : new google.maps.LatLng(34.30714386, -9.31640625),
		scrollwheel : true,
		zoom : 3,
		styles : style,
		fullscreenControl : false,
		streetViewControl : false,
		mapTypeControl : true,
		mapTypeControlOptions : {
			position : google.maps.ControlPosition.BOTTOM_CENTER
		}
	});
}

// GET ALL DRIVERS LAT/LON
function getAllLatLongOfDriver(){
	allLatLong = [
		{lat: 53.408371, lng: -2.991573},
		{lat: 53.810585, lng: -1.509032},
		{lat: 53.602488, lng: -0.652473},
		{lat: 53.143682, lng: -0.564621},
		{lat: 52.479644, lng: -0.279101},
		{lat: 51.4592483, lng: -0.139455},
		{lat: 51.177729, lng: -1.215644},
		{lat: 50.894480, lng: -3.357041}
	];
}

// CONTROL MAP POSITION TO CENTER
function controlPosition(latLangs){
	var latlngbounds = new google.maps.LatLngBounds();
	latLangs.forEach(function(latLng) {
		latlngbounds.extend(latLng);
	});
	map.panTo(latlngbounds.getCenter());
	map.fitBounds(latlngbounds);
}

// GENERATE CONTROL DIV AND PLACE IT TO MAP
function generateControlDiv(){
	var controlDiv = document.createElement("div");
	controlDiv.classList.add("control-div");
	controlDiv.innerHTML = uiControlDiv();
	map.controls[google.maps.ControlPosition.LEFT_TOP].push(controlDiv);
}

// GENERATE MARKER
function generateMarkers(index){
	var today = new Date();

	var image = {
		url : resourceUrl + "driver.png",
		origin: new google.maps.Point(0, 0)
	}

	marker = new google.maps.Marker({
		position: allLatLong[index],
		icon : image,
		map: map,
		title: today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()
	});

	markerArray.push(marker);

	if(index < 1) {
		currentMarker = allLatLong[index]
		return;
	}

	prevMarker = currentMarker;
	currentMarker = allLatLong[index];
}

// UPDATE PREVIOUS MARKER ICON
function updatePreviousMarkerIcon(index){
	if(markerArray.length <= 0 || index < 0) return;

	var image = {
		url : resourceUrl + "m1.png",
		origin: new google.maps.Point(0, 0)
	}

	markerArray[index].setIcon(image);
}

// GENERATE DIRECTION
function generateDirection(){
	setTimeout(() => {
		directionDisplay = new google.maps.DirectionsRenderer;
		directionService = new google.maps.DirectionsService;

		directionService.route({
			origin: prevMarker,
			destination: currentMarker,
			travelMode: google.maps.TravelMode.DRIVING
		}, function(response, status) {
			if (status === google.maps.DirectionsStatus.OK) {
				directionDisplay.setDirections(response);
			} else {
				showError('Directions request failed due to ' + status);
			}
		});
		directionDisplay.setMap(map);
		directionDisplay.setOptions( { preserveViewport : true, suppressMarkers: true, zoom : 5 } );
	}, 500);
}

//STOP DISPLAY
function stopDisplayInterval(markerInterval){
	clearInterval(markerInterval);
	setTimeout(() => {
		controlPosition(allLatLong);
	}, 1000);
}

// CONTROL DIV
function uiControlDiv(){
	var bodyWidth = $('body').width();
	var leftMargin = (bodyWidth - bodyWidth/2)-60;

	return 	'<div class="time-control-div" style="margin-left: '+ leftMargin +'px;">01/01/2019 @ 12:34</div>'+
			'<div class="driver-control-div">'+
				'<h3>Show location history for ...</h3>'+
				'<form class="form-horizontal snailtrailform">'+
					'<div class="control-group">'+
						'<label class="control-label" for="job-search" th:text="#{pod.label.search}">Driver : </label>'+
						'<div class="controls">'+
							'<div class="input-append">'+
								'<input type="text" class="typeahead input-large" placeholder="Search ..." autocomplete="off"/>'+ 
								'<span class="add-on"><i class="icon-search"></i></span>'+
							'</div>'+
						'</div>'+
					'</div>'+
					'<div class="control-group">'+
						'<label class="control-label" for="expectedDispatchDate" th:text="#{hermes.dispatchdate.label}">From : </label>'+
						'<div class="controls">'+
							'<div class="input-append">'+
								'<input class="input-datesize include con-futuredate required" type="text" /><span class="add-on"><i class="icon-calendar"></i></span> @ '+
								'<input class="input-mini include con-timepicker required" type="text"/><span class="add-on"><i class="icon-time"></i></span>'+
							'</div>'+
						'</div>'+
					'</div>'+
					'<div class="control-group">'+
						'<label class="control-label" for="expectedDispatchDate" th:text="#{hermes.dispatchdate.label}">To : </label>'+
						'<div class="controls">'+
							'<div class="input-append">'+
								'<input class="input-datesize include con-futuredate required" type="text" /><span class="add-on"><i class="icon-calendar"></i></span> @ '+
								'<input class="input-mini include con-timepicker required" type="text"/><span class="add-on"><i class="icon-time"></i></span>'+
							'</div>'+
						'</div>'+
					'</div>'+
					'<button type="submit" class="btn btn-primary pull-right snail-trail-submit-btn">Submit</button>'+
				'</form>'+
			'</div>';
}