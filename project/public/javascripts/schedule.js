import {
  getLocalStorageUser,
  removeLocalStorageUser,
  setNavbarAndFooter,
} from "./src/setElements.js";

import {
  getCircuit,
  getUserCircuits,
  getUserScheduledCircuits,
  scheduleUserCircuit,
  rescheduleUserCircuit,
  unscheduleUserCircuit,
} from "./src/apiMethods.js";

$("#sign-out").on("click", () => { removeLocalStorageUser() });

window.onload = async function () {
  const user = getLocalStorageUser();
  if (user) {
    setNavbarAndFooter();
    const circuits = await getUserCircuits(user.usr_id);
    fillCircuitSelectEl(circuits);
    showScheduledCircuits(circuits);
    $("#submit").on("click", () => { submit() });
  } else {
    window.location.replace("/");
  }
}

async function fillCircuitSelectEl(circuits) {
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
      const dtformat = dt.toUTCString().slice(0,22);
      const diffDays = ((new Date() - dt) / (1000 * 60 * 60 * 24));
      const cir_name = circuits.filter(c => c.cir_id == uc.uci_cir_id)[0].cir_name;
      html +=
        `<section class="col-sm-6 mb-3">
          <section class="card">
            <section class="card-body m-2">
              <h4 class="card-title fs-3 mt-2">Solo run</h4>
              <p class="card-text fs-5 my-1">${cir_name}</p>
              <p class="card-text my-1">Scheduled for ${dtformat}</p>`
      
      if (diffDays >= 0 && diffDays <= 1) // if up to 1 day has passed since the scheduled time, you may run
        html += `<a href="#" class="btn btn-success my-2 me-2 run-schedule" data-id="${uc.uci_id}">Run</a>` 

      html +=`<a href="#" class="btn btn-primary my-2 reschedule" onclick="return false;" data-id="${uc.uci_id}" data-date="${dtformat}">Reschedule</a>
              <a href="#" class="btn btn-danger my-2 unschedule" onclick="return false;" data-id="${uc.uci_id}">Unschedule</a>
              </section>
            </section>
          </section>`;
    }
  
    html += '</section>';
    document.querySelector("#schedule").innerHTML = html;
  
    $(".run-schedule").on("click", runCircuit);
    $(".reschedule").on("click", showRescheduleModal);
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
        await scheduleUserCircuit(data);
      } catch (error) {
        console.log(error);
      }
    }
  }
}

async function runCircuit(e) {
  const sid = e.currentTarget.dataset.id;
  localStorage.setItem("userCircuit", sid);
  window.location.replace("/circuit.html");
}

async function showRescheduleModal(e) {
  const sid = e.currentTarget.dataset.id;
  const dtformat = e.currentTarget.dataset.date;
  document.querySelector('#reschedule-modal-label').innerHTML = 'Run scheduled for ' + dtformat;
  document.querySelector('#reschedule-modal-footer').innerHTML = 
    `<a href="#" id="reschedule" class="btn btn-success my-2" onclick="return false;" data-id="${sid}">Submit</a>`;
  $("#reschedule").on("click", reschedule);
  $('#reschedule-modal').modal('show');
}

async function reschedule(e) {
  const sid = e.currentTarget.dataset.id;
  const newdatetime = document.getElementById("re-input-datetime").value;
  
  if (!newdatetime) {
    alert("Please select a new date");
  } else {
    
    if (newdatetime < new Date().toISOString()) {
      alert("Please select a future date");
    } else {
      try {
        const data = {
          newdatetime: newdatetime
        }
        await rescheduleUserCircuit(sid, data);
      } catch (error) {
        console.log(error);
      }
      window.location.reload();
    }
  }
}

async function unschedule(e) {
  const sid = e.currentTarget.dataset.id;
  if (confirm('Are you sure you want to unschedule this run?')) {
    try {
      const res = await unscheduleUserCircuit(sid);
      window.location.reload();
      return res;
    } catch (err) {
      console.log(err)
    }
  }
}
