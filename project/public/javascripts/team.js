import { getLocalStorageUser, setLocalStorageUser, removeLocalStorageUser } from "./src/setElements.js";
import {
  getTeam,
  getTeamMembers,
  getTeamSchedules,
  addInvite,
  kickMember,
  getTeamSchedule,
  getCircuit 
} from "./src/apiMethods.js";
import {
  clearMarker,
  generateRoute,
  saveRoute,
  createMap,
  retrieveRoute
} from "./src/mapquest.js";

$("#sign-out").on("click", () => { removeLocalStorageUser() });

$("#schedule-modal").on("shown.bs.modal", function () {
  window.dispatchEvent(new Event('resize'));
});

window.onload = async () => {
  const user = getLocalStorageUser();

  createMap();

  await setTeamCircuits(user.tea_id);

  $(".save").hide();

  if (user) {
    if (user.tea_id !== null) {
      $("#team-content").css("display", "block");

      try {
        const team = await getTeam(user.tea_id);

        $("#team-info #team-name").html(team.tea_name);
        $("#team-info #team-score").html(`<p class="card-text fw-bold m-0">${team.tea_score} KMs</p>`);

        if (team.tea_admin_id === user.usr_id) {
          $("#btn-member").html(`<a data-bs-toggle="modal" data-bs-target="#invitation-modal"
          class="btn btn-success text-center p-2 d-flex align-items-center align-self-start"><i
            class="las la-plus fs-3 d-flex"></i></a>`);

          $("#btn-add-circuit").html(`<a data-bs-toggle="modal" data-bs-target="#schedule-modal"
          class="btn btn-success text-center p-2 d-flex align-items-center align-self-start"><i
            class="las la-plus fs-3 d-flex"></i></a>`);
        } else {
          $("#btn-member").html(`<a id="leave" class="btn btn-danger text-center px-3 py-2 d-flex align-items-center align-self-start">Leave</a>`);
        }

        let membersHtml = `<section><p class="fw-bold fs-4 mb-0">${team.tea_admin} (Admin)</p></section>`;

        const members = await getTeamMembers(user.tea_id);

        for (let member of members) {
          membersHtml += `<section class="d-flex justify-content-between align-items-center">
            <p class="fw-bold fs-4 mb-0">${member.usr_name}</p>`;

          if (team.tea_admin_id === user.usr_id) {
            membersHtml += `<a class="kick-member" data-id="${member.tme_id}" style="cursor: pointer;"><i class="las la-window-close red fs-3"></i></a>`;
          }

          membersHtml += `</section>`;
        }

        $("#team-members").html(membersHtml);

        const schedules = await getTeamSchedules(user.tea_id);

        let scheduleHtml = '';

        for (let schedule of schedules) {
          scheduleHtml += `<section class="d-flex justify-content-between align-items-center">
            <p class="fw-bold fs-4 mb-0">${schedule.cir_name}</p>
            <button class="btn main-blue-bg p-2 run-schedule" data-id="${schedule.tci_id}"><i class="las la-running fs-3 main-white d-flex"></i></i></button>
          </section>`;
        }

        $("#team-circuits").html(scheduleHtml);
      } catch (error) {
        console.log(error);
      }

      $("#invitation").on("click", async () => {

        try {
          const result = await addInvite({ teamId: user.tea_id });

          $("#code").html(result.inv_code);
          $("#copy-code").removeAttr("disabled");

        } catch (error) {
          console.log(error.responseText)
        }
      });

      $("#copy-code").on("click", () => {
        let code = $("#code").text();
        navigator.clipboard.writeText(code);

        alert(`Copied code ${code} to Clipboard`);
      });

      $(".kick-member").on("click", async (e) => {
        let teamMemberId = e.currentTarget.getAttribute('data-id');

        try {
          const result = await kickMember({ tmeId: teamMemberId });

          if (result) {
            window.location.reload();
          }

        } catch (error) {
          console.log(error.responseText)
        }
      });

      $("#leave").on("click", async () => {
        try {
          const result = await kickMember(user.usr_id, user.tea_id);

          if (result) {
            user.tea_id = null;
            setLocalStorageUser(user);
            window.location.reload();
          }

        } catch (error) {
          console.log(error.responseText)
        }
      });

      $(".run-schedule").on("click", async (e) => {
        try {
          let scheduleId = e.currentTarget.getAttribute("data-id");

          const result = await getTeamSchedule(user.tea_id, scheduleId);

          localStorage.setItem("teamCircuit", JSON.stringify(result));

          window.location.replace("/circuit.html");
        } catch (error) {
          console.log(error);
        }       
      });

      $(".clear").on("click", clearMarker);

      $(".route").on("click", generateRoute);

      $(".save").on("click", async () => {
        try {
          let circuitName = $("#circuit-name").val();
          let circuitDate = $("#circuit-date").val();

          if (circuitDate.length > 0) {
            if (circuitName.length === 0) circuitName = `Circuit ${new Date(circuitDate).toLocaleString('us-GB')}`;

            let circuit = await saveRoute(circuitName);

            const result = await $.ajax({
              url: `/api/teams/${user.tea_id}/circuits`,
              method: "post",
              data: JSON.stringify({
                name: circuit.name,
                coords: circuit.coords,
                date: new Date(circuitDate)
              }),
              dataType: "json",
              contentType: "application/json",
            });

            await setTeamCircuits(user.tea_id)

            alert(result.msg);
          } else {
            alert("Circuit date can't be empty");
          }

        } catch (error) {
          console.log(error);
        }
      });

    } else {
      window.location.replace("/joinTeam.html");
    }
  } else {
    window.location.replace("/");
  }
};

async function setTeamCircuits(teamId) {

  const circuits = await $.ajax({
    url: `/api/teams/${teamId}/circuits`,
    method: "get",
    dataType: "json",
  });

  const circuitsLinks = circuits.map(({ cir_id, cir_name }) => {
    return `<button class="btn btn-link cir-btn" data-bs-dismiss="offcanvas" data-id=${cir_id}>${cir_name}</button>`;
  });

  $(".offcanvas-body").html(circuitsLinks);

  $(".cir-btn").on("click", async (e) => {
    const id = e.currentTarget.dataset.id;
    const circuit = await getCircuit(id);

    retrieveRoute(circuit.cir_coords);
  });
}