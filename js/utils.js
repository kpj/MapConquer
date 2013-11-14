function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function enableLocationTracking() {
	if (navigator.geolocation) {
		navigator.geolocation.watchPosition(handleLocation);
	} else {
		console.log("Geolocation is not supported by this browser.");
	}
}

function handleLocation(position) {
	console.log("Got: " + position.coords.latitude + ":" + position.coords.longitude);
	gpsPosition = {"lat": position.coords.latitude,"long": position.coords.longitude};

	updatePosition();
}

function initMap() {
	map = new OpenLayers.Map("basicMap");
	map.addLayer(new OpenLayers.Layer.OSM(/*"MidnightCommander", "http://c.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/999/256/${z}/${x}/${y}.png"*/));

	// layer to hold buildings
	eventLayer = new OpenLayers.Layer.Text(
		"buildings",
		{
			"location": "data/events.txt",
			"projection": map.displayProjection
		}
	);
	map.addLayer(eventLayer);

	// layer to hold elements relative to player
	relativeLayer = new OpenLayers.Layer.Vector(
		"not zooming", {
			"styleMap": new OpenLayers.StyleMap({
				"default": new OpenLayers.Style({
					pointRadius: "${getPointRadius}",
					fillColor: '#ff0000',
					fillOpacity: 0.0,
					strokeColor: '#00ccff',
					strokeWidth: "${getStrokeWidth}",
					strokeOpacity: 1.0
				}, {
					context: {
						getPointRadius: function(feature) {
							return Math.max(1,viewrange / feature.layer.map.getResolution());
						},
						getStrokeWidth: function(feature) {
							return Math.max(1,(viewrange / feature.layer.map.getResolution())/5);
						}
					}  
				})
			})
		}
	);
	map.addLayer(relativeLayer);

	// vision marker
	relativeLayer.addFeatures([
		new OpenLayers.Feature.Vector(
			new OpenLayers.Geometry.Point(0, 0),
			{
				"id": "viewrange"
			}
		)
	]);

	// some standard location
	map.setCenter(new OpenLayers.LonLat(randInt(0, 180), randInt(0, 90)).transform(fromProjection, toProjection), 14);
}

function updatePosition() {
	var position = new OpenLayers.LonLat(
		gpsPosition["long"],
		gpsPosition["lat"]
	).transform(fromProjection, toProjection);

	// visualize own range
	for(var i in relativeLayer.features) {
		if(relativeLayer.features[i].data.id == "viewrange") {
			relativeLayer.features[i].move(position);
		}
	}

	map.setCenter(position);
}

function placeObject() {
	window.location += "&action=add_event&lon=" + gpsPosition["long"] + "&lat=" + gpsPosition["lat"]
}

function enableAutoPan() {
	map.panDuration = panDuration;
	map.panTo(map.getLonLatFromPixel({x: randInt(2, 5), y: randInt(2, 5)}));
	setTimeout(enableAutoPan, panDuration*2);
}
