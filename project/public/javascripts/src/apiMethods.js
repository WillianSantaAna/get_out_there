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

async function getUserCircuits(id) {
  try {
    const result = await $.ajax({
      url: `api/users/${id}/circuits`,
      method: "get",
      dataType: "json"
    });
    return result
  } catch (error) {
    return error
  }
}

async function getCircuits() {
  const circuits = await $.ajax({
    url: "/api/circuits",
    method: "get",
    dataType: "json",
  });

  return circuits;
}

async function getCircuit(id) {
  const circuit = await $.ajax({
    url: `/api/circuits/${id}`,
    method: "get",
    dataType: "json",
  });

  return circuit;
}

// BUGGY
async function addCircuit(circuit) {
  try {
    const result = await $.ajax({
      url: "/api/circuits",
      method: "post",
      data: JSON.stringify(circuit),
      dataType: "json",
      contentType: "application/json",
    });

    return result;
  } catch (error) {
    return error;
  }
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

async function getUserScheduledCircuits(id) {
  try {
    const result = await $.ajax({
      url: `api/users/${id}/schedule`,
      method: "get",
      dataType: "json"
    });
    return result
  } catch (error) {
    return error
  }
}

// HERE -----

async function addUserScheduledCircuit(userId, data) {
  try {
    const result = await $.ajax({
      url: `/api/users/${userId}/schedule`,
      method: "post",
      data: JSON.stringify(data),
      dataType: "json",
      contentType: "application/json",
    });
    return result;
  } catch (error) {
    return error;
  }
}

export {
  getCountries,
  getUserTypes,
  createUser,
  login,
  getCircuits,
  getCircuit,
  addCircuit,
  getUserCircuits,
  getUserScheduledCircuits,
  addUserScheduledCircuit,
};

// HERE -----
