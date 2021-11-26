function getLocalStorageUser() {
  return JSON.parse(localStorage.getItem("user"));
}

function setLocalStorageUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function removeLocalStorageUser() {
  localStorage.removeItem("user");
}

function setNavbarAndFooter() {
  setLogo();

  const user = getLocalStorageUser();

  if (user) {
    $(".username").text(user.usr_name);
    $(".username").append(
      `<button type="button" class="btn btn-link logout">Log Out</button>`
    );

    $(".logout").on("click", () => {
      removeLocalStorageUser();
      window.location.replace("/");
    });
  }

  $(".year").html(new Date().getFullYear());
  $(window).on("resize", setLogo);
}

function setLogo() {
  if ($(window).width() < 576) {
    $(".logo").attr("src", "./images/logo/v_754x200_g1.png").width("7rem");
  } else {
    $(".logo").attr("src", "./images/logo/h_1800x199_g1.png").width("20rem");
  }
}

function setHomePageButtons() {
  if (getLocalStorageUser()) {
    $(".btn-hero").attr("href", "./circuit.html").html("Run Now");

    $(".hero .navbar-nav").html(`      
      <li class="nav-item">
        <a class="nav-link" href="./${getLocalStorageUser().tea_id ? 'team' : 'joinTeam'}.html">Team</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="./schedule.html">Schedule</a>
      </li>
      <li class="nav-item">
        <a  id="sign-out" class="nav-link" href="">Sign Out</a>
      </li>
    `);
  }
}

export {
  getLocalStorageUser,
  setLocalStorageUser,
  removeLocalStorageUser,
  setNavbarAndFooter,
  setHomePageButtons,
};
