import {
  setYear,
  setNavbar,
  removeLocalStorageUser,
} from "./src/setElements.js";

L.mapquest.key = "AvxrKxXdAUzYbKny0oFxLy3v7RjndtkW";

let map;
let locations = [];
let layerGroup;
let directions;
let intervalId;

window.onload = () => {
  setYear();
  setNavbar();

  $(".logout").click(() => {
    removeLocalStorageUser();
    window.location.replace("/");
  });

  createMap();
};

$(window).on("resize", setNavbar);
$(".clear").on("click", clearMarker);
$(".route").on("click", generateRoute);
$(".save").on("click", saveRoute);
$(".retrieve").on("click", retrieveRoute);

function clearMarker() {
  locations = [];
  layerGroup.clearLayers();
  $(".dist-time").text("");
  clearInterval(intervalId);

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

  intervalId = setInterval(setDistance, 1000);
}

function saveRoute() {
  let newLocations = directions.directionsLayer.locations.map(
    (loc) => loc.latLng
  );

  localStorage.setItem("route", JSON.stringify(newLocations));
}

function retrieveRoute() {
  locations = JSON.parse(localStorage.getItem("route"));
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
