import { getLocalStorageUser } from "./setElements.js";

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
      dataType: "json",
    });
    return result;
  } catch (error) {
    return error;
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

async function addCircuit(circuit) {
  const { usr_id } = getLocalStorageUser();

  try {
    const result = await $.ajax({
      url: `/api/users/${usr_id}/circuits`,
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

async function getUserTeamCircuits() {
  const user = getLocalStorageUser();
  if (user.tea_id != null) {
    try {
      const result = await $.ajax({
        url: `/api/teams/${user.tea_id}/circuits`,
        method: "get",
        dataType: "json",
      });
      return result;
    } catch (error) {
      return error;
    }
  }
}

async function getUserScheduledCircuits() {
  const user = getLocalStorageUser();
  try {
    const result = await $.ajax({
      url: `api/users/${user.usr_id}/schedule`,
      method: "get",
      dataType: "json",
    });
    return result;
  } catch (error) {
    return error;
  }
}

async function addUserScheduledCircuit(data) {
  const user = getLocalStorageUser();
  try {
    const result = await $.ajax({
      url: `/api/users/${user.usr_id}/schedule`,
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
  getUserTeamCircuits,
  addUserScheduledCircuit,
};
