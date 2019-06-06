/* global document, google */
import {GoogleMapsOverlay} from '@deck.gl/google-maps';
import {GeoJsonLayer, ScatterplotLayer} from '@deck.gl/layers';
import {TripsLayer} from '@deck.gl/geo-layers';

// Set your Google Maps API key here or via environment variable
const GOOGLE_MAPS_API_KEY = process.env.GoogleMapsAPIKey; // eslint-disable-line
const GOOGLE_MAPS_API_URL = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
const MAP_STYLES = [
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.business",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#242f3e"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#746855"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#242f3e"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#263c3f"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#6b9a76"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#38414e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#212a37"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9ca5b3"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#746855"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#1f2835"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#f3d19c"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2f3948"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#17263c"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#515c6d"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#17263c"
      }
    ]
  }
];

async function getTrips() {
  // source: NYC Open Data 
  // https://data.cityofnewyork.us/Environment/2015-Street-Tree-Census-Tree-Data/pi5s-9p35
  const QUERY = '$where=within_circle(pickup_centroid_location,41.932875,-87.761911,1500) AND within_circle(dropoff_centroid_location,41.932875,-87.761911,1500) AND trip_start_timestamp!=trip_end_timestamp';
  const TRIPS_URL = 'https://data.cityofchicago.org/resource/wrvz-psew.json?$limit=200&' + QUERY;
  let trips = await fetch(TRIPS_URL)
  trips = await trips.json();
  trips = await formatTrips(trips);
  return trips;
}

async function formatTrips (trips) {
  trips = trips.filter(trip => {
    if(trip.pickup_centroid_latitude !== trip.dropoff_centroid_latitude &&
      trip.pickup_centroid_longitude !== trip.dropoff_centroid_longitude) {
      return true;
    }
  })
  trips = trips.map(async (trip) => {
    let start_time = new Date(trip.trip_start_timestamp).getTime();
    let end_time = new Date(trip.trip_end_timestamp).getTime();
    let pickup_coords = [trip.pickup_centroid_latitude, trip.pickup_centroid_longitude];
    let dropoff_coords = [trip.dropoff_centroid_latitude, trip.dropoff_centroid_longitude]
    // let waypoints = await getDirections(pickup_coords, dropoff_coords);
    return {
      'waypoints': [
        {
          coords: pickup_coords.reverse(), 
          timestamp: start_time
        }, 
        {
          coords: dropoff_coords.reverse(),
          timestamp: end_time
        },          
      ]
    }    
  });
  console.log(trips)
  return trips;
}

async function getDirections (start_coords, end_coords) {
  const directionsService = new google.maps.DirectionsService();
  const request = {
    origin: new google.maps.LatLng(start_coords[0], start_coords[1]),
    destination: new google.maps.LatLng(end_coords[0], end_coords[1]),
    travelMode: 'DRIVING'
  };
  let directions =  new Promise((resolve, reject) => {
    directionsService.route(request, (response, status) => {
      if (status === 'OK') {
        resolve(response);
      }
      reject(status);
    });
  });
  return directions;
}

function loadScript(url) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  const head = document.querySelector('head');
  head.appendChild(script);
  return new Promise(resolve => {
    script.onload = resolve;
  });
}

loadScript(GOOGLE_MAPS_API_URL).then(() => {
  const map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 41.954027649, lng: -87.763399032},
    zoom: 14,
    styles: MAP_STYLES
  });

  const directionsService = new google.maps.DirectionsService();

  const TAXI_TRIPS = getTrips(directionsService);
  const overlay = new GoogleMapsOverlay({
    layers: [
      new TripsLayer({
        id: 'trips-layer',
        data: TAXI_TRIPS,
        getPath: d => d.waypoints.map(p => p.coords),
        getTimestamps: d => d.waypoints.map(p => p.timestamp),
        getColor: [253, 128, 93],
        opacity: 0.8,
        widthMinPixels: 5,
        rounded: true,
        trailLength: 200,
        currentTime: 150
      })
    ]
  });
  overlay.setMap(map);
});


let test = [
{
waypoints: [
{
coordinates: [
-122.39079879999997,
37.7664413
],
timestamp: 1554772579000
},
{
coordinates: [
-122.3908298,
37.7667706
],
timestamp: 1554772579009
},
{
coordinates: [
-122.39271759999997,
37.7667484
],
timestamp: 1554772579054
},
{
coordinates: [
-122.3951341,
37.7665964
],
timestamp: 1554772579092
},
{
coordinates: [
-122.409425,
37.7779834
],
timestamp: 1554772579345
},
{
coordinates: [
-122.41318080000002,
37.7750068
],
timestamp: 1554772579402
},
{
coordinates: [
-122.41619750000001,
37.7774034
],
timestamp: 1554772579462
},
{
coordinates: [
-122.42135359999997,
37.7770974
],
timestamp: 1554772579563
},
{
coordinates: [
-122.42620490000002,
37.8010553
],
timestamp: 1554772579880
},
{
coordinates: [
-122.44484019999999,
37.7989071
],
timestamp: 1554772580070
},
{
coordinates: [
-122.4493488,
37.801993
],
timestamp: 1554772580117
},
{
coordinates: [
-122.44985459999998,
37.8024803
],
timestamp: 1554772580120
},
{
coordinates: [
-122.45090290000002,
37.8033639
],
timestamp: 1554772580127
},
{
coordinates: [
-122.45116330000002,
37.8034643
],
timestamp: 1554772580130
},
{
coordinates: [
-122.44840979999998,
37.8046164
],
timestamp: 1554772580166
},
{
coordinates: [
-122.44826899999998,
37.8045327
],
timestamp: 1554772580176
},
{
coordinates: [
-122.44827479999998,
37.8044851
],
timestamp: 1554772580181
},
{
coordinates: [
-122.44846849999999,
37.8043839
],
timestamp: 1554772580186
},
{
coordinates: [
-122.44856720000001,
37.8040182
],
timestamp: 1554772580200
}
]
}
]