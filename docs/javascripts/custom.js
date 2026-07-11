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
   PHẦN 2: BỘ MÁY TÌM KIẾM CHÍNH XÁC (BẢN VÁ LỖI URL DEEP LINK)
   ======================================================= */
document.addEventListener("DOMContentLoaded", function() {

    // ----------------------------------------------------
    // THÊM LOGO NỀN TẢNG VÀO THANH MENU BÊN TRÁI (BẢN FIX KÍCH THƯỚC)
    // ----------------------------------------------------
    var navLinks = document.querySelectorAll(".md-nav__link");

    navLinks.forEach(function(link) {
        var clone = link.cloneNode(true);
        var activeItem = clone.querySelector(".md-nav__icon");
        if (activeItem) activeItem.remove();
        
        var linkText = clone.textContent.trim();

        // Cấu hình ép giao diện flexbox để căn giữa hàng ngay lập tức
        link.style.display = "flex";
        link.style.alignItems = "center";

        // 1. Xử lý logo cho mục "Memrise"
        if (linkText === "Memrise" && !link.querySelector(".logo-memrise")) {
            var imgMemrise = document.createElement("img");
            imgMemrise.src = "https://www.memrise.com/hubfs/Memrise%20July%202020/Images/logo_yellow.svg";
            imgMemrise.className = "nav-platform-logo logo-memrise";
            
            // ÉP CỨNG kích thước bằng mã JS (Chống bị phóng to khi chưa nhận CSS)
            imgMemrise.style.height = "16px";
            imgMemrise.style.width = "auto";
            imgMemrise.style.marginRight = "8px";
            imgMemrise.style.display = "inline-block";

            link.insertBefore(imgMemrise, link.firstChild);
        }
        
        // 2. Xử lý logo cho mục "DailyDictation"
        if (linkText === "DailyDictation" && !link.querySelector(".logo-dictation")) {
            var imgDictation = document.createElement("img");
            imgDictation.src = "https://dailydictation.com/dailydictation.svg";
            imgDictation.className = "nav-platform-logo logo-dictation";
            
            // ÉP CỨNG kích thước bằng mã JS
            imgDictation.style.height = "16px";
            imgDictation.style.width = "auto";
            imgDictation.style.marginRight = "8px";
            imgDictation.style.display = "inline-block";

            link.insertBefore(imgDictation, link.firstChild);
        }
    });

    // ----------------------------------------------------
    // TÍNH NĂNG 1 & 4 (GỘP): THANH CÔNG CỤ BẢNG & BỘ ĐỌC VĂN BẢN (CÓ NHẤN NHÁ)
    // ----------------------------------------------------
    var englishVoices = [];
    var voiceSelects = []; // Mảng chứa các ô chọn giọng trên trang

    // Thuật toán lấy và sắp xếp giọng đọc (Đẩy giọng xịn lên đầu)
    function loadVoices() {
        var voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return;

        englishVoices = voices.filter(v => v.lang.startsWith('en'));

        // Chấm điểm ưu tiên các giọng AI/Neural
        englishVoices.sort((a, b) => {
            let scoreA = (a.name.includes('Google') || a.name.includes('Neural') || a.name.includes('Samantha') || a.name.includes('Siri')) ? 1 : 0;
            let scoreB = (b.name.includes('Google') || b.name.includes('Neural') || b.name.includes('Samantha') || b.name.includes('Siri')) ? 1 : 0;
            return scoreB - scoreA;
        });

        // Đổ dữ liệu vào tất cả các ô Chọn giọng
        voiceSelects.forEach(select => {
            let oldVal = select.value;
            select.innerHTML = ''; 
            
            englishVoices.forEach((voice, index) => {
                var option = document.createElement('option');
                option.value = index;
                let isPremium = (voice.name.includes('Google') || voice.name.includes('Neural') || voice.name.includes('Samantha'));
                // Gắn icon lấp lánh cho các giọng đọc tốt
                option.textContent = (isPremium ? '✨ ' : '') + voice.name;
                select.appendChild(option);
            });

            // Tự động giữ lại lựa chọn cũ, hoặc lấy giọng top 1 mặc định
            if (oldVal === "" && englishVoices.length > 0) {
                select.value = 0; 
            } else if (oldVal !== "") {
                select.value = oldVal;
            }
        });
    }

    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Hàm đọc văn bản (Đã vá lỗi xung đột hệ thống trên Android Chrome)
    function speakText(text, selectedVoiceIndex) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            var utterance = new SpeechSynthesisUtterance(text);
            
            if (englishVoices.length > 0 && englishVoices[selectedVoiceIndex]) {
                var chosenVoice = englishVoices[selectedVoiceIndex];
                
                // 1. Gắn giọng đọc vào bộ máy
                utterance.voice = chosenVoice;
                
                // 2. 🚀 BẢN VÁ LỖI ANDROID: Phải đồng bộ mã ngôn ngữ với giọng đọc
                // (Ví dụ: Chọn giọng Úc thì lang phải là 'en-AU', Anh là 'en-GB')
                utterance.lang = chosenVoice.lang; 
            } else {
                // Nếu không có giọng nào được chọn, dự phòng bằng tiếng Mỹ
                utterance.lang = 'en-US'; 
            }
            
            // 🚀 BÍ QUYẾT TẠO NHẤN NHÁ:
            utterance.rate = 0.9;  // Đọc chậm lại một nhịp để AI nhả chữ rõ hơn
            utterance.pitch = 1; 
            utterance.volume = 1;

            window.speechSynthesis.speak(utterance);
        }
    }

    // Quét toàn bộ bảng để chèn UI và Sự kiện
    var tables = document.querySelectorAll(".md-typeset table:not([class])");
    tables.forEach(function(table) {
        
        // 1. Dựng Thanh Công Cụ (Control Bar)
        var controlBar = document.createElement("div");
        controlBar.className = "table-control-bar";

        // Ô nhập chữ tìm kiếm
        var searchBox = document.createElement("input");
        searchBox.type = "text";
        searchBox.placeholder = "Lọc từ vựng trong bảng...";
        searchBox.className = "table-filter-box";
        
        // Ô chọn giọng đọc
        var voiceSelect = document.createElement("select");
        voiceSelect.className = "voice-select-box";
        voiceSelect.title = "Tùy chọn giọng đọc bạn yêu thích";
        voiceSelects.push(voiceSelect); 

        controlBar.appendChild(searchBox);
        controlBar.appendChild(voiceSelect);
        table.parentNode.insertBefore(controlBar, table);

        // Sự kiện gõ phím để lọc bảng
        searchBox.addEventListener("keyup", function() {
            var filterText = searchBox.value.toLowerCase().trim();
            var rows = table.querySelectorAll("tbody tr");
            rows.forEach(function(row) {
                var rowText = row.textContent.toLowerCase();
                row.style.display = rowText.includes(filterText) ? "" : "none";
            });
        });

        // 2. Kích hoạt Click to Play cho Cột 2 và Cột 7
        var englishCells = table.querySelectorAll("tbody tr td:nth-child(2), tbody tr td:nth-child(7)");
        englishCells.forEach(function(cell) {
            cell.title = "Click để nghe phát âm 🔊";
            cell.addEventListener("click", function(e) {
                var textToRead = this.textContent.trim();
                // Lấy đúng cái giọng mà người dùng đang chọn ở bảng hiện tại
                var currentVoiceIndex = voiceSelect.value; 
                
                if(textToRead !== "") {
                    speakText(textToRead, currentVoiceIndex);
                }
            });
        });
    });

    loadVoices(); // Lệnh mồi lần đầu

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
            
            // 🚀 THAY ĐỔI CỐT LÕI: Dùng ?h= thay vì ?q= để MkDocs không nhận diện được
            a.href = base + match.location + "?h=" + encodeURIComponent(query);

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

        observer.observe(resultList, { childList: true, subtree: true });
    }

    searchInput.addEventListener("input", function() {
        performExactSearch();
    });
    
    searchInput.addEventListener("focus", function() {
        if (this.value.trim() !== "") {
            performExactSearch();
        }
    });

    // ----------------------------------------------------
    // TÍNH NĂNG 3: TRÍ NHỚ ĐIỀN TỰ ĐỘNG, HIGHLIGHT & TỰ ĐỘNG CUỘN
    // ----------------------------------------------------
    var urlParams = new URLSearchParams(window.location.search);
    
    // 🚀 THAY ĐỔI CỐT LÕI: Yêu cầu mã của chúng ta chỉ đọc biến ?h=
    var queryParam = urlParams.get('h'); 

    if (queryParam) {
        setTimeout(function() {
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

        setTimeout(function() {
            var firstHighlight = document.querySelector("mark.search-highlight");
            if (firstHighlight) {
                firstHighlight.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }, 150);
    }
});