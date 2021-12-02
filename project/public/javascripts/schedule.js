import {
  getLocalStorageUser,
  removeLocalStorageUser,
  setNavbarAndFooter,
} from "./src/setElements.js";

import {
  getCircuit,
  getUserCircuits,
  getUserScheduledCircuits,
  getUserTeamCircuits,
  addUserScheduledCircuit,
} from "./src/apiMethods.js";

$("#sign-out").on("click", () => { removeLocalStorageUser() });

window.onload = async function () {
  const user = getLocalStorageUser();

  if (user) {
    setNavbarAndFooter();
    fillCircuitSelect();
    showScheduledCircuits();
    document.querySelector('#submit').onclick = submit;
  } else {
    window.location.replace("/");
  }
}

async function fillCircuitSelect() {
  const id = getLocalStorageUser().usr_id;
  const circuits = await getUserCircuits(id);
  let html = "";
  for (let c of circuits) {
    html += `<option value="${c.cir_id}">${c.cir_name}</option>`
  }
  document.querySelector("#select_circuit").innerHTML = html;
}

async function showScheduledCircuits() {
  const id = getLocalStorageUser().usr_id;
  const userCircuits = await getUserScheduledCircuits(id);
  const teamCircuits = await getUserTeamCircuits();

  let html = '<section class="row">';

  for (let uc of userCircuits) {
    let dt = new Date(uc.uci_date)
    const cir = await getCircuit(uc.uci_cir_id);
    const cir_name = cir.cir_name;
    html +=
      `<section class="col-sm-6 mb-3">
        <section class="card">
          <section class="card-body m-2">
            <h4 class="card-title fs-3 mt-2">Solo run</h4>
            <p class="card-text fs-5 my-1">${cir_name}</p>
            <p class="card-text my-1">Scheduled for ${dt.toUTCString()}</p>
            <a href="#" class="btn btn-primary my-2 me-2">View circuit</a>
            <a href="#" class="btn btn-danger my-2">Unschedule</a>
          </section>
        </section>
      </section>`;
  }

  for (let tc of teamCircuits) {
    let dt = new Date(tc.tci_date)
    const cir = await getCircuit(tc.tci_cir_id);
    const cir_name = cir.cir_name;
    html +=
      `<section class="col-sm-6 mb-3">
        <section class="card">
          <section class="card-body">
            <h4 class="card-title fs-3 mt-2">Team run</h4>
            <p class="card-text fs-5 my-1">${cir_name}</p>
            <p class="card-text my-1">Scheduled for ${dt.toUTCString()}</p>
            <a href="#" class="btn btn-primary my-2 me-2">View circuit</a>
          </section>
        </section>
      </section>`;
  }

  html += '</section>';
  document.querySelector("#schedule").innerHTML = html;
}

async function submit() {
  const circuit_id = document.getElementById("select_circuit").value;
  const datetime = document.getElementById("input_datetime").value;

  if (!datetime || !circuit_id) {
    alert("Please fill out form completely before submitting");
  } else {
    const data = {
      datetime: datetime,
      circuit_id: circuit_id
    }
    
    try {
      await addUserScheduledCircuit(data);
    } catch (error) {
      console.log(error);
    }
  }
}
