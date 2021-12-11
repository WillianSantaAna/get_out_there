import { getLocalStorageUser } from "./setElements.js";

async function getCountries() {
  try {
    const countries = await $.ajax({
      url: "/api/countries",
      method: "get",
      dataType: "json",
    });

    return countries;
  } catch (error) {
    return error;
  }
}

async function getUser(id) {
  try {
    const result = await $.ajax({
      url: `api/users/${id}`,
      method: "get",
      dataType: "json",
    });
    return result;
  } catch (error) {
    return error;
  }
}

async function getUsersLeaderboard(page, count) {
  try {
    let url = `/api/users/leaderboard?`;
    if (count) {
      url += `count=${count}&`;
    }

    if (page) {
      url += `page=${page}`;
    }

    const users = await $.ajax({
      url,
      method: "get",
      dataType: "json",
    });

    return users;
  } catch (error) {
    return error;
  }
}

async function getTeamsLeaderboard(page, count) {
  try {
    let url = `/api/teams/leaderboard?`;
    if (count) {
      url += `count=${count}&`;
    }

    if (page) {
      url += `page=${page}`;
    }

    const teams = await $.ajax({
      url,
      method: "get",
      dataType: "json",
    });

    return teams;
  } catch (error) {
    return error;
  }
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
  try {
    const circuits = await $.ajax({
      url: "/api/circuits",
      method: "get",
      dataType: "json",
    });

    return circuits;
  } catch (error) {
    return error;
  }
}

async function getCircuit(id) {
  try {
    const circuit = await $.ajax({
      url: `/api/circuits/${id}`,
      method: "get",
      dataType: "json",
    });

    return circuit;
  } catch (error) {
    return error;
  }
}

async function removeUserCircuit(circuitId) {
  try {
    const { usr_id } = getLocalStorageUser();

    const circuit = await $.ajax({
      url: `/api/users/${usr_id}/circuits/${circuitId}`,
      method: "delete",
      dataType: "json",
    });

    return circuit;
  } catch (error) {
    return error;
  }
}

async function removeTeamCircuit(circuitId) {
  try {
    const { tea_id } = getLocalStorageUser();

    const circuit = await $.ajax({
      url: `/api/teams/${tea_id}/circuits/${circuitId}`,
      method: "delete",
      dataType: "json",
    });

    return circuit;
  } catch (error) {
    return error;
  }
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

// user schedule api methods
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

async function scheduleUserCircuit(data) {
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

async function rescheduleUserCircuit(sid, data) {
  const user = getLocalStorageUser();
  try {
    const result = await $.ajax({
      url: `/api/users/${user.usr_id}/schedule/${sid}`,
      method: "put",
      data: JSON.stringify(data),
      dataType: "json",
      contentType: "application/json",
    });
    return result;
  } catch (error) {
    return error;
  }
}

async function unscheduleUserCircuit(sid) {
  const user = getLocalStorageUser();
  try {
    const result = await $.ajax({
      url: `/api/users/${user.usr_id}/schedule/${sid}`,
      method: "delete",
    });
    return result;
  } catch (error) {
    return error;
  }
}

// team api methods
async function getTeam(teamId) {
  try {
    const result = await $.ajax({
      url: `/api/teams/${teamId}`,
      method: "get",
      dataType: "json",
    });
    return result;
  } catch (error) {
    return error;
  }
}

async function getTeamMembers(teamId) {
  try {
    const result = await $.ajax({
      url: `/api/teams/${teamId}/members`,
      method: "get",
      dataType: "json",
    });
    return result;
  } catch (error) {
    return error;
  }
}

async function getTeamSchedules(teamId) {
  try {
    const result = await $.ajax({
      url: `/api/teams/${teamId}/schedules`,
      method: "get",
      dataType: "json",
    });
    return result;
  } catch (error) {
    return error;
  }
}

async function addInvite(data) {
  try {
    const result = await $.ajax({
      url: "/api/teams/members/invite",
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

async function promoteMember(teamId, data) {
  try {
    const result = await $.ajax({
      url: `/api/teams/${teamId}/members/promote`,
      method: "put",
      data: JSON.stringify(data),
      dataType: "json",
      contentType: "application/json",
    });
    return result;
  } catch (error) {
    return error;
  }
}

async function kickMember(teamId, data) {
  try {
    const result = await $.ajax({
      url: `/api/teams/${teamId}/members/kick`,
      method: "put",
      data: JSON.stringify(data),
      dataType: "json",
      contentType: "application/json",
    });
    return result;
  } catch (error) {
    return error;
  }
}

async function leaveTeam(userId, teamId) {
  try {
    const result = await $.ajax({
      url: `/api/users/${userId}/team/${teamId}/leave`,
      method: "put",
      data: JSON.stringify({}),
      dataType: "json",
      contentType: "application/json",
    });
    return result;
  } catch (error) {
    return error;
  }
}

async function getTeamSchedule(teamId, scheduleId) {
  try {
    const result = await $.ajax({
      url: `/api/teams/${teamId}/schedules/${scheduleId}`,
      method: "get",
      dataType: "json",
    });
    return result;
  } catch (error) {
    return error;
  }
}

async function getTeamCircuits(teamId) {
  try {
    const result = await $.ajax({
      url: `/api/teams/${teamId}/circuits`,
      method: "get",
      dataType: "json",
    });
    return result;
  } catch (error) {
    console.log(error);
  }
}

async function addTeamCircuit(teamId, data) {
  try {
    const result = await $.ajax({
      url: `/api/teams/${teamId}/circuits`,
      method: "post",
      data: JSON.stringify(data),
      dataType: "json",
      contentType: "application/json",
    });
    return result;
  } catch (error) {
    console.log(error);
  }
}

// leader board
async function addUserScore(userId, distance) {
  try {
    const score = await $.ajax({
      url: `/api/users/${userId}/score`,
      method: "put",
      data: JSON.stringify({ distance }),
      dataType: "json",
      contentType: "application/json",
    });

    return score;
  } catch (error) {
    return error;
  }
}

async function addTeamScore(teamId, distance) {
  try {
    const score = await $.ajax({
      url: `/api/teams/${teamId}/score`,
      method: "put",
      data: JSON.stringify({ distance }),
      dataType: "json",
      contentType: "application/json",
    });

    return score;
  } catch (error) {
    return error;
  }
}

export {
  getCountries,
  createUser,
  login,
  getUser,
  getUsersLeaderboard,
  getTeamsLeaderboard,
  getCircuits,
  getCircuit,
  addCircuit,
  getUserCircuits,
  removeUserCircuit,
  removeTeamCircuit,
  getUserScheduledCircuits,
  scheduleUserCircuit,
  rescheduleUserCircuit,
  unscheduleUserCircuit,
  getTeam,
  getTeamMembers,
  getTeamSchedules,
  addInvite,
  promoteMember,
  kickMember,
  leaveTeam,
  getTeamSchedule,
  getTeamCircuits,
  addTeamCircuit,
  addUserScore,
  addTeamScore,
};
