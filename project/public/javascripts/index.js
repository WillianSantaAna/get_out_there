import { setHomePageButtons, removeLocalStorageUser } from "./src/setElements.js";

window.onload = () => {
  setHomePageButtons();

  $("#sign-out").on("click", () => {
    removeLocalStorageUser();
    window.location.reload();
  });
  
};
