# Hướng Dẫn Copilot: WebLuyenToan (Web Luyện Toán)

## Tổng Quan Dự Án
**WebLuyenToan** là ứng dụng web luyện tập toán cho học sinh Việt Nam với ba chế độ chính:
1. **Luyện đề tự tạo** (chọn chuyên đề, dạng toán, độ khó)
2. **Luyện đề có sẵn** (SAT, thi vào lớp 10, các kỳ thi chuẩn)
3. **Quản lý câu hỏi** (giáo viên tạo/sửa/tìm kiếm câu hỏi với hỗ trợ LaTeX)

**Ngôn ngữ/Công nghệ**: Node.js + Express (backend), SQLite3, Vanilla JS + CKEditor 5 + MathJax 3 (frontend), Render.com (triển khai)

---

## Kiến Trúc

### Cấu Trúc Frontend
- **Điểm vào**: `index.html` (chọn chế độ) → `menu.html` (chọn lớp/kỳ thi)
- **Trang Chức Năng**:
  - `TrangCauHinh.html` - Ma trận cấu hình đề (chọn chuyên đề, dạng toán, độ khó, số lượng)
  - `TrangQuanLyCauHoi.html` - Quản lý câu hỏi (CRUD với trình soạn thảo giàu nội dung)
  - `exam_interface.html` - Giao diện làm bài thi
  - `lop{10,11,12}_tutao.html` - Chọn chuyên đề theo lớp
  - `sat_tutao.html` - Chọn chuyên đề SAT
- **Chia sẻ**: `script.js` (logic điều hướng), `style_final.css` (CSS toàn cục), `api.js` (client API), `data_master.js` (dữ liệu chương trình)

### Backend API
- **Cơ sở**: Express server trên Render.com (port 5503 mặc định cục bộ)
- **Database**: SQLite3 (`database.db`)
- **Endpoint Chính**:
  - `POST /api/questions` - Lưu câu hỏi (HTML từ CKEditor + nội dung LaTeX)
  - `POST /api/questions/search` - Tìm kiếm với bộ lọc đa trường (hỗ trợ giá trị mảng)
  - `PUT /api/questions/:id` - Cập nhật câu hỏi
  - `DELETE /api/questions/:id` - Xóa câu hỏi

### Lớp Dữ Liệu
- **Dữ liệu Master** (`data_master.js`): Cấu trúc `DATA_SOURCE[GradeSubject][TopicId].dang[]` cho toàn bộ chương trình (Lớp 10-12, SAT)
- **Lược đồ Database**: Bảng questions với các cột: `id, program_type, grade, subject, topic, skill, question_type, difficulty, content, answer, correct_answer, solution, year, note, created_at, updated_at`
- **Fallback Storage**: `localStorage` cho cấu hình đề tạm thời (không lưu trữ vĩnh viễn)

---

## Các Mẫu & Luồng Công Việc Quan Trọng

### 1. Luồng Điều Hướng
**Chọn Chế Độ** (index.html) → Lưu `localStorage.cheDoLuyenDe` → Điều hướng đến `menu.html` với UI động dựa trên chế độ → Chọn chuyên đề (lop10_tutao.html v.v.) → Cấu hình đề (TrangCauHinh.html) → Làm bài thi (exam_interface.html)

**Định Tuyến**: Hoàn toàn client-side qua `onclick` handlers đặt `window.location.href`. Sử dụng `localStorage` để duy trì dữ liệu phiên.

### 2. Quản Lý Câu Hỏi (TrangQuanLyCauHoi.html)
**Mẫu Chính**: Client API hai chế độ (`api.js`):
- `MODE = 'server'`: Luôn thử server; nếu thất bại, ném lỗi (không tự động fallback về localStorage)
- Xử lý fallback: Caller quyết định chiến lược tái thử/ngoại tuyến

**Soạn Thảo Rich Text**: CKEditor 5 cấu hình xuất **HTML + LaTeX** (ví dụ: `<p>Giải: <img src="data:image/png;base64,..."> $\sqrt{x}$</p>`)
- Câu hỏi hỗ trợ cả HTML có cấu trúc và toán học nội tuyến: các trường `content`, `answer`, `solution`
- **Không bao giờ bỏ các thẻ HTML** khi lưu/tải

**Mẫu Multi-select**: `currentSelections[field]` lưu trữ mảng; bộ lọc động dựa trên trường cha:
- Ví dụ: Chọn topic → `getFilteredSkills()` trả về chỉ các kỹ năng cho topic đó
- Sử dụng `addTag(field, id, name)` / `removeTag(field, id)` / `renderTags(field)` các hàm

### 3. Lọc Tìm Kiếm
**Server-Side** (`server.js`): Helper `addFilter(field, value, dbField)` hỗ trợ:
- **Giá trị đơn**: `WHERE field = ?`
- **Giá trị mảng**: `WHERE field IN (?, ?, ...)` (cho multi-select trong UI)
- Tìm kiếm từ khóa trong các trường `content` và `answer` với mẫu LIKE

**Phân Trang**: Tham số `page` và `limit`; phản hồi bao gồm tổng số để phân trang UI.

### 4. Quy Ước Cấu Trúc Dữ Liệu

#### Phân Cấp Chương Trình (data_master.js)
```javascript
DATA_SOURCE.DaiSo10[i] = {
  id: "DS10_1",      // ID chuyên đề duy nhất
  ten: "Chuyên đề 1. Mệnh đề",  // Tên tiếng Việt
  dang: [            // Dạng toán cho chuyên đề này
    { id: "0D1-1-1", txt: "Xác định mệnh đề" },
    { id: "0D1-1-2", txt: "Tính đúng-sai của mệnh đề" }
  ]
}
```

**Quy Ước Đặt Tên**:
- Chuyên đề theo lớp: `DaiSo10`, `HinhHoc10`, `DaiSo11`, `HinhHoc12`
- Dữ liệu SAT: `SAT_Data` (hỗn hợp tiếng Anh)
- ID Skill mã hóa phân cấp: `0D1-1-1` = Lớp 10, Chương 1, Chuyên đề 1, Dạng 1

#### Đối Tượng Câu Hỏi (Database)
```javascript
{
  id: 1,
  program_type: "VN_Grade10",     // Loại chương trình
  grade: "10",
  subject: "Đại Số",
  topic: "DS10_1",                // Liên kết đến data_master.js
  skill: "0D1-1-1",               // Kỹ năng/dạng cụ thể
  question_type: "multiple_choice",
  difficulty: 2,                  // Thang 1-5
  content: "<p>Mệnh đề nào...</p>", // HTML + LaTeX hỗn hợp
  answer: "B",
  correct_answer: "B",
  solution: "<p>Lý do...</p>",
  year: 2024,
  note: "Ghi chú tùy chọn",
  created_at: "ISO timestamp",
  updated_at: "ISO timestamp"
}
```

---

## Luồng Công Việc Nhà Phát Triển

### Phát Triển Cục Bộ
1. **Thiết Lập**: `npm install` (cài đặt Express, CORS, SQLite3, body-parser)
2. **Chạy Server**: `node server.js` (lắng nghe cổng 5503 mặc định)
3. **URL API Cơ Sở**: `http://localhost:5503/api` (mã hóa cứng trong `api.js` với phát hiện Render.com)
4. **Database**: Tự động tạo `database.db` khi chạy lần đầu; lược đồ trong `server.js` dòng 23-43

### Di Chuyển Database
- Hàm `migrateDatabase()` (server.js) thêm các cột bị thiếu vào bảng hiện có
- Các cột mới nên được thêm với `ALTER TABLE questions ADD COLUMN IF NOT EXISTS ...`
- Giữ khả năng tương thích ngược; không bao giờ xóa các cột

### Triển Khai
- **Nền Tảng**: Render.com (Node.js)
- **Cấu Hình**: `Procfile` chứa `web: node server.js`
- **Môi Trường**: PORT từ `process.env.PORT` hoặc mặc định 5503
- **Đường Dẫn Database**: Sử dụng `./database.db` cục bộ (không được khuyến nghị cho production; cân nhắc PostgreSQL trên Render)

---

## Quy Ước Dự Án Cụ Thể

### Nội Dung Tiếng Việt
- Tất cả nhãn UI, gợi ý, tên trường bằng tiếng Việt (ví dụ: "Chuyên đề", "Dạng toán", "Độ khó")
- Nội dung câu hỏi hỗn hợp: Văn bản bài toán tiếng Việt + công thức LaTeX nội tuyến
- **Không quốc tế hóa**; đây là dự án dành riêng cho Việt Nam

### Render Toán Học
- **MathJax 3** kết xuất LaTeX khi tải trang (`document.querySelectorAll('p, div').forEach(...)` kiểu xử lý)
- **CKEditor 5** cho phép dán LaTeX; đảm bảo các thẻ `<img>` từ trình soạn phương trình được giữ lại
- Khi hiển thị câu hỏi: kết xuất HTML trước, sau đó kích hoạt cập nhật MathJax: `MathJax.typesetPromise([element]).catch(...)`

### Mẫu Xử Lý Lỗi
```javascript
// Trong api.js và các lệnh gọi frontend:
try {
  const result = await API.searchQuestions(params);
  if (!result.success) {
    showErrorModal(result.message); // Lỗi cho người dùng
  }
} catch (error) {
  showErrorModal('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
}
```
- Không bao giờ thất bại im lặng; luôn hiển thị phản hồi cho người dùng
- Lỗi mạng vs lỗi xác thực có các thông báo khác nhau

### UI Chọn Thẻ/Kỹ Năng
- **Mẫu UI**: Nhập văn bản với gợi ý trực tiếp + trình chọn modal + hiển thị thẻ
- **Hàm**: `openSelectionModal(field)`, `closeSelectionModal()`, `saveOptions(field)`
- **Luồng Render**: Dropdown gợi ý → Click để thêm → renderTags() hiển thị → Click X để xóa
- Ví dụ: Chọn `skill` lọc theo `topic` được chọn trước (phụ thuộc trong `getFilteredSkills()`)

---

## Tích Hợp Bên Ngoài

### Cấu Hình CKEditor 5
- Nằm trong `TrangQuanLyCauHoi.html`
- Cấu hình để xuất **HTML** (không phải Markdown)
- Plugin: Plugin tiêu chuẩn (Bold, Italic, Link, List) + plugin phương trình tùy chỉnh
- **Xử lý Nội dung**: Lưu HTML thô; MathJax xử lý khi hiển thị

### MathJax 3
- Tải từ CDN; xử lý toán khi tải trang
- Kích hoạt xử lý lại sau cập nhật DOM: `MathJax.typesetPromise([container])`
- Dấu phân cách: `\(x\)` nội tuyến, `\[x\]` hiển thị (dấu phân cách TeX tiêu chuẩn)

### Triển Khai Render.com
- Phát hiện môi trường Render: `window.location.hostname.includes('render.com')`
- Các tệp tĩnh được phục vụ từ gốc dự án thông qua `express.static()`
- Lưu trữ database: Hệ thống tệp tạm thời (dữ liệu bị mất khi triển khai lại) — **không sẵn sàng cho production**

---

## Những Lỗi Phổ Biến Cần Tránh

1. **Đừng giả sử `localStorage` lưu trữ dữ liệu bài thi** — nó chỉ có phiên; sử dụng server để lưu trữ vĩnh viễn
2. **Đừng xóa HTML khỏi nội dung câu hỏi** — giáo viên sử dụng CKEditor với văn bản giàu nội dung; bảo tồn định dạng
3. **Đừng mã hóa cứng URL** — sử dụng `window.location.origin` + phát hiện cơ sở API cho tính tương thích Render
4. **Đừng quên xử lý lại MathJax** — sau khi thêm câu hỏi vào DOM động, gọi `MathJax.typesetPromise()`
5. **Đừng để `database.db` đi vào git** — nó nằm trong `.gitignore`; sử dụng di chuyển cho cập nhật lược đồ trên các triển khai

---

## Tham Khảo File Chính

| File | Mục Đích | Các Hàm/Xuất Chính |
|------|---------|----------------------|
| server.js | Express backend, khởi tạo DB, định tuyến API | `/api/questions`, `/api/questions/search` |
| api.js | Client API với logic fallback | `API.saveQuestion()`, `API.searchQuestions()` |
| data_master.js | Phân cấp chương trình Việt Nam | `DATA_SOURCE.DaiSo10`, `DATA_SOURCE.SAT_Data` |
| TrangQuanLyCauHoi.html | Giao diện quản lý câu hỏi cho GV (CKEditor + tìm kiếm) | Chọn thẻ, trình chọn modal, CRUD câu hỏi |
| TrangCauHinh.html | Trình tạo ma trận cấu hình bài thi | Chọn chuyên đề → Dạng toán → Độ khó |
| exam_interface.html | Giao diện làm bài thi | Tải câu hỏi, kết xuất, tính điểm |
| script.js | Logic điều hướng, tiện ích chung | Định tuyến trang, quản lý `localStorage` |

---

## Có Câu Hỏi? Hỏi Về:
- **Cấu trúc chương trình**: Xem PROJECT_STRUCTURE.md và SKILL_FIELDS_MAPPING.md
- **Thay đổi lược đồ database**: Kiểm tra mẫu di chuyển trong server.js dòng 35–43
- **Trạng thái form UI**: Xem lại đối tượng `currentSelections` trong TrangQuanLyCauHoi.html
- **Hợp đồng API**: Kiểm tra ví dụ request/response trong api.js hàm saveQuestion() và searchQuestions()
