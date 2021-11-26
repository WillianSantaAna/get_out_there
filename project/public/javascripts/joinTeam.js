import { getLocalStorageUser, setLocalStorageUser, removeLocalStorageUser } from "./src/setElements.js";

$("#sign-out").on("click", () => { removeLocalStorageUser() });

window.onload = async () => {
  const user = getLocalStorageUser();

  if (user) {

    if (user.tea_id === null) {

      $("#submit-create-team").on("click", async () => {
        let teamName = $("#team-name").val();
        let teamDescription = $("#team-description").val();
  
        try {
          const result = await $.ajax({
            url: "/api/teams",
            method: "post",
            data: JSON.stringify({
              name: teamName,
              description: teamDescription,
              adminId: user.usr_id
            }),
            dataType: "json",
            contentType: "application/json",
          });
    
          user.tea_id = result.tea_id;
  
          setLocalStorageUser(user);
          window.location.replace("/team.html");
  
        } catch (error) {
          console.log(error.responseText)
        }
      });
  
      $("#submit-code").on("click", async () => {
        let invitationCode = $("#invitation-code").val();
        
        try {
          const result = await $.ajax({
            url: "/api/teams/members/join",
            method: "post",
            data: JSON.stringify({
              userId: user.usr_id,
              invitationCode: invitationCode
            }),
            dataType: "json",
            contentType: "application/json",
          });
    
          user.tea_id = result.tea_id;
  
          setLocalStorageUser(user);
          window.location.replace("/team.html");
  
        } catch (error) {
          console.log(error.responseText)
        }
      });
    } else {
      window.location.replace("/team.html");
    }

  } else {
    window.location.replace("/");
  }
};