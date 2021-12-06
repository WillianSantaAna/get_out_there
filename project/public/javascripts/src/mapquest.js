import { getCircuit, addUserScore, addTeamScore } from "./apiMethods.js";
import { getLocalStorageUser } from "./setElements.js";

L.mapquest.key = "AvxrKxXdAUzYbKny0oFxLy3v7RjndtkW";

let map;
let layerGroup;
let directions;
let distance;

let markers = [];

let intervalId;
let watcherId;

let running = false;

function clearMarker() {
  markers = [];
  layerGroup.clearLayers();

  $(".distance").text("");
  $(".save").hide();
  $(".start").hide();
  $(".route").show();

  clearInterval(intervalId);
  localStorage.removeItem("teamCircuit");

  if (directions.directionsRequest) {
    map.remove();
    createMap();
  }
}

function generateRoute() {
  if (markers.length < 2) {
    alert("Select at least 2 positions");
    return;
  }

  layerGroup.clearLayers();
  map.off("click");

  let locations = markers;

  drawRoute(locations);
}

async function getCircuitData(
  name = `Circuit ${new Date().toLocaleString("en-GB")}`
) {
  let newLocations = directions.directionsLayer.locations.map(
    (loc) => loc.latLng
  );

  let circuit = { name, coords: newLocations };

  return circuit;
}

function startRunning() {
  let locations = directions.directionsLayer.locations.map((loc) => loc.latLng);
  let achievedCheckPoint = [];

  running = true;

  clearMarker();
  drawRoute(locations);

  $(".btn-container").html(`<button class="btn btn-outline-primary quit">
          Quit Running
        </button>`);

  $(".quit").on("click", () => window.location.replace("/"));

  watcherId = navigator.geolocation.watchPosition(
    async (pos) => {
      layerGroup.clearLayers();

      let playerCurrPos = [pos.coords.latitude, pos.coords.longitude];
      let currCheckPoint = [
        locations[achievedCheckPoint.length].lat,
        locations[achievedCheckPoint.length].lng,
      ];

      if (checkPosition(playerCurrPos, currCheckPoint)) {
        achievedCheckPoint.push(currCheckPoint);
      }

      addMarker(playerCurrPos, "P");
      achievedCheckPoint.forEach((cp) => addMarker(cp, "X"));

      if (achievedCheckPoint.length === locations.length) {
        navigator.geolocation.clearWatch(watcherId);
        let result = "";

        const { usr_id, tea_id } = getLocalStorageUser();
        const userScore = await addUserScore(usr_id, distance);
        console.log(`userScore`, userScore);

        result += `<p>You won ${userScore.received_score}KMs and now have ${userScore.usr_score}KMs</p>`;

        if (tea_id && localStorage.getItem("teamCircuit")) {
          const teamScore = await addTeamScore(tea_id, distance);
          console.log(`teamScore`, teamScore);

          result += `<p>You team won ${teamScore.received_score}KMs and now have ${teamScore.tea_score}KMs</p>`;
          localStorage.removeItem("teamCircuit");
        }

        $(".finish-circuit-result").html(result);

        new bootstrap.Modal("#finish-circuit-modal").show();
        $("#finish-circuit-btn").on("click", () =>
          window.location.replace("/")
        );
      }
    },
    (err) => console.log(err),
    { enableHighAccuracy: true }
  );
}

function createMap() {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude: lat, longitude: lng } = position.coords;

      map = L.mapquest
        .map("map", {
          center: [lat, lng],
          layers: L.mapquest.tileLayer("map"),
          zoom: 14,
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

  $(".save").show();
  $(".start").show();
  $(".route").hide();

  return map;
}

function setDistance() {
  if (directions.directionsLayer.primaryRoute) {
    distance = directions.directionsLayer.primaryRoute.distance;
    $(".distance").text(`distance: ${parseFloat(distance).toFixed(2)}Km`);
  }

  if (running && intervalId) {
    map.off("click");
    clearInterval(intervalId);
  }
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
      primaryColor: "#272637",
      secondaryColor: "#084259",
      symbol,
    }),
  }).addTo(layerGroup);
}

function checkPosition(playerCurrPos, currCheckPoint) {
  const decimalPlace = 10000;
  const radius = 1;

  const playerPos = playerCurrPos.map((x) => parseInt(x * decimalPlace));
  const checkPoint = currCheckPoint.map((x) => parseInt(x * decimalPlace));

  return (
    checkPoint[0] - radius <= playerPos[0] &&
    checkPoint[0] + radius >= playerPos[0] &&
    checkPoint[1] - radius <= playerPos[1] &&
    checkPoint[1] + radius >= playerPos[1]
  );
}

export {
  clearMarker,
  drawRoute,
  generateRoute,
  getCircuitData,
  startRunning,
  createMap,
  retrieveRoute,
};
