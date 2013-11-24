function randFloat(min, max) {
	return Math.random() * (max - min) + min
}
function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getGET(param) {
	var search = window.location.search.substring(1);
	var vars = search.split('&');
	for (var i in vars) {
		var para = vars[i].split('=');
		if (para[0] == param)
			return para[1];
	}
	return null;
}

function postData(dict, fun) {
	$.ajax({
		type: "POST",
		url: "/postdata",
		data: JSON.stringify({"data": dict}),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: fun,
		failure: function(err) {
			onsole.log("[AJAX] Error while sending (" + err + ")");
		}
	});
}

function getPos(lon, lat) {
	return new OpenLayers.LonLat(lon, lat).transform(fromProjection, toProjection);
}

function pulse() {
	var max = 60;
	var c = 0;
	var step = 0.05;

	function pulse_resize() {
		if(viewrangeOpacity < 0.1) {
			c = 0;
			viewrangeOpacity = 1;
			radiusScale = 1;
		}

		radiusScale += step;
		radiusScale = (radiusScale > 0) ? radiusScale : 0;

		viewrangeOpacity -= c / max / 10;

		relativeLayer.redraw();

		c++;
		window.setTimeout(pulse_resize, 100);
	}
	pulse_resize();
}
