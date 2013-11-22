function randFloat(min, max) {
	return Math.random() * (max - min) + min
}
function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function postData(dict) {
	$.ajax({
		type: "POST",
		url: "/postdata",
		data: JSON.stringify({"data": dict}),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function(data){
			console.log("[AJAX] received: " + data);
		},
		failure: function(err) {
			onsole.log("[AJAX] Error while sending (" + err + ")");
		}
	});
}
