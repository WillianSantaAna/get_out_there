import {
  getLocalStorageUser,
  setNavbarAndFooter,
} from "./src/setElements.js";

import {
  getExerciseTypes,
  getUserCircuits,
  getUserSoloExercises,
  getUserTeamExercises,
  addUserExercise,
} from "./src/apiMethods.js"; 

window.onload = async function() {
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
  let exerciseTypes = await getExerciseTypes();
  let soloExercises = await getUserSoloExercises(id);
  let teamExercises = await getUserTeamExercises(id);

  let html = '<div class="row">';
  for (let e of soloExercises) {
    for (let ety of exerciseTypes) {
      if (e.uex_ety_id == ety.ety_id) {
        let dt = new Date(e.uex_date)
        html += 
        `<div class="col-sm-6 mb-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Solo ${ety.ety_name}</h5>
              <p class="card-text">Scheduled for ${dt.toUTCString()}</p>
              <a href="#" class="btn btn-primary">View circuit</a>
            </div>
          </div>
        </div>`;
        break;
      }
    }
  }

  for (let e of teamExercises) {
    for (let ety of exerciseTypes) {
      if (e.tex_ety_id == ety.ety_id) {
        let dt = new Date(e.tex_date)
        html += 
        `<div class="col-sm-6 mb-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Team ${ety.ety_name}</h5>
              <p class="card-text">Scheduled for ${dt.toUTCString()}</p>
              <a href="#" class="btn btn-primary">View circuit</a>
            </div>
          </div>
        </div>`;
        break;
      }
    }
  }
  html += '</div>';
  document.querySelector("#schedule").innerHTML = html;
}

async function submit() {

  let datetime = document.getElementById("datetime").value;
  let circuit = document.getElementById("circuitSelect").value;
  let modes = document.getElementsByName("modeSelect");
  let mode;
  for (let m of modes) if (m.checked) mode = m.value;

  if (!datetime || !circuit || !mode) {
    alert("Please fill out form completely before submitting");
  } else {
    let data = { 
      datetime: datetime, 
      circuitId: circuit,
      exerciseTypeId: mode, 
    }
    let userId = getLocalStorageUser().usr_id;
  
    try {
      await addUserExercise(userId, data);
    } catch (error) {
      console.log(error);
    }
    window.location.reload();
  }
}
