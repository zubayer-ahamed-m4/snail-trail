var map;
var marker;
var prevMarker;
var currentMarker;
var directionDisplay;
var directionDisplayArray = [];
var directionService;
var markerArray = [];
var allLatLong = [];
var latestMarkersLatLong = [];
var wayPoints = [];
var locationsId = [];
var markerColor = "9A6324";
var resourcePath;
var locationTimeInfoWindow;
var stepDisplay;
var MAX_QUERY_LIMIT = 25;
var MAX_DELAY = 3000;
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




// MAIN
$(document).ready(function() {
	stepDisplay = new google.maps.InfoWindow;
	resourcePath = $('#resourcePath').val();
	initializeMap();

	//TODO: date validation
//	var validationText = "";+
//	$.validator.addMethod("enddate", function(value, element) {
//		var datepair = $(element).data("datepair");
//		if ($("input[data-datepair=" + datepair + "]").not(".con-enddate").val() !== "") {
//			var otherdate = $("input[data-datepair=" + datepair + "]").not(".con-enddate");
//			var otherdateid = otherdate.attr('id');
//			$("span.error[for='" + otherdateid + "']").hide();
//			var startdatevalue = otherdate.val();
//			console.log()
//			
//			var timeDiff = Math.abs((moment(value, "DD-MMM-YYYY").toDate()).getTime() - (moment(startdatevalue, "DD-MMM-YYYY").toDate()).getTime());
//			var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
//			if(diffDays >= 5) return false;
//			return moment(startdatevalue, "DD-MMM-YYYY") <= moment(value, "DD-MMM-YYYY");
//		}
//		return true;
//	}, "text");

//	$('#mainform').on('submit', function(e){
//		e.preventDefault();
//		var formData = $(this).serializeArray();
//		var methodType = $(this).attr('method');
//		var submitUrl = $(this).attr('action');
//
//		if(validateFormData(formData) == false) return;

//		$.ajax({
//			url: submitUrl,
//			type: methodType,
//			data: formData,
//			async: false,
//			success: function(data) {
//				//console.log({data});
//				if(data.status.toLowerCase() == 'error') showMessage('alert-danger', data.message);
//				if(data.driverLocations.length <= 0){
//					showMessage('alert-danger', "No location found for this driver at specified date time range.");
//					return;
//				}
				
	
		var lat = [51.507566, 51.507046, 51.507570, 51.507984, 51.507139, 51.506231, 51.505934, 51.505609, 51.507178, 51.505869, 51.503679, 51.505242, 51.506143, 51.507112];
		var lng = [-0.127612, -0.125456, -0.125896, -0.125354, -0.123831, -0.124319, -0.125536, -0.126799, -0.127914, -0.130780, -0.136067, -0.137472, -0.135306, -0.132668];
		var driverLocations = [];
		for(var i = 0; i < lat.length; i++){
			driverLocations.push({
				latitude : lat[i],
				longitude : lng[i],
				locationDate : "location date",
				locationTime : "location time",
				driverId : i,
				locationId : i,
			})
		}
		
		var data = {"driverLocations": driverLocations};
		console.log(data);
		
		resetAll();
		// TODO: check duplicate lat long
		getAllLatLongOfDriver(data);
		controlPosition(allLatLong);

		var OFFSET = 0;
		var queryInterval = setInterval(() => {
			var currentlyAllowedLatLongs = [];
			for(var i = OFFSET; i < OFFSET + MAX_QUERY_LIMIT && i < allLatLong.length; i++){
				currentlyAllowedLatLongs.push(allLatLong[i]);
			}

			// CALL DIRECTION API
			generateDirectionWithAllowedLatLongs(currentlyAllowedLatLongs);

			OFFSET = (OFFSET-1) + MAX_QUERY_LIMIT;
			//console.log("%cOFFSET NOW : " + OFFSET, "color: red");
			var END_OF_PROCESS = false;
			if(OFFSET >= allLatLong.length) {
				END_OF_PROCESS = true;
				clearInterval(queryInterval);
			}

			// DISPLAY MARKER
			generateAndDisplayCurrentlyAllowedmarker(currentlyAllowedLatLongs, END_OF_PROCESS);
			generateAndBindInfoWindowWithMarkers();
			updateTimeControlDiv();
			//if(END_OF_PROCESS == true) getLiveDriverLocation(formData, methodType, submitUrl);

		}, MAX_DELAY);
		
		
//
//			},
//			error: function(jqXHR, status, errorThrown) {
//				showMessage('alert-danger', "Something went wrong....");
//			}
//		});
//	});

});


var latestLatLong = [];
// GET LIVE DRIVER LOCATION DATA
function getLiveDriverLocation(formData, methodType, submitUrl){
	var toDate = formData[4].value;
	var toTime = formData[5].value == '' ? '23:59' : formData[5].value;
	//console.log(toDate + " " + toTime);
	if(toDate != '' && (Math.abs((moment(toDate + " " + toTime, "DD-MMM-YYYY hh:mm").toDate()).getTime() < new Date().getTime())) == 1) return;

	// TODO: will be 3 second delay effect
	var liveUpdateInterval = setInterval(() => {
		console.log("%cCALLING NEXT DATA EACH 3 SECIOND", "color:red;")
		$.ajax({
			url: submitUrl,
			type: methodType,
			data: formData,
			async: false,
			success : function(data){
				console.log({data});
				// FILTER LATEST LOCATIONS
				data.driverLocations.forEach(function(dl){
					if(locationsId.indexOf(dl.locationId) < 0) {
						var latestLocation = {
							lat : Number(dl.latitude),
							lng : Number(dl.longitude),
							locationDate : dl.locationDate,
							locationTime : dl.locationTime,
							driverId : dl.driverId,
							locationId : dl.locationId
						}
						allLatLong.push(latestLocation);
						latestMarkersLatLong.push(latestLocation);
					}
				});

			},
			error : function(jqXHR, status, errorThrown){
				showMessage('alert-danger', "Something went wrong....");
			}
		})

	}, MAX_DELAY);

	
	
}

// UPDATE TIME CONTROL DIV
function updateTimeControlDiv(){
	$('.time-control-div').html(markerArray[markerArray.length - 1].title);
}

// GENERATE INFO WINDOW FOR CURRENTLY ALLOWED MARKER
function generateAndBindInfoWindowWithMarkers(){
	markerArray.forEach(function(marker){
		locationTimeInfoWindow = new google.maps.InfoWindow();
		google.maps.event.addListener(marker, 'click', function() {
			locationTimeInfoWindow.setContent(marker.title);
			locationTimeInfoWindow.open(map, marker);
		});
	})
	
}

// GENERATE DIRECTION WITH CURRENTLY ALLOWED LAT LONGS
function generateDirectionWithAllowedLatLongs(currentlyAllowedLatLongs){
	if(currentlyAllowedLatLongs.length <= 1) return;

	var startPosition = currentlyAllowedLatLongs[0];
	var endPosition = currentlyAllowedLatLongs[currentlyAllowedLatLongs.length - 1];
	var wayPoints = [];
	for(var i = 0; i < currentlyAllowedLatLongs.length; i++){
		if(i == 0 || i == (currentlyAllowedLatLongs.length - 1)) continue;
		wayPoints.push({
			location: new google.maps.LatLng(Number(currentlyAllowedLatLongs[i].lat), Number(currentlyAllowedLatLongs[i].lng)),
			stopover: true
		})
	}

//	console.log("%cSTART : ", "color: green"); console.log({startPosition});
//	console.log("%cWAAYPOINTS : ", "color: green"); console.log({wayPoints});
//	console.log("%cEND : " , "color: green"); console.log({endPosition});

	directionService = new google.maps.DirectionsService;
	directionDisplay = new google.maps.DirectionsRenderer();

	directionService.route({
		origin: startPosition,
		destination: endPosition,
		waypoints: wayPoints,
		travelMode: google.maps.TravelMode.DRIVING
	}, function(response, status) {
		//console.log({response});
		if (status === google.maps.DirectionsStatus.OK) {
			directionDisplay.setDirections(response);
		} else {
			console.log('Directions request failed due to ' + status);
		}
	});
	directionDisplay.setMap(map);
	directionDisplay.setOptions( { preserveViewport : false, suppressMarkers: true, zoom : 5 } );
	directionDisplayArray.push(directionDisplay);
}



// GENERATE AND DISPLAY CURRENTLY ALLOWD MARKER
function generateAndDisplayCurrentlyAllowedmarker(currentlyAllowedLatLongs, END_OF_PROCESS) {
	var image = {
			url : resourcePath + 'm1.png',
			origin: new google.maps.Point(0, 0)
		}

	for(var i = 0; i < currentlyAllowedLatLongs.length; i++){

		//if(i == currentlyAllowedLatLongs.length - 1 && END_OF_PROCESS == false) continue;
		if(i == currentlyAllowedLatLongs.length - 1) {
			image = {
					url : resourcePath + 'driver.png',
					origin: new google.maps.Point(0, 0)
				}
		}

		var marker = new google.maps.Marker({
			position: currentlyAllowedLatLongs[i],
			icon : image,
			map: map,
			title: currentlyAllowedLatLongs[i].locationDate + " @ " + currentlyAllowedLatLongs[i].locationTime
		});

		markerArray.push(marker);
		updatePreviousMarkerIcon(i, currentlyAllowedLatLongs, marker);
	}
}

// UPDATE PREVIOUS MARKER ICON
var PREV_MARKER;
function updatePreviousMarkerIcon(i, currentlyAllowedLatLongs, marker){
	if(PREV_MARKER != undefined && i == currentlyAllowedLatLongs.length - 1) {
		PREV_MARKER.setIcon({
			path: google.maps.SymbolPath.CIRCLE,
			scale: 0
		});
	}
	if(i == currentlyAllowedLatLongs.length - 1) PREV_MARKER = marker;
}

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

// GET ALL DRIVERLOCATION LAT/LON
function getAllLatLongOfDriver(data){
	data.driverLocations.forEach(function(driver){
		allLatLong.push({
			lat : Number(driver.latitude),
			lng : Number(driver.longitude),
			locationDate : driver.locationDate,
			locationTime : driver.locationTime,
			driverId : driver.driverId,
			locationId : driver.locationId
		})
		locationsId.push(driver.locationId);
	})
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

//VALIDATE FORM DATA
function validateFormData(formData){
	if (formData[0].value == undefined || formData[0].value == '') return false;
	if (formData[2].value == undefined || formData[2].value == '') return false
	if (formData[3].value == undefined || formData[3].value == '') return false;
	if (formData[4].value == undefined || formData[4].value == '') return false
	if (formData[5].value == undefined || formData[5].value == '') return false;
	return true;
}

// REMOVE ALL MARKER FROM MAP
function removeAllMarkerAndClearMap(){
	for (var i = 0; i < markerArray.length; i++) {
		markerArray[i].setMap(null);
	}
}

// REMOVE ALL DIRECTIONS FROM MAP
function removeDirectionsLine(){
	if(directionDisplayArray == undefined || directionDisplayArray.length <= 0) return;
	directionDisplayArray.forEach(function(direction){
		direction.setMap(null);
	});
}

// RESET ALL
function resetAll(){
	while(allLatLong.length > 0){
		allLatLong.pop();
	}
	removeAllMarkerAndClearMap();
	removeDirectionsLine();
}