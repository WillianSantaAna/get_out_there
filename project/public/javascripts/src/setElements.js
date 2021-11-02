function setYear() {
  $(".year").html(new Date().getFullYear());
}

function setUsername() {
  const userName = localStorage.getItem("usr_name");

  if (userName) {
    $(".username").text(userName);
    $(".username").append(
      `<button type="button" class="btn btn-link logout">Log Out</button>`
    );
  }
}

function setLogo() {
  if ($(window).width() < 576) {
    $(".logo").attr("src", "./images/logo/v_754x200_g1.png").width("7rem");
  } else {
    $(".logo").attr("src", "./images/logo/h_1800x199_g1.png").width("20rem");
  }
}

function setButtons() {
  if (localStorage.getItem("usr_id")) {
    $(".btn-container")
      .html(`<a href="./circuit.html" class="btn btn-lg btn-outline-light m-3 m-md-4">Start Running</a>
        <a href="./group.html" class="btn btn-lg btn-outline-light m-3 m-md-4">Manage Group</a>`);
  } else {
    $(".btn-container")
      .html(`<a href="./register.html" class="btn btn-lg btn-outline-light m-3 m-md-4">Register</a>
        <a href="./login.html" class="btn btn-lg btn-outline-light m-3 m-md-4">Log in</a>`);
  }
}

export { setYear, setLogo, setUsername, setButtons };
