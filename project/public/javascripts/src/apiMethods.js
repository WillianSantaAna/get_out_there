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

async function getExerciseTypes() {
  try {
    const result = await $.ajax({
      url: `api/exercises/types`,
      method: "get",
      dataType: "json",
    });
    return result;
  } catch (error) {
    return error;
  }
}

async function getUserSoloExercises(id) {
  try {
    const result = await $.ajax({
      url: `api/users/${id}/solo-exercises`,
      method: "get",
      dataType: "json",
    });
    return result;
  } catch (error) {
    return error;
  }
}

async function getUserTeamExercises(id) {
  try {
    const result = await $.ajax({
      url: `api/users/${id}/team-exercises`,
      method: "get",
      dataType: "json",
    });
    return result;
  } catch (error) {
    return error;
  }
}

async function addUserExercise(userId, exr) {
  try {
    const result = await $.ajax({
      url: `/api/users/${userId}/solo-exercises`,
      method: "post",
      data: JSON.stringify(exr),
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
  getExerciseTypes,
  getUserCircuits,
  getUserSoloExercises,
  getUserTeamExercises,
  addUserExercise,
};
