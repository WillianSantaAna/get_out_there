import {
  getLocalStorageUser,
  setLocalStorageUser,
  setNavbar,
  setYear,
} from "./src/setElements.js";
import { login } from "./src/apiMethods.js";

window.onload = () => {
  if (getLocalStorageUser()) {
    window.location.replace("/");
  }

  setYear();
  setNavbar();
};

$(".submit").on("click", async (e) => {
  e.preventDefault();
  const user = {
    email: $("#email").val(),
    password: $("#password").val(),
  };

  const result = await login(user);

  if (result) {
    setLocalStorageUser(result);
    window.location.replace("/");
  }
});

window.addEventListener("resize", setNavbar);
