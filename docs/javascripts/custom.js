// Lệnh phóng to PDF dùng chung cho toàn trang web
function openFullscreen() {
  var elem = document.getElementById("myPdf");
  if (elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) { 
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { 
        elem.msRequestFullscreen();
      }
  }
}
