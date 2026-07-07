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
   PHẦN 2: BỘ MÁY TÌM KIẾM CHÍNH XÁC (BẢN VÁ LỖI XUNG ĐỘT UI)
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

    var searchIndex = [];
    var base = document.querySelector(".md-logo") ? document.querySelector(".md-logo").getAttribute("href") : "./";
    if (base === "") base = "./";
    if (!base.endsWith("/")) base += "/";
    
    fetch(base + "search/search_index.json")
        .then(res => res.json())
        .then(data => { searchIndex = data.docs; })
        .catch(err => console.error("Lỗi tải kho từ vựng:", err));

    if (searchForm) searchForm.addEventListener("submit", e => e.preventDefault());
    searchInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") e.preventDefault();
    });

    var observer = new MutationObserver(function(mutations) {
        if (searchInput.value.trim() !== "") {
            performExactSearch();
        }
    });

    function performExactSearch() {
        var query = searchInput.value.trim().toLowerCase();
        observer.disconnect();

        if (query === "") {
            resultList.innerHTML = "";
            if (meta) meta.textContent = "Nhập từ khóa để tìm kiếm";
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
                // 🚀 Đã xóa lệnh đóng khung search cưỡng bức gây lỗi
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

        observer.observe(resultList, { childList: true, subtree: true });
    }

    searchInput.addEventListener("input", function() {
        performExactSearch();
    });
    
    // 🚀 TÍNH NĂNG MỚI: Nếu người dùng chủ động bấm vào thanh search, mới phục hồi hiển thị kết quả
    searchInput.addEventListener("focus", function() {
        if (this.value.trim() !== "") {
            performExactSearch();
        }
    });

    // ----------------------------------------------------
    // TÍNH NĂNG 3: TRÍ NHỚ ĐIỀN TỰ ĐỘNG, HIGHLIGHT & TỰ ĐỘNG CUỘN
    // ----------------------------------------------------
    var urlParams = new URLSearchParams(window.location.search);
    var queryParam = urlParams.get('q'); 

    if (queryParam) {
        setTimeout(function() {
            // 🚀 BẢN VÁ QUAN TRỌNG: Chỉ âm thầm điền chữ, KHÔNG vẽ kết quả trên màn hình để tránh MkDocs khóa UI
            if (searchInput) {
                searchInput.value = queryParam;
            }

            var tableFilters = document.querySelectorAll(".table-filter-box");
            tableFilters.forEach(function(box) {
                box.value = queryParam;
                box.dispatchEvent(new Event('keyup'));
            });

            highlightSearchTerm(queryParam);
        }, 150); 
    }

    function highlightSearchTerm(keyword) {
        if (!keyword || keyword.trim() === "") return;
        var contentArea = document.querySelector(".md-typeset"); 
        if (!contentArea) return;

        var escapeRegExp = function(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        var regex = new RegExp("(" + escapeRegExp(keyword.trim()) + ")", "gi");

        var treeWalker = document.createTreeWalker(
            contentArea,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    var parentName = node.parentNode.nodeName;
                    if (parentName === 'SCRIPT' || parentName === 'STYLE' || parentName === 'MARK' || parentName === 'NOSCRIPT') {
                        return NodeFilter.FILTER_REJECT;
                    }
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
        while(currentNode = treeWalker.nextNode()) {
            nodesToHighlight.push(currentNode);
        }

        nodesToHighlight.forEach(function(node) {
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = node.nodeValue.replace(regex, '<mark class="search-highlight">$1</mark>');
            var parent = node.parentNode;
            while (tempDiv.firstChild) {
                parent.insertBefore(tempDiv.firstChild, node);
            }
            parent.removeChild(node);
        });

        // Với màn hình đã được "thả tự do", tính năng cuộn sẽ hoạt động hoàn hảo 100%
        setTimeout(function() {
            var firstHighlight = document.querySelector("mark.search-highlight");
            if (firstHighlight) {
                firstHighlight.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }, 150);
    }
});