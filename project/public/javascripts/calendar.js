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
    fillCircuitSelect();
    $("#submit").on("click", () => { submit() });
  } else {
    window.location.replace("/");
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const user = getLocalStorageUser();
  var calendarEl = document.getElementById('calendar');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 'auto',
    events: `/api/users/${user.usr_id}/schedule/calendar`,
  });

  calendar.render();

  calendar.on('dateClick', function (info) {
    if (info.date >= new Date()) {
      selected_date = info.date;
      document.querySelector('#schedule-modal-label').innerHTML = 'Schedule a new run for ' + info.date.toUTCString().slice(0,16);
      $('#schedule-modal').modal('show');
    }
  });
});

async function fillCircuitSelect() {
  const user = getLocalStorageUser();
  const circuits = await getUserCircuits(user.usr_id);
  let html = '<option value="none" selected disabled hidden>Select a circuit</option>';
  for (let c of circuits) {
    html += `<option value="${c.cir_id}">${c.cir_name}</option>`
  }
  document.querySelector("#select-circuit").innerHTML = html;
}

var selected_date;
async function submit() {

  // Adding time to selected_date
  const millisf = (h, m, s = 0) => (h*60*60+m*60+s)*1000;
  const time = document.getElementById("input-time").value;
  const time_millis = millisf(...time.split(':'));
  const datetime = new Date(selected_date.getTime() + time_millis)

  const circuit_id = document.getElementById("select-circuit").value;
  
  if (!selected_date || !time || circuit_id == 'none') {
    alert("Please fill out the form completely before submitting");
  } else {
    const data = {
      datetime: datetime,
      circuit_id: circuit_id,
    }

    try {
      await addUserScheduledCircuit(data);
    } catch (error) {
      console.log(error);
    }
  }

  window.location.reload();
}