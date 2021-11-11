import { getLocalStorageUser, setNavbarAndFooter } from "./src/setElements.js";
import { getCircuit, addCircuit, getUserCircuits } from "./src/apiMethods.js";

L.mapquest.key = "AvxrKxXdAUzYbKny0oFxLy3v7RjndtkW";

let map;
let locations = [];
let layerGroup;
let directions;
let intervalId;
let circuitId;

window.onload = () => {
  setNavbarAndFooter();
  createMap();
  setUserCircuits();
};

$(".clear").on("click", clearMarker);
$(".route").on("click", generateRoute);
$(".save").on("click", saveRoute);

function clearMarker() {
  locations = [];
  layerGroup.clearLayers();
  $(".dist-time").text("");
  clearInterval(intervalId);
  $(".save").prop("disabled", true);

  if (directions.directionsRequest) {
    map.remove();
    createMap();
  }
}

function generateRoute() {
  layerGroup.clearLayers();
  map.off("click");

  directions.route({
    locations,
    options: {
      unit: "k",
      routeType: "pedestrian",
    },
  });

  $(".save").prop("disabled", false);
  intervalId = setInterval(setDistance, 1000);
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

  circuitId = await addCircuit(circuit);

  console.log(circuitId);

  setUserCircuits();
}

async function retrieveRoute(e) {
  const id = e.currentTarget.dataset.id;

  const circuit = await getCircuit(id);

  locations = circuit.cir_coords;

  generateRoute();
}

function addMarker(e) {
  locations.push(e.latlng);

  L.marker(e.latlng, {
    icon: L.mapquest.icons.marker({
      primaryColor: "#22407F",
      secondaryColor: "#3B5998",
      symbol: locations.length,
    }),
  }).addTo(layerGroup);
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

      map.on("click", addMarker);
    },
    (error) => {
      console.log("can't get position");
      console.log(error);
    }
  );
}

function setDistance() {
  if (directions.directionsLayer.primaryRoute) {
    const { distance } = directions.directionsLayer.primaryRoute;
    $(".dist-time").text(`distance: ${parseFloat(distance).toFixed(2)}Km`);
  }
}

async function setUserCircuits() {
  const { usr_id } = getLocalStorageUser();
  const userCircuits = await getUserCircuits(usr_id);

  const circuitsLinks = userCircuits.map(({ cir_id, cir_name }) => {
    return `<button class="btn btn-link cir-btn" data-bs-dismiss="offcanvas" data-id=${cir_id}>${cir_name}</button>`;
  });

  $(".offcanvas-body").append(circuitsLinks);
  $(".cir-btn").on("click", retrieveRoute);
}
