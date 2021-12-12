import {
  getLocalStorageUser,
  removeLocalStorageUser,
} from "./src/setElements.js";
import {
  addCircuit,
  getUserCircuits,
  getUserScheduledById,
  removeUserCircuit,
} from "./src/apiMethods.js";
import {
  clearMarker,
  drawRoute,
  generateRoute,
  getCircuitData,
  startRunning,
  createMap,
  retrieveRoute,
} from "./src/mapquest.js";

$("#sign-out").on("click", removeLocalStorageUser);
$(".clear").on("click", clearMarker);
$(".route").on("click", generateRoute);
$("#confirm-circuit-save").on("click", saveRoute);
$(".start").on("click", startRunning);

window.onload = async () => {
  if (!getLocalStorageUser()) {
    window.location.replace("/");
  }

  createMap();
  setUserCircuits();

  $(".save").hide();
  $(".start").hide();

  localStorage.removeItem("activeUserCircuit");
  localStorage.removeItem("activeTeamCircuit");

  const teamCircuit = JSON.parse(localStorage.getItem("teamCircuit"));
  const userScheduleId = JSON.parse(localStorage.getItem("userCircuit"));

  if (teamCircuit) {
    localStorage.removeItem("teamCircuit");
    localStorage.removeItem("activeUserCircuit");
    localStorage.setItem("activeTeamCircuit", JSON.stringify(teamCircuit));

    setTimeout(() => {
      drawRoute(teamCircuit.cir_coords);
    }, 1000);
  }

  if (userScheduleId) {
    const userSchedule = await getUserScheduledById(userScheduleId);

    localStorage.removeItem("userCircuit");
    localStorage.removeItem("activeTeamCircuit");
    localStorage.setItem("activeUserCircuit", JSON.stringify(userSchedule));

    setTimeout(async () => {
      drawRoute(userSchedule.cir_coords);
    }, 1000);
  }
};

async function saveRoute() {
  let circuit = await getCircuitData($("#circuit-name").val() || undefined);

  const result = await addCircuit(circuit);

  $("#circuit-name").val("");
  alert(result.msg);
  setUserCircuits();
}

async function setUserCircuits() {
  const { usr_id } = getLocalStorageUser();
  const userCircuits = await getUserCircuits(usr_id);

  const circuitsLinks = userCircuits.map(({ cir_id, cir_name }) => {
    return `
    <section class="d-flex justify-content-between">
      <a class="btn btn-link cir-btn" data-bs-dismiss="offcanvas" data-id=${cir_id}>${cir_name}</a>
      <a class ="remove-cir" data-id=${cir_id} data-bs-toggle="modal" data-bs-target="#remove-circuit-modal">
        <i class="las la-window-close red fs-3"></i>
      </a>
    </section>`;
  });

  $(".offcanvas-body").html(circuitsLinks);
  $(".cir-btn").on("click", retrieveRoute);
  $(".remove-cir").on("click", (e) =>
    sessionStorage.setItem("remove_circuit_id", e.currentTarget.dataset.id)
  );
  $("#cancel-circuit-remove").on("click", () =>
    sessionStorage.removeItem("remove_circuit_id")
  );
  $("#confirm-circuit-remove").on("click", removeCircuit);
}

async function removeCircuit() {
  const circuitId = sessionStorage.getItem("remove_circuit_id");
  const result = await removeUserCircuit(circuitId);

  await setUserCircuits();

  alert(result.msg);
  window.location.reload();
}
