import {
  setLogo,
  setYear,
  setUsername,
  setButtons,
} from "./src/setElements.js";

window.onload = () => {
  setYear();
  setLogo();
  setUsername();
  setButtons();

  $(".logout").click(() => {
    localStorage.removeItem("usr_id");
    localStorage.removeItem("usr_name");
    window.location.replace("/");
  });
};

window.addEventListener("resize", setLogo);
