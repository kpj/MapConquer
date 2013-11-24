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

	// tell server
	postData({action: "pos_update", name: getGET("player"), position: {lon: gpsPosition["long"], lat: gpsPosition["lat"]}});

	// update map
	updatePosition();
}

function pollServer() {
	postData({action: "get_info", type: "other_players", name: getGET("player")}, handleServerResponse)
	setTimeout(pollServer, pollTimeout);
}
function handleServerResponse(res) {
	var typ = res.type;
	var data = res.data;

	if(typ == "other_players") {
		handleOtherPlayers(data);
	}
}

function handleOtherPlayers(data) {
	// update existing ones
	for(var name in data) {
		if(name == getGET("player"))
			continue;

		var exists = false;
		for(var i in relativeLayer.features) {
			if(relativeLayer.features[i].data.name == name) {
				exists = true;

				// move feature
				var pos = getPos(data[name]["position"]["lon"], data[name]["position"]["lat"]);
				relativeLayer.features[i].move(pos);
			}
		}
		if(!exists) {
			// create feature
			var pos = getPos(data[name]["position"]["lon"], data[name]["position"]["lat"]);
			relativeLayer.addFeatures([
				new OpenLayers.Feature.Vector(
					new OpenLayers.Geometry.Point(pos.lon, pos.lat),
					{
						"name": name
					}
				)
			]);
		}
	}

	// delete old ones
	var delme = []
	for(var i in relativeLayer.features) {
		if(relativeLayer.features[i].data.name != null) {
			if(!(relativeLayer.features[i].data.name in data)) {
				delme.push(relativeLayer.features[i]);
			}
		}
	}
	relativeLayer.removeFeatures(delme);
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

	// layer to hold elements relative to player
	relativeLayer = new OpenLayers.Layer.Vector(
		"not zooming", {
			"styleMap": new OpenLayers.StyleMap({
				"default": new OpenLayers.Style({
					pointRadius: "${getPointRadius}",
					fillColor: '${getColor}',
					fillOpacity: 0,
					strokeColor: '${getColor}',
					strokeWidth: "${getStrokeWidth}",
					strokeOpacity: "${getStrokeOpacity}"
				}, {
					context: {
						getPointRadius: function(feature) {
							return ((feature.data.id == "pulse") ? radiusScale : 1) * Math.max(4, viewrange / feature.layer.map.getResolution());
						},
						getStrokeWidth: function(feature) {
							return Math.max(2, (viewrange / feature.layer.map.getResolution())/5);
						},
						getColor: function(feature) {
							return (feature.data.id == "viewrange" || feature.data.id == "pulse") ? '#00ccff' : '#00ffff';
						},
						getStrokeOpacity: function (feature) {
							return (feature.data.id == "pulse") ? viewrangeOpacity : 1;
						}
					}
				})
			})
		}
	);

	// vision marker
	relativeLayer.addFeatures([
		new OpenLayers.Feature.Vector(
			new OpenLayers.Geometry.Point(0, 0),
			{
				"id": "viewrange"
			}
		),
		new OpenLayers.Feature.Vector(
			new OpenLayers.Geometry.Point(0, 0),
			{
				"id": "pulse"
			}
		)
	]);

	// add layers
	map.addLayer(relativeLayer);
	map.addLayer(eventLayer);

	// enable pulsing for viewrange
	pulse();

	// some standard location
	map.setCenter(getPos(/*randInt(0, 180), randInt(0, 90)*/randFloat(-76, -78), randFloat(37, 39)), 14);
}

function updatePosition() {
	var position = getPos(gpsPosition["long"], gpsPosition["lat"]);

	// visualize own range
	relativeLayer.getFeaturesByAttribute("id", "viewrange")[0].move(position);
	relativeLayer.getFeaturesByAttribute("id", "pulse")[0].move(position);

	map.setCenter(position);
}

function placeObject() {
	postData({action: "get_info", type: "player",name: getGET("player")}, placeObjectCallback);
}
function placeObjectCallback(info) {
	postData({action: "add_event", lon: gpsPosition["long"], lat: gpsPosition["lat"], owner: info.name, faction: info.faction});

	// temporarily add marker
	var size = new OpenLayers.Size(30, 30);
	var offset = new OpenLayers.Pixel(0, -30);
	var icon = new OpenLayers.Icon("data/portal.png", size, offset);
	eventLayer.addMarker(
		new OpenLayers.Marker(
			getPos(gpsPosition["long"], gpsPosition["lat"]), 
			icon
		)
	);
}

function enableAutoPan() {
	map.panDuration = panDuration;
	map.pan(randPanDir.x * 10, randPanDir.y * 10);
	setTimeout(enableAutoPan, panDuration);
}
