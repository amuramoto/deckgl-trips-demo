const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GoogleMapsAPIKey,
  Promise: Promise
});
const express = require('express');
const app = express();
app.listen(process.env.PORT || 1337);

app.use(express.static(__dirname + '/dist'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/directions', async(req, res) => {
  const START = req.query.start.split(',');
  const END = req.query.end.split(',');
  const OPTIONS = {
    origin: [START[0], START[1]],
    destination: [END[0], END[1]],
    mode: 'driving'
  }
  let request = googleMapsClient.directions(OPTIONS).asPromise();
  let result = await request;
  result = result.json.routes[0].legs[0];
  let response = {
    duration: result.duration.value,
    waypoints: buildWaypoints(result.start_location, result.end_location, result.steps)
  }
 
});

function buildWaypoints(start_coords, end_coords, steps) {
  console.log(steps)
  const directions = {
    waypoints: []
  };
  
  directions.waypoints.push({
    coords: [start_coords.lng, start_coords.lat],
    timestamp: 0
  });

  steps.forEach((step, index) => {
    directions.waypoints.push({
      coords: [step.end_location.lng, step.end_location.lat],
      timestamp: 
    });    
  });
  
console.log(directions)
}