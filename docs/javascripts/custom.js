// 1. Lệnh phóng to PDF trên Máy tính (Giữ nguyên)
function openFullscreen() {
  var elem = document.getElementById("myPdf");
  if (elem) {
      if (elem.requestFullscreen) { elem.requestFullscreen(); }
      else if (elem.webkitRequestFullscreen) { elem.webkitRequestFullscreen(); }
      else if (elem.msRequestFullscreen) { elem.msRequestFullscreen(); }
  }
}

// 2. Lệnh ép đọc PDF trên trình duyệt Điện thoại (Mới)
function openMobilePDF(fileName) {
    // Lấy đường dẫn gốc của trang web hiện tại
    var currentUrl = window.location.href;
    // Nối tên file để ra link PDF tuyệt đối
    var pdfUrl = new URL("../" + fileName, currentUrl).href;
    // Mượn trình đọc PDF của Google Docs để ép hiển thị trên web, không cho tải về
    var viewerUrl = "https://docs.google.com/viewer?url=" + encodeURIComponent(pdfUrl) + "&embedded=false";
    window.open(viewerUrl, '_blank');
}
