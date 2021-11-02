export default function setUsername() {
  const userName = localStorage.getItem("usr_name");

  if (userName) {
    $(".username").text(userName);
    $(".username").append(
      `<button type="button" class="btn btn-link logout">Log Out</button>`
    );
  }
}
