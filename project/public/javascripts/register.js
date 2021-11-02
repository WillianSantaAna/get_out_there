import { setLogo, setYear } from "./src/setElements.js";
import { getCountries, getUserTypes } from "./src/apiMethods.js";

window.onload = async () => {
  setYear();
  setLogo();
  const countries = await getCountries();
  const userTypes = await getUserTypes();

  for (let country of countries) {
    const { cou_flag, cou_id, cou_name } = country;
    $(".country").append(
      `<option value="${cou_id}">${cou_name} ${cou_flag}</option>`
    );
  }

  for (let userType of userTypes) {
    const { tp_id, tp_name } = userType;
    $(".user-type").append(`<div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                name="type"
                id="${tp_name.trim()}"
                value="${tp_id}"
              />
              <label class="form-check-label" for="${tp_name.trim()}">${tp_name}</label>
            </div>`);
  }
};

$(".submit").on("click", async (e) => {
  e.preventDefault();

  try {
    let user = {
      name: $("#name").val(),
      email: $("#email").val(),
      password: $("#password").val(),
      type: $(".user-type input[name='type']:checked").val(),
      country: $(".country").val(),
    };

    const result = await postUser(user);

    if (result.usr_id) {
      localStorage.setItem("usr_id", result.usr_id);
      localStorage.setItem("usr_name", result.usr_name);
      window.location.replace("/");
    }
  } catch (error) {
    console.log(error);
  }
});

window.addEventListener("resize", setLogo);
