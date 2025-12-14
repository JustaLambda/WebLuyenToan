# 📚 TÀI LIỆU MÔ TẢ CẤU TRÚC DỰ ÁN - WEB LUYỆN TOÁN TOAN.VN

## 🎯 MỤC TIÊU VÀ Ý ĐỒ CỦA WEB

**Web Luyện Toán TOAN.VN** là một hệ thống web application hỗ trợ:
1. **Học sinh**: Luyện tập toán với đề thi tự tạo hoặc đề có sẵn, làm bài và xem kết quả
2. **Giáo viên**: Quản lý ngân hàng câu hỏi (thêm, sửa, xóa, tìm kiếm) với hỗ trợ LaTeX và HTML
3. **Tự động hóa**: Tạo đề thi tự động dựa trên ma trận đề (chọn chuyên đề, dạng toán, độ khó, số lượng câu hỏi)

---

## 🏗️ KIẾN TRÚC TỔNG QUAN

### **Frontend (Client-side)**
- **Công nghệ**: HTML5, CSS3, JavaScript (Vanilla JS)
- **Thư viện chính**:
  - **CKEditor 5**: Rich text editor cho nhập câu hỏi (hỗ trợ HTML và LaTeX)
  - **MathJax 3**: Render công thức toán học từ LaTeX
  - **Font Awesome 6**: Icons
  - **Google Fonts (Montserrat)**: Typography

### **Data lưu trữ**
- **Câu hỏi & cấu hình đề thi**: `localStorage` trên trình duyệt (chỉ để demo/giao diện)
- **Dữ liệu master**: `data_master.js` (chứa cấu trúc chuyên đề, dạng toán)

---

## 📁 CẤU TRÚC THƯ MỤC VÀ FILE

```
WebDayToan/
├── index.html                    # Trang chủ - Cổng chọn chế độ
├── menu.html                     # Menu chọn lớp/kỳ thi
├── TrangCauHinh.html            # Trang cấu hình ma trận đề thi
├── TrangQuanLyCauHoi.html       # Trang quản lý câu hỏi (dành cho GV)
├── exam_interface.html          # Giao diện làm bài thi
├── lop10_tutao.html            # Trang chọn chuyên đề lớp 10
├── lop11_tutao.html            # Trang chọn chuyên đề lớp 11
├── lop12_tutao.html            # Trang chọn chuyên đề lớp 12
├── sat_tutao.html              # Trang chọn chuyên đề SAT
├── trang_chinh_thuc.html       # (Có thể là trang đề có sẵn)
│
├── api.js                       # Frontend API client (localStorage)
├── data_master.js               # Dữ liệu master (chuyên đề, dạng toán)
├── script.js                    # Script điều hướng và logic chung
├── style_final.css              # CSS chung cho toàn bộ web
│
└── database.db                  # (Tùy chọn) file dữ liệu cũ, không dùng cho UI
```

---

## 🔄 LUỒNG ĐIỀU HƯỚNG VÀ LIÊN KẾT GIỮA CÁC TRANG

### **1. Trang Chủ (`index.html`)**

**Mục đích**: Cổng vào chính, cho phép chọn chế độ luyện tập

**Giao diện**:
- 3 nút lớn:
  1. **LUYỆN ĐỀ TỰ TẠO** (màu cam) → Chọn chuyên đề, dạng bài
  2. **LUYỆN ĐỀ CÓ SẴN** (màu xanh) → Đề thi thử, SAT, Vào 10...
  3. **QUẢN LÝ CÂU HỎI** (màu xanh lá) → Dành cho giáo viên

**Luồng điều hướng**:
```
index.html
  ├─→ [LUYỆN ĐỀ TỰ TẠO] → menu.html (cheDoLuyenDe = 'TuTao')
  ├─→ [LUYỆN ĐỀ CÓ SẴN] → menu.html (cheDoLuyenDe = 'TaoSan')
  └─→ [QUẢN LÝ CÂU HỎI] → TrangQuanLyCauHoi.html
```

**Cơ chế**: 
- Sử dụng `localStorage.setItem('cheDoLuyenDe', loaiDe)` để lưu chế độ
- Chuyển đến `menu.html` hoặc `TrangQuanLyCauHoi.html`

---

### **2. Trang Menu (`menu.html`)**

**Mục đích**: Chọn lớp/kỳ thi/chứng chỉ

**Giao diện**:
- Hiển thị danh sách các lớp (10, 11, 12) và kỳ thi (SAT, Vào 10...)
- Tiêu đề động thay đổi theo chế độ:
  - **TuTao**: "CHẾ ĐỘ: LUYỆN ĐỀ TỰ TẠO (Chọn Chuyên Đề)" (màu cam)
  - **TaoSan**: "CHẾ ĐỘ: KHO ĐỀ CÓ SẴN" (màu xanh lá)

**Luồng điều hướng**:
```
menu.html
  ├─→ [Lớp 10 + TuTao] → lop10_tutao.html
  ├─→ [Lớp 11 + TuTao] → lop11_tutao.html
  ├─→ [Lớp 12 + TuTao] → lop12_tutao.html
  ├─→ [SAT + TuTao] → sat_tutao.html
  └─→ [TaoSan] → (Chưa implement, hiện alert)
```

**Cơ chế**:
- Đọc `localStorage.getItem('cheDoLuyenDe')` để xác định chế độ
- Gọi `chonChiTiet(maLop)` để chuyển trang

---

### **3. Trang Chọn Chuyên Đề (`lop10_tutao.html`, `lop11_tutao.html`, ...)**

**Mục đích**: Chọn chuyên đề và dạng toán để tạo đề thi

**Giao diện**:
- **2 cột**: Đại số & Thống kê (trái) và Hình học (phải)
- Mỗi chuyên đề có:
  - Tên chuyên đề (click để mở popover)
  - Popover hiển thị danh sách dạng toán với checkbox
  - Nút "Chọn tất cả" cho mỗi chuyên đề

**Tính năng**:
- Chọn/bỏ chọn dạng toán bằng checkbox
- Lưu selection vào `selectedTypes` (Set)
- Nút "TẠO ĐỀ NGAY" ở cuối trang

**Luồng điều hướng**:
```
lop10_tutao.html
  └─→ [TẠO ĐỀ NGAY] → TrangCauHinh.html
      (Truyền selectedTypes qua localStorage hoặc URL params)
```

**Dữ liệu**:
- Sử dụng `data_master.js` để load danh sách chuyên đề và dạng toán
- Format: `{ id: "DS10_1", ten: "...", dang: [{ id: "0D1-1-1", txt: "..." }] }`

---

### **4. Trang Cấu Hình Ma Trận Đề (`TrangCauHinh.html`)**

**Mục đích**: Cấu hình chi tiết ma trận đề thi (số lượng câu hỏi theo dạng và độ khó)

**Giao diện**:
- **Top bar**: Tiêu đề, nút Quay lại
- **Container**: Danh sách các card cấu hình (mỗi card = 1 chuyên đề/dạng toán)
- **Mỗi card có**:
  - Header: Tên chuyên đề/dạng toán, nút xóa
  - Bảng ma trận:
    - **Hàng**: Dạng câu hỏi (TN, ĐS, TL, KT)
    - **Cột**: Độ khó (NB, TH, VD, VDC)
    - **Ô giao**: Input số lượng câu hỏi
  - Input thời gian (phút)
  - Nút "Random" để tự động điền số lượng

**Tính năng**:
- **Random toàn cục**: Điền số lượng ngẫu nhiên cho tất cả các card
- **Random cục bộ**: Điền số lượng ngẫu nhiên cho 1 card
- **Bảng tổng hợp**: Hiển thị tổng số câu hỏi, thời gian theo từng dạng và độ khó
- **Nút "Tạo đề"**: Gọi API để tạo đề thi từ server

**Luồng điều hướng**:
```
TrangCauHinh.html
  ├─→ [Quay lại] → lop10_tutao.html (hoặc trang trước đó)
  └─→ [Tạo đề] → exam_interface.html
      (Gọi API.generateExam() → Lưu kết quả vào localStorage → Redirect)
```

**Dữ liệu gửi lên server**:
```javascript
{
  grade: "Lop10",
  selectedTypes: ["0H5-1-3", "DS10_1", ...],  // Array các ID đã chọn
  config: [
    {
      typeId: "0H5-1-3",        // Skill ID (có dấu -) hoặc Topic ID (có _)
      typeName: "Vectơ bằng nhau",
      questionType: "tn",        // tn, ds, tl, kt
      level: "nb",              // nb, th, vd, vdc, hoặc "all" (cho ĐS)
      count: 5,                 // Số lượng câu hỏi
      time: 25                  // Thời gian (phút)
    },
    // ...
  ]
}
```

**API Call**:
- `POST /api/exams/generate` → Server tìm câu hỏi trong database theo tiêu chí
- Response: `{ success: true, data: [questions], total: 50 }`

---

### **5. Trang Làm Bài Thi (`exam_interface.html`)**

**Mục đích**: Giao diện làm bài thi cho học sinh

**Giao diện**:
- **Modal khởi động**: Hiển thị thông tin đề thi (số câu, thời gian, độ khó)
- **Layout chính**:
  - **Sidebar trái**: Danh sách câu hỏi (số thứ tự, trạng thái: chưa làm/chưa chắc/chắc chắn)
  - **Content giữa**: Hiển thị câu hỏi hiện tại (hỗ trợ MathJax)
  - **Sidebar phải**: Đồng hồ đếm ngược, nút nộp bài
- **Footer**: Nút điều hướng (Trước/Sau), nút đánh dấu

**Tính năng**:
- **Đồng hồ đếm ngược**: Tự động nộp bài khi hết thời gian
- **Đánh dấu câu hỏi**: Chưa làm / Chưa chắc / Chắc chắn
- **Điều hướng**: Click số câu hoặc nút Trước/Sau
- **Lưu đáp án**: Tự động lưu vào `localStorage` (tránh mất dữ liệu khi refresh)
- **Nộp bài**: Hiển thị kết quả, điểm số, đáp án đúng/sai

**Luồng điều hướng**:
```
exam_interface.html
  ├─→ [Bắt đầu] → Ẩn modal, bắt đầu làm bài
  ├─→ [Nộp bài] → Hiển thị kết quả
  └─→ [Quay lại] → index.html hoặc menu.html
```

**Dữ liệu**:
- Load từ `localStorage.getItem('examData')` (được lưu từ `TrangCauHinh.html`)
- Format: `{ questions: [...], config: {...}, totalTime: 90 }`

---

### **6. Trang Quản Lý Câu Hỏi (`TrangQuanLyCauHoi.html`)**

**Mục đích**: Quản lý ngân hàng câu hỏi (dành cho giáo viên)

**Giao diện**:
- **Layout 2 cột**:
  - **Cột trái**: Form nhập câu hỏi mới + Bộ lọc tìm kiếm
  - **Cột phải**: Danh sách câu hỏi đã lưu

**Tính năng nhập câu hỏi**:
1. **Phân loại**:
   - Loại chương trình (Program)
   - Lớp/Kỳ thi (Grade)
   - Chủ đề (Subject)
   - Chuyên đề (Topic)
   - Dạng toán/Skill (Skill) ⭐
   - Dạng câu hỏi (Question Type): TN, ĐS, TL, KT
   - Độ khó (Difficulty): 1-4 (NB, TH, VD, VDC)

2. **Nội dung**:
   - **Câu hỏi**: CKEditor (hỗ trợ HTML/LaTeX, upload ảnh)
   - **Đáp án**: Tùy theo dạng câu hỏi
     - **TN**: 4 đáp án A, B, C, D + chọn đáp án đúng
     - **ĐS**: Nhiều câu đúng/sai
     - **TL**: Đáp án ngắn
     - **KT**: Kéo thả
   - **Lời giải**: CKEditor
   - **Ghi chú**: Text input

3. **Chế độ nhập**:
   - **2 nút toggle toàn cục**: HTML / LaTeX
   - Khi chuyển đổi: Tự động convert nội dung giữa HTML ↔ LaTeX
   - Preview real-time với MathJax

4. **Lưu câu hỏi**:
   - Validate tất cả trường bắt buộc
   - Gọi `API.saveQuestion(questionData)`
   - Hiển thị modal preview sau khi lưu thành công

**Tính năng tìm kiếm**:
- **Bộ lọc**:
  - Program, Grade, Subject, Topic, Skill
  - Question Type, Difficulty, Year
  - Keyword (tìm trong nội dung câu hỏi)
- **Kết quả**:
  - Hiển thị danh sách câu hỏi (pagination)
  - Mỗi câu hỏi có: Nội dung, phân loại, nút Sửa/Xóa

**Luồng điều hướng**:
```
TrangQuanLyCauHoi.html
  ├─→ [Quay lại] → index.html
  ├─→ [Lưu câu hỏi] → API.saveQuestion() → Hiển thị preview
  ├─→ [Tìm kiếm] → API.searchQuestions() → Hiển thị kết quả
  └─→ [Sửa/Xóa] → API.updateQuestion() / API.deleteQuestion()
```

**API Calls**:
- `POST /api/questions` - Lưu câu hỏi mới
- `POST /api/questions/search` - Tìm kiếm câu hỏi
- `GET /api/questions/:id` - Lấy chi tiết câu hỏi
- `PUT /api/questions/:id` - Cập nhật câu hỏi
- `DELETE /api/questions/:id` - Xóa câu hỏi

---

## 🗄️ CẤU TRÚC DATABASE

### **Bảng `questions`**

```sql
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_type TEXT,           -- Loại chương trình (vd: "THPT", "SAT")
    grade TEXT,                  -- Lớp/Kỳ thi (vd: "Lop10", "Lop11")
    subject TEXT,                -- Chủ đề (vd: "DaiSo", "HinhHoc")
    topic TEXT,                  -- Chuyên đề ID (vd: "DS10_1", "HH10_4")
    skill TEXT,                  -- Dạng toán/Skill ID (vd: "0H5-1-3", "0D1-1-1")
    question_type TEXT,           -- Dạng câu hỏi: "mc", "tf", "short", "drag"
    difficulty INTEGER,           -- Độ khó: 1=NB, 2=TH, 3=VD, 4=VDC
    content TEXT,                -- Nội dung câu hỏi (HTML/LaTeX)
    answer TEXT,                 -- Đáp án (JSON string)
    correct_answer TEXT,         -- Đáp án đúng (JSON string hoặc single value)
    solution TEXT,               -- Lời giải (HTML/LaTeX)
    year INTEGER,               -- Năm (optional)
    note TEXT,                   -- Ghi chú (optional)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Mapping dữ liệu**:
- `question_type`: 
  - Frontend: `tn`, `ds`, `tl`, `kt`
  - Database: `mc`, `tf`, `short`, `drag`
- `difficulty`:
  - Frontend: `nb`, `th`, `vd`, `vdc` (hoặc `1`, `2`, `3`, `4`)
  - Database: `1`, `2`, `3`, `4`
- `skill` / `topic`:
  - Skill ID: Có dấu `-` (vd: `0H5-1-3`)
  - Topic ID: Có dấu `_` (vd: `HH10_4`)

---

## 🔌 API / BACKEND

Hiện tại dự án tập trung vào giao diện và điều hướng trang. Tất cả dữ liệu demo lưu trong `localStorage`; không còn chạy server hay gọi API online.

#### **5. Xóa câu hỏi**
```
DELETE /api/questions/:id
Response: { success: true, message: "..." }
```

#### **6. Tạo đề thi**
```
POST /api/exams/generate
Body: {
  grade: "Lop10",
  selectedTypes: ["0H5-1-3", ...],
  config: [
    {
      typeId: "0H5-1-3",
      questionType: "tn",
      level: "nb",
      count: 5
    }
  ]
}
Response: {
  success: true,
  data: [questions...],
  total: 50
}
```

#### **7. Debug endpoints**
```
GET /api/debug/questions-sample
Response: { data: [sample questions] }
```

---

## 📊 DỮ LIỆU MASTER (`data_master.js`)

**Cấu trúc**:
```javascript
const DATA_SOURCE = {
  DaiSo10: [
    {
      id: "DS10_1",                    // Topic ID
      ten: "Chuyên đề 1. Mệnh đề",
      dang: [                           // Array of skills
        { id: "0D1-1-1", txt: "Xác định mệnh đề" },
        { id: "0D1-1-2", txt: "Tính đúng-sai của mệnh đề" },
        // ...
      ]
    }
  ],
  HinhHoc10: [
    {
      id: "HH10_4",
      ten: "Chuyên đề 4. Khái niệm vectơ",
      dang: [
        { id: "0H5-1-1", txt: "Xác định vectơ" },
        { id: "0H5-1-3", txt: "Vectơ bằng nhau" },
        // ...
      ]
    }
  ],
  // ... Lớp 11, 12, SAT
}
```

**Mapping**:
- `SUBJECT_TO_DATA_KEY`: Map subject name → data key
- `getFilteredTopics()`: Lọc topics dựa trên grade, subject
- `getFilteredSkills()`: Lọc skills dựa trên topics đã chọn

---

## 🎨 GIAO DIỆN VÀ UX

### **Màu sắc chủ đạo**:
- **Cam** (`#e67e22`): Luyện đề tự tạo
- **Xanh dương** (`#3498db`): Luyện đề có sẵn
- **Xanh lá** (`#27ae60`): Quản lý câu hỏi, thành công
- **Đỏ** (`#e74c3c`): Cảnh báo, lỗi
- **Tím** (`#9b59b6`): Trả lời ngắn
- **Xám** (`#95a5a6`): Neutral, secondary

### **Typography**:
- **Font**: Montserrat (Google Fonts)
- **Weights**: 400 (regular), 600 (semi-bold), 700 (bold), 800 (extra-bold)

### **Components chung**:
- **Buttons**: Gradient, rounded corners, hover effects
- **Cards**: White background, shadow, rounded corners
- **Inputs**: Border, focus states, validation styles
- **Modals**: Overlay với blur, centered, animation

---

## 🔄 LUỒNG DỮ LIỆU TỔNG QUAN

### **Luồng tạo đề thi (Học sinh)**:
```
1. index.html
   ↓ (Chọn "LUYỆN ĐỀ TỰ TẠO")
2. menu.html
   ↓ (Chọn "Lớp 10")
3. lop10_tutao.html
   ↓ (Chọn chuyên đề, dạng toán → Click "TẠO ĐỀ NGAY")
4. TrangCauHinh.html
   ↓ (Cấu hình ma trận đề → Click "Tạo đề")
5. API.generateExam() → Server tìm câu hỏi trong database
   ↓ (Response: danh sách câu hỏi)
6. exam_interface.html
   ↓ (Làm bài → Nộp bài → Xem kết quả)
```

### **Luồng quản lý câu hỏi (Giáo viên)**:
```
1. index.html
   ↓ (Chọn "QUẢN LÝ CÂU HỎI")
2. TrangQuanLyCauHoi.html
   ↓ (Nhập câu hỏi → Click "Lưu câu hỏi")
3. API.saveQuestion() → Server lưu vào database
   ↓ (Response: success + question ID)
4. Hiển thị preview modal
   ↓ (Hoặc tìm kiếm câu hỏi)
5. API.searchQuestions() → Server query database
   ↓ (Response: danh sách câu hỏi)
6. Hiển thị kết quả (có thể Sửa/Xóa)
```

---

## 🚀 DEPLOYMENT

### **Render.com Setup**:
1. **Repository**: GitHub (auto-deploy từ main branch)
2. **Build Command**: (không cần, vì là static files)
3. **Start Command**: `node server.js`
4. **Environment Variables**: 
   - `PORT`: Tự động set bởi Render
   - (Có thể thêm `NODE_ENV=production`)

### **Database**:
- **SQLite3** trên Render.com filesystem
- ⚠️ **Lưu ý**: SQLite trên Render là ephemeral (có thể mất khi restart)
- **Khuyến nghị**: Nên migrate sang PostgreSQL cho production

### **Static Files**:
- Tất cả HTML, CSS, JS được serve bởi Express `static` middleware
- URL: `https://webluyentoan.onrender.com/index.html`

---

## 🔧 CÁC TÍNH NĂNG NỔI BẬT

### **1. Hỗ trợ LaTeX và HTML**
- **CKEditor 5**: Cho phép nhập HTML hoặc LaTeX
- **MathJax 3**: Render công thức toán học
- **Toggle mode**: Chuyển đổi giữa HTML ↔ LaTeX với conversion tự động
- **Preview real-time**: Xem trước câu hỏi với công thức được render

### **2. Upload ảnh trong CKEditor**
- Tích hợp image upload plugin
- Ảnh được lưu dưới dạng base64 hoặc URL

### **3. Tự động tạo đề thi**
- Dựa trên ma trận đề (chuyên đề, dạng toán, độ khó, số lượng)
- Server tự động query và random câu hỏi từ database
- Đảm bảo đủ số lượng câu hỏi theo yêu cầu

### **4. Lưu trữ trên Cloud**
- Tất cả câu hỏi lưu trên Render.com server
- Học sinh tạo đề thi → Gọi API → Server trả về câu hỏi từ database
- Không cần `localStorage` cho câu hỏi (chỉ dùng cho config tạm thời)

### **5. Pagination và Filter**
- Tìm kiếm câu hỏi với nhiều tiêu chí
- Pagination (20 câu/trang)
- Hỗ trợ keyword search

---

## 📝 GHI CHÚ VÀ HẠN CHẾ

### **Hạn chế hiện tại**:
1. **SQLite trên Render**: Ephemeral, có thể mất dữ liệu khi restart
2. **Chỉ lưu skill đầu tiên**: Khi nhập câu hỏi, chỉ lưu `currentSelections.skill[0]`
3. **Chưa có authentication**: Chưa có đăng nhập/đăng ký, phân quyền
4. **Chưa có lịch sử làm bài**: Không lưu kết quả làm bài của học sinh
5. **Chưa có export PDF**: Chưa thể xuất đề thi ra PDF

### **Cải thiện đề xuất**:
1. Migrate database sang PostgreSQL
2. Thêm authentication (JWT, OAuth)
3. Lưu lịch sử làm bài và thống kê
4. Thêm tính năng export PDF
5. Thêm tính năng chia sẻ đề thi
6. Thêm tính năng comment/đánh giá câu hỏi

---

## 📞 THÔNG TIN LIÊN HỆ

- **Brand**: TOAN.VN - Yêu học toán
- **Contact**: 024.7301.8910
- **Deployment**: Render.com
- **Repository**: GitHub (private/public)

---

**Tài liệu này được tạo tự động dựa trên phân tích codebase.**
**Cập nhật lần cuối**: 2025-01-XX


