var gpsPosition = {};

var map = null;
var eventLayer = null;
var relativeLayer = null;

var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
var toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection

var viewrange = 10;

var panDuration = 1000;
var randPanDir = {x: randInt(-5, 5), y: randInt(-5, 5)};
