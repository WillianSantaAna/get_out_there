import { getTeam, getUser, getUsersLeaderboard } from "./src/apiMethods.js";
import {
  removeLocalStorageUser,
  getLocalStorageUser,
} from "./src/setElements.js";

$("#sign-out").on("click", () => {
  removeLocalStorageUser();
});

let currentPage = 1;
let totalPages;

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

  const count = $(".count").val();

  const leaderboard = await getUsersLeaderboard(currentPage - 1, count);

  setLeaderboardUsers(leaderboard.users);

  totalPages = leaderboard.totalPages;

  setPaginationBtns(totalPages);

  $(".count").on("click", async () => {
    currentPage = 1;
    const count = $(".count").val();

    const leaderboard = await getUsersLeaderboard(currentPage - 1, count);

    setLeaderboardUsers(leaderboard.users);

    totalPages = leaderboard.totalPages;

    setPaginationBtns(totalPages);
  });

  $(".btn").on("click", () => {
    console.log("toDo");
    alert("toDo");
  });
};

function setLeaderboardUsers(users) {
  $("table tbody").html("");
  const count = $(".count").val();

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
}

function setPaginationBtns(totalPages) {
  $(".pagination").html("");

  $(".pagination")
    .append(`<li role="button" class="page-item align-self-center" style="margin-left: 0">
            <a class="page-link" data-id="prev">Previous</a>
          </li>`);

  for (let i = 1; i <= totalPages; i++) {
    $(".pagination")
      .append(`<li role="button" class="page-item align-self-center${
      currentPage === i ? " active" : ""
    }" style="margin-left: 0">
            <a class="page-link" data-id="${i}">${i}</a>
          </li>`);
  }

  $(".pagination")
    .append(`<li role="button" class="page-item align-self-center mx-0">
            <a class="page-link pe-auto" data-id="next">Previous</a>
          </li>`);

  $(".page-link").on("click", handlePaginationBtn);
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

  $(".page-item").removeClass("active");

  $(`a[data-id~="${currentPage}"]`).parent().addClass("active");
  const count = $(".count").val();

  const pageLeaderboard = await getUsersLeaderboard(currentPage - 1, count);

  setLeaderboardUsers(pageLeaderboard.users);
}
