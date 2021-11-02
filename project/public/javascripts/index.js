import setLogo from "./src/setLogo.js";
import setYear from "./src/setYear.js";
import setUsername from "./src/setUserName.js";

window.onload = () => {
  setYear();
  setLogo();
  setUsername();

  if (localStorage.getItem("usr_id")) {
    $(".btn-container").html("");
  }

  $(".logout").click(() => {
    localStorage.removeItem("usr_id");
    localStorage.removeItem("usr_name");
    window.location.replace("/");
  });
};

window.addEventListener("resize", setLogo);
