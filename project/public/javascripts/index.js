import {
  setYear,
  setNavbar,
  setButtons,
  removeLocalStorageUser,
} from "./src/setElements.js";

window.onload = () => {
  setYear();
  setNavbar();
  setButtons();

  $(".logout").click(() => {
    removeLocalStorageUser();
    window.location.replace("/");
  });
};

window.addEventListener("resize", setNavbar);
