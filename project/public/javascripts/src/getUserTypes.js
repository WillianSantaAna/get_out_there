export default async function getUserTypes() {
  const userTypes = await $.ajax({
    url: "/api/userTypes",
    method: "get",
    dataType: "json",
  });

  return userTypes;
}
