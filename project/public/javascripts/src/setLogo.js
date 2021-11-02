export default function setLogo() {
  if ($(window).width() < 768) {
    $(".logo").attr("src", "./images/logo/v_754x200_g1.png");
  } else {
    $(".logo").attr("src", "./images/logo/h_1800x199_g1.png");
  }
}
