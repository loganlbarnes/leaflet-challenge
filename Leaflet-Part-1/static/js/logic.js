// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
  });

function markerSize(magnitude) {
    return magnitude * 20000
}

function markerColor(depth) {
    if (depth<10) return "green";
    else if (depth <30) return "greenyellow";
    else if (depth <50) return "yellow";
    else if (depth <70) return "orange";
    else if (depth <90) return "orangered";
    else return "red";
}

function createFeatures(earthquakeData) {
    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }

    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlng) {
            let markers = {
                radius: markerSize(feature.properties.mag),
                fillColor: markerColor(feature.geometry.coordinates[2]),
                fillOpacity: 0.7,
                color: "black",
                stroke: true,
                weight: 0.5
            }
            return L.circle(latlng, markers);
        }
    });

    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
};

// Create map legend to provide context for map data
let legend = L.control({ position: 'bottomright' });

legend.onAdd = function () {
  var div = L.DomUtil.create('div', 'info legend');
  var grades = [-10, 10, 30, 50, 70, 90];
  var labels = [];
  var legendInfo = "<h4>Magnitude</h4>";

  div.innerHTML = legendInfo;

  // go through each magnitude item to label and color the legend
  // push to labels array as list item
  for (var i = 0; i < grades.length; i++) {
    labels.push(
      '<ul style="background-color:' +
        markerColor(grades[i] + 1) +
        '"> <span>' +
        grades[i] +
        (grades[i + 1] ? '&ndash;' + grades[i + 1] + '' : '+') +
        '</span></ul>'
    );
  }

  // add each label list item to the div under the <ul> tag
  div.innerHTML += "<ul>" + labels.join("") + "</ul>";

  return div;
};


// Create map
function createMap(earthquakes) {
    // Define outdoors and graymap layers
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
 
   // Define a baseMaps object to hold our base layers
   let baseMaps = {
     "Street": street
   };
 
   // Create overlay object to hold our overlay layer
   let overlayMaps = {
     Earthquakes: earthquakes
   };
 
   // Create our map, giving it the streetmap and earthquakes layers to display on load
   let myMap = L.map("map", {
     center: [
       39.8282, -98.5795
     ],
     zoom: 4,
     layers: [street, earthquakes]
   });
   
    legend.addTo(myMap);
 }