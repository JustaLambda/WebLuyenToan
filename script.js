// --- 1. DỮ LIỆU TOÁN 10 (Số hóa từ ảnh bạn gửi) ---
const DATA_10 = {
    DaiSo: [
        {
            id: "C1", ten: "Chương 1: Mệnh đề - Tập hợp",
            dang: [
                { id: "0D1-1", text: "Dạng 1: Xác định mệnh đề, mệnh đề chứa biến" },
                { id: "0D1-2", text: "Dạng 2: Tính đúng-sai của mệnh đề" },
                { id: "0D1-3", text: "Dạng 3: Phủ định của một mệnh đề" },
                { id: "0D1-4", text: "Dạng 4: Mệnh đề kéo theo, đảo, tương đương" },
                { id: "0D1-5", text: "Dạng 5: Mệnh đề với mọi, tồn tại" },
                { id: "0D1-T1", text: "Các phép toán tập hợp (Giao, Hợp, Hiệu)" },
                { id: "0D1-T2", text: "Các bài toán tìm tập hợp con" }
            ]
        },
        {
            id: "C2", ten: "Chương 2: BPT bậc nhất hai ẩn",
            dang: [
                { id: "0D2-1", text: "Dạng 1: Khái niệm BPT bậc nhất hai ẩn" },
                { id: "0D2-2", text: "Dạng 2: Xác định miền nghiệm của BPT" },
                { id: "0D2-3", text: "Dạng 3: Bài toán thực tế (Tối ưu hóa)" },
                { id: "0D2-4", text: "Hệ bất phương trình bậc nhất hai ẩn" }
            ]
        },
        {
            id: "C3", ten: "Chương 3: Hàm số bậc hai",
            dang: [
                { id: "0D3-1", text: "Dạng 1: Tìm tập xác định của hàm số" },
                { id: "0D3-2", text: "Dạng 2: Sự biến thiên và đồ thị hàm số" },
                { id: "0D3-3", text: "Dạng 3: Xác định Parabol (tìm a, b, c)" },
                { id: "0D3-4", text: "Dạng 4: Tương giao của đồ thị" }
            ]
        },
        {
            id: "C6", ten: "Chương 6: Thống kê",
            dang: [
                { id: "0D6-1", text: "Số gần đúng và sai số" },
                { id: "0D6-2", text: "Các số đặc trưng (Trung bình, Trung vị, Mốt)" },
                { id: "0D6-3", text: "Phương sai và độ lệch chuẩn" },
                { id: "0D6-4", text: "Biểu đồ và phân tích dữ liệu" }
            ]
        },
        {
            id: "C7", ten: "Chương 7: BPT bậc 2 một ẩn",
            dang: [
                { id: "0D7-1", text: "Dấu của tam thức bậc hai" },
                { id: "0D7-2", text: "Giải bất phương trình bậc hai" },
                { id: "0D7-3", text: "Phương trình quy về bậc hai (chứa căn)" }
            ]
        },
        {
            id: "C8", ten: "Chương 8: Đại số tổ hợp",
            dang: [
                { id: "0D8-1", text: "Quy tắc cộng - Quy tắc nhân" },
                { id: "0D8-2", text: "Hoán vị - Chỉnh hợp - Tổ hợp" },
                { id: "0D8-3", text: "Nhị thức Newton" }
            ]
        },
        {
            id: "C10", ten: "Chương 10: Xác suất",
            dang: [
                { id: "0D10-1", text: "Biến cố và không gian mẫu" },
                { id: "0D10-2", text: "Xác suất cổ điển" },
                { id: "0D10-3", text: "Các quy tắc tính xác suất" }
            ]
        }
    ],
    HinhHoc: [
        {
            id: "H4", ten: "Chương 4: Hệ thức lượng tam giác",
            dang: [
                { id: "0H4-1", text: "Giá trị lượng giác của góc (0-180 độ)" },
                { id: "0H4-2", text: "Định lý Cosin - Định lý Sin" },
                { id: "0H4-3", text: "Giải tam giác và ứng dụng thực tế" },
                { id: "0H4-4", text: "Công thức tính diện tích tam giác" }
            ]
        },
        {
            id: "H5", ten: "Chương 5: Vectơ",
            dang: [
                { id: "0H5-1", text: "Khái niệm Vectơ (Cùng phương, cùng hướng)" },
                { id: "0H5-2", text: "Tổng và hiệu của hai vectơ" },
                { id: "0H5-3", text: "Tích của vectơ với một số" },
                { id: "0H5-4", text: "Tích vô hướng của hai vectơ" }
            ]
        },
        {
            id: "H9", ten: "Chương 9: PP Tọa độ trong MP (Oxy)",
            dang: [
                { id: "0H9-1", text: "Tọa độ của vectơ và điểm" },
                { id: "0H9-2", text: "Phương trình đường thẳng" },
                { id: "0H9-3", text: "Vị trí tương đối và khoảng cách" },
                { id: "0H9-4", text: "Phương trình đường tròn" },
                { id: "0H9-5", text: "Ba đường Conic (Elip, Hypebol, Parabol)" }
            ]
        }
    ]
};

// Biến lưu trữ các dạng toán đã chọn (Dùng Set để không bị trùng)
// Set sẽ lưu các ID dạng toán: "0D1-1", "0H4-2",...
const selectedTypes = new Set();


// --- 2. HÀM ĐIỀU HƯỚNG CHUNG ---
function chuyenTrang(loaiDe) {
    localStorage.setItem('cheDoLuyenDe', loaiDe);
    window.location.href = 'menu.html';
}

if (window.location.pathname.includes('menu.html')) {
    const cheDo = localStorage.getItem('cheDoLuyenDe');
    const title = document.getElementById('dynamicTitle');
    
    if (cheDo === 'TuTao') {
        title.innerText = "CHẾ ĐỘ: LUYỆN ĐỀ TỰ TẠO (Chọn Chuyên Đề)";
        title.style.borderBottomColor = "#e67e22"; title.style.color = "#d35400";
    } else {
        title.innerText = "CHẾ ĐỘ: KHO ĐỀ CÓ SẴN";
        title.style.borderBottomColor = "#27ae60"; title.style.color = "#27ae60";
    }
}


function chonChiTiet(maLop) {
    // Lấy chế độ hiện tại
    const cheDo = localStorage.getItem('cheDoLuyenDe');

    // NẾU LÀ LỚP 10 VÀ ĐANG TỰ TẠO -> CHUYỂN SANG TRANG MỚI
    if (maLop === 'Lop10' && cheDo === 'TuTao') {
        window.location.href = 'lop10_tutao.html';
        return; // Dừng hàm tại đây
    }

    // Các trường hợp khác (Code cũ giữ nguyên để hiện thông báo hoặc xử lý sau)
    alert("Tính năng cho " + maLop + " (" + cheDo + ") đang cập nhật...");
}

// --- 4. HÀM RENDER GIAO DIỆN LỚP 10 (ĐẶC BIỆT) ---
function renderGiaoDienLop10(container) {
    // Tạo khung chứa 2 cột
    const wrapper = document.createElement('div');
    wrapper.className = 'grade10-container';

    // CỘT 1: ĐẠI SỐ
    const colDai = createColumn("ĐẠI SỐ & THỐNG KÊ", "header-algebra", DATA_10.DaiSo);
    // CỘT 2: HÌNH HỌC
    const colHinh = createColumn("HÌNH HỌC", "header-geometry", DATA_10.HinhHoc);

    wrapper.appendChild(colDai);
    wrapper.appendChild(colHinh);
    container.appendChild(wrapper);
    
    // Thêm nút "Tạo đề ngay" ở dưới cùng
    const btnCreate = document.createElement('button');
    btnCreate.className = 'contact-btn'; // Tận dụng class nút đẹp có sẵn
    btnCreate.style.position = 'static'; // Bỏ fixed
    btnCreate.style.margin = '20px auto';
    btnCreate.style.display = 'block';
    btnCreate.style.width = '200px';
    btnCreate.style.textAlign = 'center';
    btnCreate.innerHTML = '<i class="fas fa-play"></i> TẠO ĐỀ NGAY';
    btnCreate.onclick = function() {
        alert(`Đã chọn ${selectedTypes.size} dạng toán.\nDanh sách ID: ${Array.from(selectedTypes).join(', ')}`);
    };
    container.appendChild(btnCreate);
}

// Hàm phụ tạo cột
function createColumn(title, headerClass, dataArray) {
    const col = document.createElement('div');
    col.className = 'math-column';
    
    const header = document.createElement('div');
    header.className = `column-header ${headerClass}`;
    header.innerText = title;
    col.appendChild(header);

    const list = document.createElement('div');
    list.className = 'chapter-list';

    dataArray.forEach(chapter => {
        // Tạo ô Chương (Item cha)
        const item = document.createElement('div');
        item.className = 'chapter-item';
        item.innerText = chapter.ten;

        // Tạo Popover chứa Checkbox (Menu con)
        const popover = document.createElement('div');
        popover.className = 'types-popover';

        // 1. Nút Chọn tất cả
        const selectAllBox = document.createElement('div');
        selectAllBox.className = 'select-all-box';
        const chkAll = document.createElement('input');
        chkAll.type = 'checkbox';
        chkAll.id = `all-${chapter.id}`;
        // Logic: Nếu tất cả con đã chọn -> Check nút All
        const allChildIds = chapter.dang.map(d => d.id);
        chkAll.checked = allChildIds.every(id => selectedTypes.has(id));
        
        // Sự kiện click Chọn tất cả
        chkAll.onchange = function() {
            const isChecked = this.checked;
            chapter.dang.forEach(d => {
                const childChk = document.getElementById(`chk-${d.id}`);
                if(childChk) childChk.checked = isChecked;
                
                if(isChecked) selectedTypes.add(d.id);
                else selectedTypes.delete(d.id);
            });
        };

        const labelAll = document.createElement('label');
        labelAll.htmlFor = `all-${chapter.id}`;
        labelAll.innerText = " Chọn tất cả chuyên đề này";
        labelAll.style.cursor = 'pointer';

        selectAllBox.appendChild(chkAll);
        selectAllBox.appendChild(labelAll);
        popover.appendChild(selectAllBox);

        // 2. Danh sách các dạng toán
        const typeScroll = document.createElement('div');
        typeScroll.className = 'types-list-scroll';

        chapter.dang.forEach(dang => {
            const typeOption = document.createElement('label');
            typeOption.className = 'type-option';
            
            const chk = document.createElement('input');
            chk.type = 'checkbox';
            chk.id = `chk-${dang.id}`;
            chk.value = dang.id;
            
            // Kiểm tra xem dạng này đã được chọn trước đó chưa
            if (selectedTypes.has(dang.id)) {
                chk.checked = true;
            }

            // Sự kiện khi click vào từng dạng
            chk.onchange = function() {
                if (this.checked) selectedTypes.add(dang.id);
                else selectedTypes.delete(dang.id);

                // Cập nhật trạng thái nút "Chọn tất cả"
                chkAll.checked = allChildIds.every(id => selectedTypes.has(id));
            };

            const spanText = document.createElement('span');
            spanText.innerText = dang.text;

            typeOption.appendChild(chk);
            typeOption.appendChild(spanText);
            typeScroll.appendChild(typeOption);
        });

        popover.appendChild(typeScroll);
        item.appendChild(popover); // Gắn menu con vào item cha
        list.appendChild(item);
    });

    col.appendChild(list);
    return col;
}

// --- 5. HÀM QUAY LẠI ---
function quayLaiMenu() {
    document.getElementById('khu-vuc-bai-hoc').classList.add('hidden');
    document.querySelector('.main-menu').classList.remove('hidden');
}