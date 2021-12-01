import {
  getLocalStorageUser,
  setNavbarAndFooter,
} from "./src/setElements.js";

import {
  getCircuit,
  getUserCircuits,
  getUserScheduledCircuits,
  //getUserTeamExercises,
  addUserScheduledCircuit,
} from "./src/apiMethods.js";

window.onload = async function () {
  let id = getLocalStorageUser().usr_id;
  setNavbarAndFooter();
  document.querySelector('#submit').onclick = submit;

  fillCircuitSelect(id);
  showExercises(id);
}

async function fillCircuitSelect(id) {
  let circuits = await getUserCircuits(id);
  let html = "";
  for (let c of circuits) {
    html += `<option value="${c.cir_id}">${c.cir_name}</option>`
  }
  document.querySelector("#circuitSelect").innerHTML = html;
}

async function showExercises(id) {
  const schCircuits = await getUserScheduledCircuits(id);
  //let teamExercises = await getUserTeamExercises(id);

  let html = '<section class="row">';
  for (let s of schCircuits) {
    let dt = new Date(s.uci_date)
    const cir = await getCircuit(s.uci_cir_id);
    const cir_name = cir.cir_name;
    html +=
      `<section class="col-sm-6 mb-3">
          <section class="card">
            <section class="card-body">
              <p class="card-text">${cir_name}</p>
              <p class="card-text">Scheduled for ${dt.toUTCString()}</p>
              <a href="#" class="btn btn-primary">View circuit</a>
            </section>
          </section>
        </section>`;
  }

  html += '</section>';
  document.querySelector("#schedule").innerHTML = html;
}

async function submit() {
  let datetime = document.getElementById("datetime").value;
  let circuit_id = document.getElementById("circuitSelect").value;

  if (!datetime || !circuit_id) {
    alert("Please fill out form completely before submitting");
  } else {
    let data = {
      datetime: datetime,
      circuitId: circuit_id
    }
    let userId = getLocalStorageUser().usr_id;

    try {
      await addUserScheduledCircuit(userId, data);
    } catch (error) {
      console.log(error);
    }
    window.location.reload();
  }
}
