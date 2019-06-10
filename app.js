/* global document, google */
import {GoogleMapsOverlay} from '@deck.gl/google-maps';
import {GeoJsonLayer, ScatterplotLayer} from '@deck.gl/layers';
import {TripsLayer} from '@deck.gl/geo-layers';

// Set your Google Maps API key here or via environment variable
const GOOGLE_MAPS_API_KEY = process.env.GoogleMapsAPIKey; // eslint-disable-line
const GOOGLE_MAPS_API_URL = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
const MAP_CENTER = {lat: 1.276347, lng: 103.799532};
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

async function getTrips(map) {
  const PLACES_SERVICE = new google.maps.places.PlacesService(map);
  const OPTIONS = {
    location: new google.maps.LatLng(MAP_CENTER),
    radius: '1000',
    type: ['restaurant']
  };
  let places_request = new Promise((resolve, reject) => {
    PLACES_SERVICE.nearbySearch(OPTIONS, (res, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        reject(status);
      }
      resolve(res)
    });
  });
  let places = await places_request;
  let trips = [];
  for (let i = 0; i < places.length; i++) {
    const START = places[i].geometry.location.lat() + ',' + places[i].geometry.location.lng();
    for (let j = i+1; j<places.length; j++) {
      const END = places[j].geometry.location.lat() + ',' + places[j].geometry.location.lng();
      let directions = await getDirections(START, END);
      trips.push(directions);  
    }
    
  }
  // const START = `${MAP_CENTER.lat},${MAP_CENTER.lng}`;
  // trips = Promise.all(trips.map(async(trip) => {
  //   const END = `${trip.geometry.location.lat()},${trip.geometry.location.lng()}`;
  //   return await getDirections(START, END);    
  // }));
  return await trips;
}

// async function formatTrips (trips) {
//   trips = trips.filter(trip => {
//     if(trip.pickup_centroid_latitude !== trip.dropoff_centroid_latitude &&
//       trip.pickup_centroid_longitude !== trip.dropoff_centroid_longitude) {
//       return true;
//     }
//   })
//   trips = trips.map(async (trip) => {
//     let start_time = new Date(trip.trip_start_timestamp).getTime();
//     let end_time = new Date(trip.trip_end_timestamp).getTime();
//     let pickup_coords = [trip.pickup_centroid_latitude, trip.pickup_centroid_longitude];
//     let dropoff_coords = [trip.dropoff_centroid_latitude, trip.dropoff_centroid_longitude]
//     let waypoints = await getDirections(pickup_coords, dropoff_coords);
//     return {
//       'waypoints': [
//         {
//           coords: pickup_coords.reverse(), 
//           timestamp: start_time
//         }, 
//         {
//           coords: dropoff_coords.reverse(),
//           timestamp: end_time
//         },          
//       ]
//     }    
//   });
//   console.log(trips)
//   return trips;
// }

async function getDirections (start, end) {
  let request = fetch(`http://localhost:1337/directions?start=${start}&end=${end}`)
  let response = await request;
  response = await response.json();
  return response;
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
    center: MAP_CENTER,
    zoom: 14,
    styles: MAP_STYLES
  });
  let TRIPS = getTrips(map);    
console.log(TRIPS)  
  let current_time = 0;
  const OVERLAY = new GoogleMapsOverlay({
    layers: [
      new TripsLayer({
        id: 'trips-layer',
        data: TRIPS,
        getPath: d => d.segments,
        getColor: [253, 128, 93],
        opacity: 0.7,
        widthMinPixels: 2,
        rounded: true,
        trailLength: 200,
        currentTime: current_time
      })
    ]
  });
  OVERLAY.setMap(map);
  
  setInterval(()=> {
    current_time+=1;
    OVERLAY.setProps({layers: [
      new TripsLayer({
        id: 'trips-layer',
        data: TRIPS,
        getPath: d => d.segments,
        getColor: [253, 128, 93],
        opacity: 0.7,
        widthMinPixels: 2,
        rounded: true,
        trailLength: 200,
        currentTime: current_time
      })
      ]})
    console.log(OVERLAY)
  }, 30)
});