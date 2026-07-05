# Tổng hợp từ vựng: Ở nhà hàng

Dưới đây là tài liệu tổng hợp toàn bộ từ vựng của chủ đề này.

<button onclick="openFullscreen()" class="md-button md-button--primary" style="margin-bottom: 15px; cursor: pointer;">
  🖵 Xem Toàn Màn Hình
</button>

<object id="myPdf" data="../Ở nhà hàng.pdf" type="application/pdf" width="100%" height="800px" style="background-color: white;">
    <p>Trình duyệt của bạn không hỗ trợ xem PDF trực tiếp. <a href="../Ở nhà hàng.pdf">Nhấn vào đây để tải về</a>.</p>
</object>

<script>
function openFullscreen() {
  var elem = document.getElementById("myPdf");
  if (elem.requestFullscreen) {
    elem.requestFullscreen(); /* Dành cho các trình duyệt chuẩn như Chrome, Edge, Firefox */
  } else if (elem.webkitRequestFullscreen) { 
    elem.webkitRequestFullscreen(); /* Dành riêng cho Safari */
  } else if (elem.msRequestFullscreen) { 
    elem.msRequestFullscreen(); /* Dành riêng cho Internet Explorer 11 */
  }
}
</script>