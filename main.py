def define_env(env):
    @env.macro
    def nhung_pdf(ten_file):
        return f"""
<div class="pdf-wrapper">
    <button onclick="openFullscreen()" class="md-button md-button--primary btn-desktop" style="margin-bottom: 15px; cursor: pointer;">
      🖵 Xem Toàn Màn Hình
    </button>
    <object id="myPdf" data="../{ten_file}" type="application/pdf" width="100%" height="800px" class="pdf-desktop">
        <p>Trình duyệt của bạn không hỗ trợ xem PDF trực tiếp.</p>
    </object>
    <button onclick="openMobilePDF('{ten_file}')" class="md-button md-button--primary btn-mobile">
        📄 Chạm để Đọc PDF Toàn Màn Hình
    </button>
</div>
"""

    @env.macro
    def nhung_podcast(ten_file):
        return f"""
<div class="podcast-wrapper">
    <div class="podcast-header">
        <span class="podcast-icon">🎧</span>
        <span class="podcast-title">Luyện Nghe Cùng Podcast</span>
    </div>
    <video controls class="podcast-player" preload="metadata">
        <source src="../{ten_file}" type="video/mp4">
        Trình duyệt của bạn không hỗ trợ phát Podcast.
    </video>
</div>
"""
