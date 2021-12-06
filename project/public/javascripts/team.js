import {
  getLocalStorageUser,
  setLocalStorageUser,
  removeLocalStorageUser,
} from "./src/setElements.js";
import {
  getTeam,
  getTeamMembers,
  getTeamSchedules,
  addInvite,
  promoteMember,
  kickMember,
  getTeamSchedule,
  removeTeamCircuit,
  getTeamCircuits,
  addTeamCircuit
} from "./src/apiMethods.js";
import {
  clearMarker,
  generateRoute,
  getCircuitData,
  createMap,
  retrieveRoute,
} from "./src/mapquest.js";

$("#sign-out").on("click", () => {
  removeLocalStorageUser();
});

$("#schedule-modal").on("shown.bs.modal", function () {
  window.dispatchEvent(new Event("resize"));
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
        $("#team-info #team-score").html(
          `<p class="card-text fw-bold m-0">${team.tea_score} KMs</p>`
        );

        const members = await getTeamMembers(user.tea_id);

        for (let member of members) {
          if (member.tme_usr_id === user.usr_id) {

            if (member.tme_is_admin) {
              $("#btn-member")
                .html(`<a data-bs-toggle="modal" data-bs-target="#invitation-modal"
              class="btn btn-success text-center p-2 d-flex align-items-center align-self-start"><i
                class="las la-plus fs-3 d-flex"></i></a>`);
    
              $("#btn-add-circuit")
                .html(`<a data-bs-toggle="modal" data-bs-target="#schedule-modal"
              class="btn btn-success text-center p-2 d-flex align-items-center align-self-start"><i
                class="las la-plus fs-3 d-flex"></i></a>`);
            } else {
              $("#btn-member").html(
                `<a id="leave" class="btn btn-danger text-center px-3 py-2 d-flex align-items-center align-self-start">Leave</a>`
              );
            }

            let membersHtml = members.map(({tme_id, tme_is_admin, usr_name}) => {
              let html = `<section class="d-flex justify-content-between align-items-center">
                <p class="fw-bold fs-4 mb-0">${usr_name} ${tme_is_admin ? '(Admin)' : ''}</p>`;
              
              if (member.tme_is_admin && tme_id !== member.tme_id && !tme_is_admin) {
                html += `<section>
                  <a class="btn promote-member" data-id="${tme_id}" title="Promote Admin"><i class="las la-user-cog main-blue fs-3red fs-3"></i></i></a>
                  <a class="btn kick-member" data-id="${tme_id}" title="Kick out"><i class="las la-window-close red fs-3"></i></a>
                </section>`;
              }

              html += `</section>`;

              return html;
            });

            $("#team-members").html(membersHtml);

            break;
          }
        }

        await setTeamSchedules(user.tea_id);
      } catch (error) {
        console.log(error);
      }

      $("#invitation").on("click", async () => {
        try {
          const result = await addInvite({ teamId: user.tea_id });

          $("#code").html(result.inv_code);
          $("#copy-code").removeAttr("disabled");
        } catch (error) {
          console.log(error.responseText);
        }
      });

      $("#copy-code").on("click", () => {
        let code = $("#code").text();
        navigator.clipboard.writeText(code);

        alert(`Copied code ${code} to Clipboard`);
      });

      $(".promote-member").on("click", async (e) => {
        let teamMemberData = {
          adminId: user.usr_id,
          teamMemberId: e.currentTarget.getAttribute("data-id")
        }

        try {
          const result = await promoteMember(user.tea_id, teamMemberData);

          if (result) {
            window.location.reload();
          }
        } catch (error) {
          console.log(error.responseText);
        }
      });

      $(".kick-member").on("click", async (e) => {
        let teamMemberId = e.currentTarget.getAttribute("data-id");

        try {
          let memberData = { tmeId: teamMemberId };

          const result = await kickMember(user.tea_id, memberData);

          if (result) {
            window.location.reload();
          }
        } catch (error) {
          console.log(error.responseText);
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
          console.log(error.responseText);
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
            if (circuitName.length === 0)
              circuitName = `Circuit ${new Date(circuitDate).toLocaleString(
                "us-GB"
              )}`;

            let circuit = await getCircuitData(circuitName);

            let circuitData = {
              name: circuit.name,
              coords: circuit.coords,
              date: new Date(circuitDate),
            };

            const result = await addTeamCircuit(user.tea_id, circuitData);

            await setTeamSchedules(user.tea_id);

            await setTeamCircuits(user.tea_id);

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

async function setTeamSchedules(teamId) {
  const schedules = await getTeamSchedules(teamId);

  let scheduleHtml = "";

  for (let schedule of schedules) {
    scheduleHtml += `<section class="d-flex justify-content-between align-items-center">
      <p class="fw-bold fs-4 mb-0">${schedule.cir_name}</p>
      <button class="btn main-blue-bg p-2 run-schedule" data-id="${schedule.tci_id}"><i class="las la-running fs-3 main-white d-flex"></i></i></button>
    </section>`;
  }

  $("#team-schedules").html(scheduleHtml);
}

async function setTeamCircuits(teamId) {
  const circuits = await getTeamCircuits(teamId);

  const circuitsLinks = circuits.map(({ cir_id, cir_name }) => {
    return `
    <section class="d-flex justify-content-between">
      <a class="btn btn-link cir-btn" data-bs-dismiss="offcanvas" data-id=${cir_id}>${cir_name}</a>
      <a class ="btn remove-cir" data-id=${cir_id} data-bs-toggle="modal" data-bs-target="#remove-circuit-modal" title="Delete this circuit">
        <i class="las la-window-close red fs-3"></i>
      </a>
    </section>`;
  });

  $(".offcanvas-body").html(circuitsLinks);
  $(".cir-btn").on("click", retrieveRoute);
  $(".remove-cir").on("click", (e) =>
    sessionStorage.setItem("remove_circuit_id", e.currentTarget.dataset.id)
  );
  $("#cancel-circuit-remove").on("click", () =>
    sessionStorage.removeItem("remove_circuit_id")
  );
  $("#confirm-circuit-remove").on("click", removeCircuit);
}

async function removeCircuit(e) {
  const circuitId = sessionStorage.getItem("remove_circuit_id");

  const result = await removeTeamCircuit(circuitId);

  const { tea_id } = getLocalStorageUser();
  await setTeamCircuits(tea_id);

  alert(result.msg);
  window.location.reload();
}
