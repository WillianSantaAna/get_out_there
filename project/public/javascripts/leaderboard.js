import { getTeam, getUser, getUsersLeaderboard } from "./src/apiMethods.js";
import {
  removeLocalStorageUser,
  getLocalStorageUser,
} from "./src/setElements.js";

$("#sign-out").on("click", () => {
  removeLocalStorageUser();
});

window.onload = async () => {
  const { usr_id, tea_id } = getLocalStorageUser();

  if (!usr_id) {
    window.location.replace("/");
  }

  const user = await getUser(usr_id);

  $("#user-name").text(user.usr_name);
  $("#user-score").html(
    `<p class="card-text fw-bold m-0">${user.usr_score} KMs</p>`
  );

  if (tea_id) {
    const team = await getTeam(tea_id);
    $("#team-name").text(team.tea_name);
  }

  const leaderboard = await getUsersLeaderboard();

  leaderboard.forEach((user, index) => {
    $("table tbody").append(`<tr>
            <th scope="row">${index + 1}</th>
            <td>${user.usr_name}</td>
            <td>${user.tea_name}</td>
            <td>${user.usr_score}</td>
          </tr>`);
  });
};
