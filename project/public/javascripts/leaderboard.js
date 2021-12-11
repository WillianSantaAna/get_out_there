import {
  getTeam,
  getTeamsLeaderboard,
  getUser,
  getUsersLeaderboard,
} from "./src/apiMethods.js";
import {
  removeLocalStorageUser,
  getLocalStorageUser,
} from "./src/setElements.js";

$("#sign-out").on("click", () => {
  removeLocalStorageUser();
});

let currentPage = 1;
let totalPages = 0;
let count = 10;
let leaderboardType = "users";

window.onload = async () => {
  if (!getLocalStorageUser()) {
    window.location.replace("/");
  }

  const { usr_id, tea_id } = getLocalStorageUser();

  const user = await getUser(usr_id);

  $("#user-name").text(user.usr_name);
  $("#user-score").html(
    `<p class="card-text fw-bold m-0">${user.usr_score} KMs</p>`
  );

  if (tea_id) {
    const team = await getTeam(tea_id);
    $("#team-name").text(team.tea_name);
  }

  const leaderboard = await getUsersLeaderboard(currentPage - 1, count);

  totalPages = leaderboard.totalPages;

  setLeaderboardUsers(leaderboard.users);

  $(".leaderboard-btn").on("click", async (e) => {
    if (e.currentTarget.dataset.value) {
      count = parseInt(e.currentTarget.dataset.value);
      currentPage = 1;
    }

    const typeChecked = $("input[name='leaderboard-type']:checked").attr("id");

    if (leaderboardType !== typeChecked) {
      leaderboardType = typeChecked;
      currentPage = 1;
    }

    setLeaderTable();
  });
};

function setLeaderboardUsers(users) {
  $("table thead").html(`<tr>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col">Team</th>
            <th scope="col">KMs</th>
          </tr>`);
  $("table tbody").html("");

  const { usr_id } = getLocalStorageUser();

  users.forEach((user, index) => {
    $("table tbody").append(`<tr${
      user.usr_id == usr_id ? ` class="table-active"` : ""
    }>
            <th scope="row">${(currentPage - 1) * count + (index + 1)}</th>
            <td>${user.usr_name}</td>
            <td>${user.tea_name ? user.tea_name : "-"}</td>
            <td>${user.usr_score}</td>
          </tr$>`);
  });

  setPaginationBtns();
}

function setLeaderboardTeams(teams) {
  $("table thead").html(`<tr>
            <th scope="col">#</th>
            <th scope="col">Team Name</th>
            <th scope="col">KMs</th>
          </tr>`);
  $("table tbody").html("");

  const { tea_id } = getLocalStorageUser();

  teams.forEach((team, index) => {
    $("table tbody").append(`<tr${
      team.tea_id == tea_id ? ` class="table-active"` : ""
    }>
            <th scope="row">${(currentPage - 1) * count + (index + 1)}</th>
            <td>${team.tea_name}</td>
            <td>${team.tea_score}</td>
          </tr$>`);
  });

  setPaginationBtns();
}

function setPaginationBtns() {
  $(".pagination").html("");

  if (totalPages > 1) {
    $(".pagination")
      .append(`<li role="button" class="page-item align-self-center mx-0">
              <a class="page-link" data-id="prev">
                <i class="las la-angle-double-left"></i>
              </a>
            </li>`);

    for (let i = 1; i <= totalPages; i++) {
      $(".pagination")
        .append(`<li role="button" class="page-item align-self-center mx-0${
        currentPage === i ? " active main-white" : ""
      }">
              <a class="page-link" data-id="${i}">${i}</a>
            </li>`);
    }

    $(".pagination")
      .append(`<li role="button" class="page-item align-self-center mx-0">
              <a class="page-link pe-auto" data-id="next">
                <i class="las la-angle-double-right"></i>
              </a>
            </li>`);

    $(".page-link").on("click", handlePaginationBtn);
  }
}

async function setLeaderTable() {
  if (leaderboardType === "users") {
    const leaderboard = await getUsersLeaderboard(currentPage - 1, count);

    totalPages = leaderboard.totalPages;

    setLeaderboardUsers(leaderboard.users);
  } else if (leaderboardType === "teams") {
    const leaderboard = await getTeamsLeaderboard(currentPage - 1, count);

    totalPages = leaderboard.totalPages;

    setLeaderboardTeams(leaderboard.teams);
  }
}

async function handlePaginationBtn(e) {
  const id = e.currentTarget.dataset.id;

  if (id === "prev") {
    currentPage--;
  } else if (id === "next") {
    currentPage++;
  } else {
    currentPage = parseInt(id);
  }

  if (currentPage <= 0) {
    currentPage = totalPages;
  } else if (currentPage > totalPages) {
    currentPage = 1;
  }

  $(".page-item").removeClass("active main-white");

  $(`a[data-id~="${currentPage}"]`).parent().addClass("active main-white");

  setLeaderTable();
}
