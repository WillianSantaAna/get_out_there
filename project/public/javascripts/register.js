import { getLocalStorageUser, setLocalStorageUser } from "./src/setElements.js";
import { getCountries, createUser } from "./src/apiMethods.js";

window.onload = async () => {
  if (getLocalStorageUser()) {
    window.location.replace("/");
  }

  const countries = await getCountries();

  for (let country of countries) {
    const { cou_flag, cou_id, cou_name } = country;
    $(".country").append(
      `<option value="${cou_id}">${cou_name} ${cou_flag}</option>`
    );
  }
};

$(".submit").on("click", async (e) => {
  e.preventDefault();

  try {
    let user = {
      name: $("#name").val(),
      email: $("#email").val(),
      password: $("#password").val(),
      country: $(".country").val(),
    };

    const result = await createUser(user);

    if (result) {
      setLocalStorageUser(result);
      window.location.replace("/");
    }
  } catch (error) {
    alert(error.responseJSON.msg);
  }
});
