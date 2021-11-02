import { setLogo, setYear } from "./src/setElements.js";
import { login } from "./src/apiMethods.js";

window.onload = async () => {
  setYear();
  setLogo();
};

$(".submit").on("click", async (e) => {
  e.preventDefault();
  let user = {
    email: $("#email").val(),
    password: $("#password").val(),
  };

  const result = await login(user);

  if (result.usr_id) {
    localStorage.setItem("usr_id", result.usr_id);
    localStorage.setItem("usr_name", result.usr_name);
    window.location.replace("/");
  }
});

window.addEventListener("resize", setLogo);
