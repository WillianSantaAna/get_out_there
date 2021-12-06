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
  removeUserScheduledCircuit,
} from "./src/apiMethods.js";

$("#sign-out").on("click", () => { removeLocalStorageUser() });

window.onload = async function () {
  const user = getLocalStorageUser();
  if (user) {
    setNavbarAndFooter();
    const circuits = await getUserCircuits(user.usr_id);
    fillCircuitSelect(circuits);
    showScheduledCircuits(circuits);
    $("#submit").on("click", () => { submit() });
  } else {
    window.location.replace("/");
  }
}

async function fillCircuitSelect(circuits) {
  const id = getLocalStorageUser().usr_id;
  let html = "";
  for (let c of circuits) {
    html += `<option value="${c.cir_id}">${c.cir_name}</option>`
  }
  document.querySelector("#select-circuit").innerHTML = html;
}

async function showScheduledCircuits(circuits) {
  const userCircuits = await getUserScheduledCircuits();

  let html = '<section class="row">';

  for (let uc of userCircuits) {
    let dt = new Date(uc.uci_date)
    const cir_name = circuits.filter(c => c.cir_id == uc.uci_cir_id)[0].cir_name;
    html +=
      `<section class="col-sm-6 mb-3">
        <section class="card">
          <section class="card-body m-2">
            <h4 class="card-title fs-3 mt-2">Solo run</h4>
            <p class="card-text fs-5 my-1">${cir_name}</p>
            <p class="card-text my-1">Scheduled for ${dt.toUTCString()}</p>
            <a href="#" class="btn btn-primary my-2 me-2 view-circuit" data-id="${uc.uci_cir_id}">View circuit</a>
            <a href="#" class="btn btn-danger my-2 unschedule" data-id="${uc.uci_id}">Unschedule</a>
          </section>
        </section>
      </section>`;
  }

  const user = getLocalStorageUser();
  if (user.tea_id != null) {
    const teamCircuits = await getUserTeamCircuits();
    for (let tc of teamCircuits) {
      let dt = new Date(tc.tci_date)
      const cir = await getCircuit(tc.tci_cir_id);
      const cir_name = circuits.filter(c => c.cir_id == tc.tci_cir_id)[0].cir_name;
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
  }

  html += '</section>';
  document.querySelector("#schedule").innerHTML = html;

  $(".view-circuit").on("click", viewCircuit);
  $(".unschedule").on("click", unschedule);
}

async function submit() {
  const circuit_id = document.getElementById("select-circuit").value;
  const datetime = document.getElementById("input-datetime").value;

  if (!datetime || !circuit_id) {
    alert("Please fill out the form completely before submitting");
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

async function viewCircuit(e) {
  const id = e.currentTarget.dataset.id;
  const cir = await getCircuit(id);
  localStorage.setItem("viewCircuit", JSON.stringify(cir));
  window.location.replace("/circuit.html");
}

async function unschedule(e) {
  const sid = e.currentTarget.dataset.id;
  try {
    const res = await removeUserScheduledCircuit(sid);
    location.reload();
    return res;
  } catch (err) {
    console.log(err)
  }
}
