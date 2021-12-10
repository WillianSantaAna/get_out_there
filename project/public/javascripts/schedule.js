import {
  getLocalStorageUser,
  removeLocalStorageUser,
  setNavbarAndFooter,
} from "./src/setElements.js";

import {
  getCircuit,
  getUserCircuits,
  getUserScheduledCircuits,
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
  let html = '<option value="none" selected disabled hidden>Select a circuit</option>';
  for (let c of circuits) {
    html += `<option value="${c.cir_id}">${c.cir_name}</option>`
  }
  document.querySelector("#select-circuit").innerHTML = html;
}

async function showScheduledCircuits(circuits) {
  const userCircuits = await getUserScheduledCircuits();

  if (userCircuits.length > 0) {
    let html = '<section class="row">';
    for (let uc of userCircuits) {
      const dt = new Date(uc.uci_date);
      const diffDays = ((new Date() - dt) / (1000 * 60 * 60 * 24));
      const cir_name = circuits.filter(c => c.cir_id == uc.uci_cir_id)[0].cir_name;
      html +=
        `<section class="col-sm-6 mb-3">
          <section class="card">
            <section class="card-body m-2">
              <h4 class="card-title fs-3 mt-2">Solo run</h4>
              <p class="card-text fs-5 my-1">${cir_name}</p>
              <p class="card-text my-1">Scheduled for ${dt.toUTCString()}</p>`

      if (diffDays >= 0 && diffDays <= 1) // if up to 1 day has passed since the scheduled time, you may run
        html += `<a href="#" class="btn btn-success my-2 me-2 run-schedule" data-id="${uc.uci_cir_id}">Run</a>` 

      html += 
              `<a href="#" class="btn btn-danger my-2 unschedule" data-id="${uc.uci_id}">Unschedule</a>
              </section>
            </section>
          </section>`;
    }
  
    html += '</section>';
    document.querySelector("#schedule").innerHTML = html;
  
    $(".run-schedule").on("click", runCircuit);
    $(".unschedule").on("click", unschedule);
    
  } else {
    let html = '<section class="d-flex justify-content-center">';
    html += '<p class="h4" style="color:grey;">No runs scheduled</p>'
    html += '</section>';
    document.querySelector("#schedule").innerHTML = html;
  }
}

async function submit() {
  const datetime = document.getElementById("input-datetime").value;
  const circuit_id = document.getElementById("select-circuit").value;

  if (!datetime || circuit_id == 'none') {
    alert("Please fill out the form completely before submitting");
  } else {
    console.log(datetime, new Date().toISOString());
    if (datetime < new Date().toISOString()) {
      alert("Please select a future date");
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
}

async function runCircuit(e) {
  const id = e.currentTarget.dataset.id;
  const cir = await getCircuit(id);
  localStorage.setItem("userCircuit", JSON.stringify(cir));
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
