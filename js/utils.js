function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(handleLocation);
	} else {
		console.log("Geolocation is not supported by this browser.");
	}
}

function handleLocation(position) {
	console.log("Got:" + position.coords.latitude + ":" + position.coords.longitude);
	gpsPosition = {"lat": position.coords.latitude,"long": position.coords.longitude};

	showMap();
}

function showMap() {
	// initialize map
	var map = new OpenLayers.Map("basicMap");
	var position = new OpenLayers.LonLat(
		gpsPosition["long"],
		gpsPosition["lat"]
	).transform(fromProjection, toProjection);
	var zoom = 17;

	map.addLayer(new OpenLayers.Layer.OSM());

	// create events
	var eventLayer = new OpenLayers.Layer.Text(
		"Events",
		{
			"location": "data/events.txt",
			"projection": map.displayProjection
		}
	);
	map.addLayer(eventLayer);

	// visualize own range
	var interactiveLayer = new OpenLayers.Layer.Vector(
		"not Zooming", {
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
	map.addLayer(interactiveLayer);
	interactiveLayer.addFeatures([
		new OpenLayers.Feature.Vector(
			new OpenLayers.Geometry.Point(position.lon, position.lat)
		)
	]);

	map.setCenter(position, zoom);

}
