// Store our API endpoint inside queryUrl
// Use Activity geoJson activity 1-10 as reference  
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});
// legend on the map 
// https://leafletjs.com/examples/choropleth/ custom legend control 

let legend = L.control({position:'bottomright'});

legend.onAdd = function(){  
    var div = L.DomUtil.create('div', 'info legend'),
    grades = [1,2,3,4,5],
    labels =[];
  
    // loop through our density intervals and generate a label with a colored square for each interval
	  for (var i = 0; i < grades.length; i++){
		    div.innerHTML +=
			        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
			        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
	  }

	return div;
}

// magnitude colors 
//https://stackoverflow.com/questions/4161369/html-color-codes-red-to-yellow-to-green

function getColor(c)
{
  x = Math.ceil(c);
  switch (Math.ceil(x)) {
    
    case 1:
      return "#00FF00";
    case 2:
      return "#7FFF00";
    case 3:
      return "#ccff00";
    case 4:
      return "#FFFF00";
    case 5:
      return "#FF0000";
    default : 
      return "#FF0000"
  }
}



function createFeatures(earthquakeData) {

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(feature,latlng){
      return L.circleMarker(latlng,{
        radius: feature.properties.mag*5,
        fillColor: getColor(feature.properties.mag),
        color: "#000" ,
        weight: 1 ,
        opacity : 1 ,
        fillOpacity:.5})
        .bindPopup("<h3>" + "Location: " + feature.properties.place +
        "</h3><hr><p>" + "Date/Time: " + new Date (feature.properties.time) + "<br>" +
        "Magnitude: " + feature.properties.mag + "</p>");

    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": lightmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [lightmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  
  //Add legend to myMap
  legend.addTo(myMap);
}