import {
  getLocalStorageUser,
  removeLocalStorageUser,
  setNavbarAndFooter,
} from "./src/setElements.js";

import {
  getUserCircuits,
  scheduleUserCircuit,
  rescheduleUserCircuit,
  unscheduleUserCircuit,
} from "./src/apiMethods.js";

$("#sign-out").on("click", () => { removeLocalStorageUser() });

window.onload = async function () {
  const user = getLocalStorageUser();
  if (user) {
    setNavbarAndFooter();
    fillCircuitSelectEl();

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
    eventStartEditable: true,

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
      document.querySelector('#circuit-info').innerHTML = info.event.title + ', ' + info.event.start.toISOString().slice(11, 16);

      let html = "";
      const dt = new Date(info.event.start);
      const diffDays = ((new Date() - dt) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 1)
        html = `<a href="#" id="run-schedule" class="btn btn-success my-2 me-2" data-id="${info.event.id}">Run</a>`
      html += `<a href="#" id="unschedule" class="btn btn-danger my-2" onclick="return false;" data-id="${info.event.id}">Unschedule</a>`
      document.querySelector('#event-modal-footer').innerHTML = html;

      $("#run-schedule").on("click", runCircuit);
      $("#unschedule").on("click", unschedule);

      $('#event-modal').modal('show');
    },

    eventDrop: function (info) {
      const sid = info.event.id;
      const newdatetime = info.event.start;

      let dt = new Date();
      if (newdatetime > dt.setDate(dt.getDate() - 1)) {
        document.querySelector('#reschedule-info').innerHTML = info.oldEvent.start.toUTCString().slice(0, 16) + " → " + info.event.start.toUTCString().slice(0, 16);

        let html =
          `<a href="#" id="cancel-reschedule" class="btn btn-danger my-2" onclick="window.location.reload(); return false;">Cancel</a>` +
          `<a href="#" id="confirm-reschedule" class="btn btn-success my-2" onclick="$('#reschedule-modal').modal('hide'); return false;" data-id="${sid}" data-newdatetime="${newdatetime}">Confirm</a>`
        document.querySelector('#reschedule-modal-footer').innerHTML = html;

        $("#confirm-reschedule").on("click", reschedule);

        $('#reschedule-modal').modal('show');
      } else {
        info.revert();
      }
    },
  });

  calendar.render();
});

async function fillCircuitSelectEl() {
  const user = getLocalStorageUser();
  const circuits = await getUserCircuits(user.usr_id);
  let html = '<option value="none" selected disabled hidden></option>';
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
        const res = await scheduleUserCircuit(data);
        return res;
      } catch (error) {
        console.log(error);
      }
      window.location.reload();
    }
  }
}

async function runCircuit(e) {
  const sid = e.currentTarget.dataset.id;
  localStorage.setItem("userCircuit", sid);
  window.location.replace("/circuit.html");
}

async function reschedule(e) {
  const sid = e.currentTarget.dataset.id;
  const newdatetime = e.currentTarget.dataset.newdatetime;

  try {
    const data = {
      newdatetime: newdatetime,
    }
    const res = await rescheduleUserCircuit(sid, data);
    return res;
  } catch (err) {
    console.log(err)
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
