import { getLocalStorageUser, setLocalStorageUser } from "./src/setElements.js";
import { login } from "./src/apiMethods.js";

window.onload = () => {
  if (getLocalStorageUser()) {
    window.location.replace("/");
  }
};

$(".submit").on("click", async (e) => {
  try {
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
  } catch (error) {
    alert(error.responseJSON.msg);
  }
});
