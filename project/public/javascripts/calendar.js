import {
  getLocalStorageUser,
  removeLocalStorageUser,
  setNavbarAndFooter,
} from "./src/setElements.js";

import {
  getCircuit,
  getUserCircuits,
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

    $('#myModal').on('hidden.bs.modal', function (e) {
      selected_date = null;
    })
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

    dateClick: function (info) {
      let dt = new Date();
      if (info.date >= dt.setDate(dt.getDate() - 1)) {
        selected_date = info.date;
        document.querySelector('#schedule-modal-label').innerHTML = 'Schedule a new run for ' + info.date.toUTCString().slice(0, 16);

        $('#schedule-modal').modal('show');
      }
    },

    eventMouseEnter: function (info) {
      info.el.style.cursor = 'pointer';
    },

    eventClick: function (info) {
      document.querySelector('#event-modal-label').innerHTML = 'Solo run scheduled for ' + info.event.start.toUTCString().slice(0, 16);
      document.querySelector('#circuit-name').innerHTML = info.event.title + ', ' + info.event.start.toISOString().slice(11,16);

      let html = "";
      const dt = new Date(info.event.start);
      const diffDays = ((new Date() - dt) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 1)
        html = `<a href="#" id="run-schedule" class="btn btn-success my-2 me-2" data-id="${info.event.extendedProps.circuitId}">Run</a>`
      html += `<a href="#" id="unschedule" class="btn btn-danger my-2" data-id="${info.event.id}">Unschedule</a>`
      document.querySelector('#event-modal-footer').innerHTML = html;

      $("#run-schedule").on("click", runCircuit);
      $("#unschedule").on("click", unschedule);
      
      $('#event-modal').modal('show');
    },
  });

  calendar.render();
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
  const millisf = (h, m, s = 0) => (h * 60 * 60 + m * 60 + s) * 1000;
  const time = document.getElementById("input-time").value;
  const time_millis = millisf(...time.split(':'));
  const datetime = new Date(selected_date.getTime() + time_millis).toISOString();

  const circuit_id = document.getElementById("select-circuit").value;

  if (!datetime || circuit_id == 'none') {
    alert("Please fill out the form completely before submitting");
  } else {
    console.log(datetime, new Date().toISOString())
    if (datetime < new Date().toISOString()) {
      alert("Please select a future date");
    } else {
      const data = {
        datetime: datetime,
        circuit_id: circuit_id,
      }

      try {
        const res = await addUserScheduledCircuit(data);
        return res;
      } catch (error) {
        console.log(error);
      }
      window.location.reload();
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

  if (confirm('Are you sure you want to unschedule this run?')) {
    try {
      const res = await removeUserScheduledCircuit(sid);
      window.location.reload();
      return res;
    } catch (err) {
      console.log(err)
    }
  } else {
    // Do nothing!
  }
}
