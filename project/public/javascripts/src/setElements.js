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
    $(".btn-container").html(
      `<a href="./circuit.html" class="btn btn-lg btn-outline-light m-3 m-md-4">Start Running</a>`
    );
    /*<a href="./group.html" class="btn btn-lg btn-outline-light m-3 m-md-4">Manage Group</a>
        <a href="./calendar.html" class="btn btn-lg btn-outline-light m-3 m-md-4">Running Calendar</a>*/
  } else {
    $(".btn-container")
      .html(`<a href="./register.html" class="btn btn-lg btn-outline-light m-3 m-md-4">Register</a>
        <a href="./login.html" class="btn btn-lg btn-outline-light m-3 m-md-4">Log in</a>`);
  }
}

export {
  getLocalStorageUser,
  setLocalStorageUser,
  removeLocalStorageUser,
  setNavbarAndFooter,
  setHomePageButtons,
};
