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
