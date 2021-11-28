import { getLocalStorageUser, setLocalStorageUser, removeLocalStorageUser } from "./src/setElements.js";

$("#sign-out").on("click", () => { removeLocalStorageUser() });

window.onload = async () => {
  const user = getLocalStorageUser();

  if (user) {
    if (user.tea_id !== null) {
      $("#team-content").css("display", "block");

      try {
        const team = await $.ajax({
          url: `/api/teams/${user.tea_id}`,
          method: "get",
          dataType: "json",
        });

        $("#team-info #team-name").html(team.tea_name);
        $("#team-info #team-score").html(`<p class="card-text fw-bold m-0">${team.tea_score} KMs</p>`);

        if (team.tea_admin_id === user.usr_id) {
          $("#btn-member").html(`<a data-bs-toggle="modal" data-bs-target="#invitation-modal"
          class="btn btn-success text-center p-1 d-flex align-items-center align-self-start"><i
            class="las la-plus fs-2"></i></a>`);

          $("#btn-add-circuit").html(`<a data-bs-toggle="modal" data-bs-target="#schedule-modal"
          class="btn btn-success text-center p-1 d-flex align-items-center align-self-start"><i
            class="las la-plus fs-2"></i></a>`);
        } else {
          $("#btn-member").html(`<a id="quit-team" class="btn btn-danger text-center px-3 py-2 d-flex align-items-center align-self-start">Quit</a>`);
        }

        const members = await $.ajax({
          url: `/api/teams/${user.tea_id}/members`,
          method: "get",
          dataType: "json",
        });

        let membersHtml = `<section><p class="fw-bold fs-4 mb-0">${team.tea_admin} (Admin)</p></section>`;

        for (let member of members) {
          membersHtml += `<section class="d-flex justify-content-between align-items-center">
            <p class="fw-bold fs-4 mb-0">${member.usr_name}</p>`;

          if (team.tea_admin_id === user.usr_id) {
            membersHtml += `<a class="kick-member" data-id="${member.tme_id}" style="cursor: pointer;"><i class="las la-window-close red fs-3"></i></a>`;            
          }

          membersHtml += `</section>`;
        }
        
        $("#team-members").html(membersHtml);

        const circuits = await $.ajax({
          url: `/api/teams/${user.tea_id}/circuits`,
          method: "get",
          dataType: "json",
        });

        let circuitsHtml = '';

        for (let circuit of circuits) {
          circuitsHtml += `<section class="d-flex justify-content-between align-items-center">
            <p class="fw-bold fs-4 mb-0">Cascais 2021-12-05</p>
            <a href=""><i class="las la-edit orange fs-3"></i></a>
          </section>`;
        }

        $("#team-circuits").html(circuitsHtml);
      } catch (error) {
        console.log(error);
      }

      $("#invitation").on("click", async () => {

        try {
          const result = await $.ajax({
            url: "/api/teams/members/invite",
            method: "post",
            data: JSON.stringify({
              teamId: user.tea_id
            }),
            dataType: "json",
            contentType: "application/json",
          });

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

      $(".kick-member").on("click", async (e)  => {
        let teamMemberId = e.currentTarget.getAttribute('data-id');

        try {
          const result = await $.ajax({
            url: `/api/teams/${user.tea_id}/members/kick`,
            method: "put",
            data: JSON.stringify({
              tmeId: teamMemberId
            }),
            dataType: "json",
            contentType: "application/json",
          });

          if (result) {
            window.location.reload();
          }

          console.log(1)
          console.log(result)

        } catch (error) {
          console.log(error.responseText)
        }
      });

    } else {
      window.location.replace("/joinTeam.html");
    }
  } else {
    window.location.replace("/");
  }
};