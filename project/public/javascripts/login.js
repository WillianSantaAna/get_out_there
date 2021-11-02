import setLogo from "./src/setLogo.js";
import setYear from "./src/setYear.js";
import userLogin from "./src/userLogin.js";

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

  const result = await userLogin(user);

  console.log(`result`, result);

  if (result.usr_id) {
    localStorage.setItem("usr_id", result.usr_id);
    localStorage.setItem("usr_name", result.usr_name);
    window.location.replace("/");
  }
});

window.addEventListener("resize", setLogo);
