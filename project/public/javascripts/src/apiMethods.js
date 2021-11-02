async function getCountries() {
  const countries = await $.ajax({
    url: "/api/countries",
    method: "get",
    dataType: "json",
  });

  return countries;
}

async function getUserTypes() {
  const userTypes = await $.ajax({
    url: "/api/userTypes",
    method: "get",
    dataType: "json",
  });

  return userTypes;
}

async function createUser(user) {
  try {
    const result = await $.ajax({
      url: "/api/users",
      method: "post",
      data: JSON.stringify(user),
      dataType: "json",
      contentType: "application/json",
    });

    return result;
  } catch (error) {
    return error;
  }
}

async function login(user) {
  try {
    const result = await $.ajax({
      url: "/api/users/login",
      method: "post",
      data: JSON.stringify(user),
      dataType: "json",
      contentType: "application/json",
    });

    return result;
  } catch (error) {
    return error;
  }
}

export { getCountries, getUserTypes, createUser, login };
