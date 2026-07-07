/* =======================================================
   PHẦN 1: CÁC HÀM XỬ LÝ PDF (GIỮ NGUYÊN BẢN CỦA BẠN)
   ======================================================= */
function openFullscreen() {
  var elem = document.getElementById("myPdf");
  if (elem) {
      if (elem.requestFullscreen) { elem.requestFullscreen(); }
      else if (elem.webkitRequestFullscreen) { elem.webkitRequestFullscreen(); }
      else if (elem.msRequestFullscreen) { elem.msRequestFullscreen(); }
  }
}

function openMobilePDF(fileName) {
    var currentUrl = window.location.href;
    var pdfUrl = new URL("../" + fileName, currentUrl).href;
    var viewerUrl = "https://docs.google.com/viewer?url=" + encodeURIComponent(pdfUrl) + "&embedded=false";
    window.open(viewerUrl, '_blank');
}

/* =======================================================
   PHẦN 2: BỘ MÁY TÌM KIẾM CHÍNH XÁC (RÚT PHÍCH CẮM OBSERVER)
   ======================================================= */
document.addEventListener("DOMContentLoaded", function() {

    // ----------------------------------------------------
    // TÍNH NĂNG 1: THANH LỌC BẢNG (LOCAL SEARCH)
    // ----------------------------------------------------
    var tables = document.querySelectorAll(".md-typeset table:not([class])");
    tables.forEach(function(table) {
        var searchBox = document.createElement("input");
        searchBox.type = "text";
        searchBox.placeholder = "Lọc từ vựng trong bảng...";
        searchBox.className = "table-filter-box";
        table.parentNode.insertBefore(searchBox, table);

        searchBox.addEventListener("keyup", function() {
            var filterText = searchBox.value.toLowerCase().trim();
            var rows = table.querySelectorAll("tbody tr");
            rows.forEach(function(row) {
                var rowText = row.textContent.toLowerCase();
                row.style.display = rowText.includes(filterText) ? "" : "none";
            });
        });
    });

    // ----------------------------------------------------
    // TÍNH NĂNG 2: CHIẾM QUYỀN TÌM KIẾM TỔNG (GLOBAL SEARCH)
    // ----------------------------------------------------
    var searchInput = document.querySelector(".md-search__input");
    var resultList = document.querySelector(".md-search-result__list");
    var meta = document.querySelector(".md-search-result__meta");
    var searchForm = document.querySelector(".md-search__form");

    if (!searchInput || !resultList) return;

    // 1. Tải từ điển
    var searchIndex = [];
    var base = document.querySelector(".md-logo") ? document.querySelector(".md-logo").getAttribute("href") : "./";
    if (base === "") base = "./";
    if (!base.endsWith("/")) base += "/";
    
    fetch(base + "search/search_index.json")
        .then(res => res.json())
        .then(data => { searchIndex = data.docs; })
        .catch(err => console.error("Lỗi tải kho từ vựng:", err));

    // 2. Khóa nút Enter chống văng trang
    if (searchForm) searchForm.addEventListener("submit", e => e.preventDefault());
    searchInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") e.preventDefault();
    });

    // 3. KHỞI TẠO NGƯỜI GÁC CỔNG
    var observer = new MutationObserver(function(mutations) {
        // Bất cứ khi nào MkDocs (Web Worker) đổ kết quả mặc định vào, lập tức ghi đè lại
        if (searchInput.value.trim() !== "") {
            performExactSearch();
        }
    });

    function performExactSearch() {
        var query = searchInput.value.trim().toLowerCase();
        
        // 🛑 BƯỚC QUAN TRỌNG: Tạm ngắt kết nối để không tự theo dõi chính tác vụ của mình (Ngăn lặp vô hạn)
        observer.disconnect();

        if (query === "") {
            resultList.innerHTML = "";
            if (meta) meta.textContent = "Nhập từ khóa để tìm kiếm";
            
            // Bật lại theo dõi sau khi hoàn tất
            observer.observe(resultList, { childList: true, subtree: true });
            return;
        }

        var matches = [];
        var seenUrls = new Set();

        searchIndex.forEach(function(doc) {
            var text = (doc.text || "").toLowerCase();
            var title = (doc.title || "").toLowerCase();
            
            if (text.includes(query) || title.includes(query)) {
                var loc = doc.location.split("#")[0];
                if (!seenUrls.has(loc) && loc !== "") {
                    seenUrls.add(loc);
                    matches.push({ title: doc.title, location: loc });
                }
            }
        });

        // Vẽ giao diện
        resultList.innerHTML = "";
        if (meta) meta.textContent = matches.length + " kết quả khớp chính xác";

        matches.forEach(function(match) {
            var li = document.createElement("li");
            li.className = "md-search-result__item";

            var a = document.createElement("a");
            a.className = "md-search-result__link";
            a.href = base + match.location + "?q=" + encodeURIComponent(query);

            a.addEventListener("click", function(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                window.location.href = this.href;
            });

            var article = document.createElement("article");
            article.className = "md-search-result__article";

            var h1 = document.createElement("h1");
            h1.className = "md-search-result__title";
            h1.textContent = match.title.split(" - ")[0]; 

            article.appendChild(h1);
            a.appendChild(article);
            li.appendChild(a);
            resultList.appendChild(li);
        });

        // 🟢 VẼ XONG: Cắm lại kết nối để tiếp tục canh gác MkDocs
        observer.observe(resultList, { childList: true, subtree: true });
    }

    searchInput.addEventListener("input", function() {
        performExactSearch();
    });

    // ----------------------------------------------------
    // TÍNH NĂNG 3: TRÍ NHỚ ĐIỀN TỰ ĐỘNG, LỌC BẢNG & HIGHLIGHT TỪ KHÓA
    // ----------------------------------------------------
    var urlParams = new URLSearchParams(window.location.search);
    var queryParam = urlParams.get('q'); 

    if (queryParam) {
        setTimeout(function() {
            // 1. Phục hồi ô tìm kiếm tổng
            if (searchInput) {
                searchInput.value = queryParam;
                performExactSearch(); 
            }

            // 2. Ép bảng co lại theo từ khóa
            var tableFilters = document.querySelectorAll(".table-filter-box");
            tableFilters.forEach(function(box) {
                box.value = queryParam;
                box.dispatchEvent(new Event('keyup'));
            });

            // 3. Kích hoạt thuật toán bôi vàng trong nội dung
            highlightSearchTerm(queryParam);
        }, 150); 
    }

    // 🔬 THUẬT TOÁN XỬ LÝ TEXT NODE AN TOÀN
    function highlightSearchTerm(keyword) {
        if (!keyword || keyword.trim() === "") return;
        
        // Chỉ giới hạn tìm kiếm trong vùng nội dung bài học (.md-typeset)
        var contentArea = document.querySelector(".md-typeset"); 
        if (!contentArea) return;

        // Xử lý chuỗi để dùng trong Regex an toàn (Tránh lỗi do ký tự đặc biệt)
        var escapeRegExp = function(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        // Tạo Regex tìm kiếm không phân biệt hoa/thường (flag 'gi')
        var regex = new RegExp("(" + escapeRegExp(keyword.trim()) + ")", "gi");

        // Sử dụng TreeWalker để duyệt qua cây DOM
        var treeWalker = document.createTreeWalker(
            contentArea,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    var parentName = node.parentNode.nodeName;
                    // Bỏ qua các thẻ chứa mã lệnh hoặc đã được highlight trước đó
                    if (parentName === 'SCRIPT' || parentName === 'STYLE' || parentName === 'MARK' || parentName === 'NOSCRIPT') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // Nếu văn bản có chứa từ khóa thì chấp nhận node này
                    if (regex.test(node.nodeValue)) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_SKIP;
                }
            },
            false
        );

        var nodesToHighlight = [];
        var currentNode;
        // Gom các Node thỏa mãn vào mảng trước khi chỉnh sửa DOM
        while(currentNode = treeWalker.nextNode()) {
            nodesToHighlight.push(currentNode);
        }

        // Tiến hành bọc thẻ <mark> cho các từ khóa tìm được
        nodesToHighlight.forEach(function(node) {
            var tempDiv = document.createElement('div');
            // Thay thế chuỗi khớp bằng thẻ mark mang class css ta đã tạo
            tempDiv.innerHTML = node.nodeValue.replace(regex, '<mark class="search-highlight">$1</mark>');
            
            var parent = node.parentNode;
            // Chèn các node văn bản/HTML mới vào trước node cũ
            while (tempDiv.firstChild) {
                parent.insertBefore(tempDiv.firstChild, node);
            }
            // Xóa text node cũ đi
            parent.removeChild(node);
        });
    }
});