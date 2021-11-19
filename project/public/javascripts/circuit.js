import { getLocalStorageUser, setNavbarAndFooter } from "./src/setElements.js";
import { getCircuit, addCircuit, getUserCircuits } from "./src/apiMethods.js";

L.mapquest.key = "AvxrKxXdAUzYbKny0oFxLy3v7RjndtkW";

let map;
let layerGroup;
let directions;

let markers = [];

let intervalId;
let watcherId;

let running = false;

window.onload = () => {
  setNavbarAndFooter();
  createMap();
  setUserCircuits();
};

$(".route").on("click", generateRoute);
$(".save").on("click", saveRoute);
$(".start").on("click", startRunning);

function clearMarker() {
  markers = [];
  layerGroup.clearLayers();

  $(".dist-time").text("");
  clearInterval(intervalId);
  // navigator.geolocation.clearWatch(watcherId);
  $(".save").prop("disabled", true);
  $(".start").prop("disabled", true);

  $(".route").text("Route");
  $(".route").off();
  $(".route").on("click", generateRoute);

  if (directions.directionsRequest) {
    map.remove();
    createMap();
  }
}

function generateRoute() {
  layerGroup.clearLayers();
  map.off("click");

  let locations = markers;

  drawRoute(locations);
}

async function saveRoute() {
  let newLocations = directions.directionsLayer.locations.map(
    (loc) => loc.latLng
  );

  const { usr_id } = getLocalStorageUser();

  const date = new Date();

  const name = `Circuit ${date.getDate()}/${
    date.getMonth() + 1
  } - ${date.getHours()}:${date.getMinutes()}`;

  let circuit = { name, userId: usr_id, coords: newLocations };

  await addCircuit(circuit);

  setUserCircuits();
}

function startRunning() {
  let index = 0;
  let locations = directions.directionsLayer.locations.map((loc) => loc.latLng);
  let achievedCheckPoint = [];

  running = true;

  clearMarker();
  drawRoute(locations);

  $(".btn-container").html(`<button class="btn btn-outline-primary quit">
          Quit Running
        </button>`);

  $(".quit").on("click", () => window.location.replace("/"));

  watcherId = navigator.geolocation.watchPosition((pos) => {
    layerGroup.clearLayers();

    let currLatLng = [pos.coords.latitude, pos.coords.longitude];
    let currCheckPoint = [locations[index].lat, locations[index].lng];

    currLatLng = currLatLng.map((x) => x.toFixed(4));
    currCheckPoint = currCheckPoint.map((x) => x.toFixed(4));

    if (
      currLatLng[0] === currCheckPoint[0] &&
      currLatLng[1] === currCheckPoint[1]
    ) {
      index++;
      achievedCheckPoint.push([locations[index].lat, locations[index].lng]);
      $(".result").append(
        `<p>currLatLng = ${currLatLng.toString()} currCheckPoint ${currCheckPoint.toString()}</p> ChekPoint!`
      );
    } else {
      $(".result").append(
        `<p>currLatLng = ${currLatLng.toString()} currCheckPoint ${currCheckPoint.toString()}</p>`
      );
    }

    addMarker(currLatLng, "P");
    achievedCheckPoint.forEach((cp) => addMarker(cp, "X"));

    if (index === locations.length) {
      navigator.geolocation.clearWatch(watcherId);
      $(".dist-time").text(`Finished!`);
    }

    // console.log(`currLatLng fixed`, currLatLng);
    // console.log(`currCheckPoint fixed`, currCheckPoint);
  });
}

function createMap() {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude: lat, longitude: lng } = position.coords;

      map = L.mapquest
        .map("map", {
          center: [lat, lng],
          layers: L.mapquest.tileLayer("map"),
          zoom: 12,
          scale: "metric",
        })
        .addControl(L.mapquest.locatorControl());

      directions = L.mapquest.directions();

      layerGroup = L.layerGroup().addTo(map);

      map.on("click", mapClick);
    },
    (error) => {
      console.log("can't get position");
      console.log(error);
    }
  );
}

function drawRoute(locations) {
  $(".route").text("Clear");
  $(".route").off();
  $(".route").on("click", clearMarker);

  directions.route(
    {
      locations,
      options: {
        unit: "k",
        routeType: "pedestrian",
        maxRoutes: 1,
      },
    },
    directionsCallback
  );
}

function directionsCallback(error, response) {
  var directionsLayer = L.mapquest
    .directionsLayer({
      directionsResponse: response,
    })
    .addTo(map);

  directions.directionsLayer = directionsLayer;

  intervalId = setInterval(setDistance, 1000);

  $(".save").prop("disabled", false);
  $(".start").prop("disabled", false);

  return map;
}

function setDistance() {
  if (directions.directionsLayer.primaryRoute) {
    const { distance } = directions.directionsLayer.primaryRoute;
    $(".dist-time").text(`distance: ${parseFloat(distance).toFixed(2)}Km`);
  }

  if (running && intervalId) {
    map.off("click");
    clearInterval(intervalId);
  }
}

async function setUserCircuits() {
  const { usr_id } = getLocalStorageUser();
  const userCircuits = await getUserCircuits(usr_id);

  const circuitsLinks = userCircuits.map(({ cir_id, cir_name }) => {
    return `<button class="btn btn-link cir-btn" data-bs-dismiss="offcanvas" data-id=${cir_id}>${cir_name}</button>`;
  });

  $(".offcanvas-body").html(circuitsLinks);
  $(".cir-btn").on("click", retrieveRoute);
}

async function retrieveRoute(e) {
  clearMarker();
  const id = e.currentTarget.dataset.id;

  const circuit = await getCircuit(id);

  drawRoute(circuit.cir_coords);
}

function mapClick(e) {
  let latLng = e.latlng;

  markers.push(latLng);

  addMarker(latLng, markers.length);
}

function addMarker(location, symbol) {
  L.marker(location, {
    icon: L.mapquest.icons.marker({
      primaryColor: "#22407F",
      secondaryColor: "#3B5998",
      symbol,
    }),
  }).addTo(layerGroup);
}

// function startRunning() {
//   console.log("ToDo");
//   let index = 0;
//   let routeLocations = directions.directionsLayer.locations.map(
//     (loc) => loc.latLng
//   );
//   let achievedCheckPoint = [];
//   clearMarker();
//   locations = routeLocations;
//   generateRoute();
//   clearInterval(intervalId);
//   positionWatcherId = navigator.geolocation.watchPosition(
//     (pos) => {
//       layerGroup.clearLayers();
//       let currLatLng = [pos.coords.latitude, pos.coords.longitude];
//       let currCheckPoint = [locations[index].lat, locations[index].lng];
//       addMarker(currLatLng, "P");
//       // console.log(`currLatLng`, currLatLng);
//       // console.log(`currCheckPoint`, currCheckPoint);
//       if (
//         currLatLng[0].toFixed(4) === currCheckPoint[0].toFixed(4) &&
//         currLatLng[1].toFixed(4) === currCheckPoint[1].toFixed(4)
//       ) {
//         achievedCheckPoint.push(currCheckPoint);
//         for (let curr of achievedCheckPoint) {
//           addMarker(curr, "X");
//         }
//         index++;
//       }
//       if (index === locations.length) {
//         $(".dist-time").text(`Concluido!`);
//       }
//     },
//     (error) => {
//       console.log(error);
//     }
//   );
// }
