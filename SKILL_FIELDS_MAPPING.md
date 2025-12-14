# BẢNG LIỆT KÊ CÁC TRƯỜNG "DẠNG TOÁN" (SKILL) TRONG DỰ ÁN

## 📋 TỔNG QUAN
Tài liệu này liệt kê tất cả các trường, biến và cách gọi liên quan đến "Dạng toán/Skill" trong các trang của dự án.

---

## 1️⃣ TRANG NHẬP LIỆU (TrangQuanLyCauHoi.html)

### HTML Elements:
| Tên hiển thị | ID Element | Class | Vị trí |
|-------------|------------|-------|--------|
| Dạng toán/Skill | `skillContainer` | `tag-input-container` | Dòng 1014 |
| Input nhập | `skillInput` | `tag-input` | Dòng 1015 |
| Suggestions | `skillSuggestions` | `suggestions` | Dòng 1017 |
| Nút Chọn | - | `btn-select` | Dòng 1019 (onclick: `openSelectionModal('skill')`) |
| Nút Lưu | - | `btn-save` | Dòng 1020 (onclick: `saveOptions('skill')`) |

### JavaScript Variables:
| Tên biến | Kiểu dữ liệu | Mô tả | Cách gọi |
|---------|-------------|-------|----------|
| `currentSelections.skill` | `Array<string>` | Mảng chứa các ID skill đã chọn | `currentSelections.skill` |
| `currentSelections.skill[0]` | `string` | Skill đầu tiên (dùng khi lưu) | `currentSelections.skill[0]` |

### Functions liên quan:
| Tên hàm | Mô tả | Cách gọi |
|---------|-------|----------|
| `getFilteredSkills()` | Lấy danh sách skill dựa trên topic đã chọn | `getFilteredSkills()` |
| `addTag('skill', id, name)` | Thêm skill vào selection | `addTag('skill', skillId, skillName)` |
| `removeTag('skill', id)` | Xóa skill khỏi selection | `removeTag('skill', skillId)` |
| `renderTags('skill')` | Render tags hiển thị | `renderTags('skill')` |
| `getNameById('skill', id)` | Lấy tên skill từ ID | `getNameById('skill', skillId)` |

### Khi lưu câu hỏi (saveQuestion):
```javascript
skill: currentSelections.skill[0] || ''  // Lấy skill đầu tiên
```

### Format gửi lên Server:
```javascript
{
  skill: "0H5-1-3"  // String - ID của skill
}
```

---

## 2️⃣ TRANG TÌM KIẾM (TrangQuanLyCauHoi.html - phần filter)

### HTML Elements:
| Tên hiển thị | ID Element | Class | Vị trí |
|-------------|------------|-------|--------|
| Dạng toán/Skill | `filterSkillContainer` | `tag-input-container` | Dòng 824 |
| Input nhập | `filterSkillInput` | `tag-input` | Dòng 825 |
| Suggestions | `filterSkillSuggestions` | `suggestions` | Dòng 827 |
| Nút Chọn | - | `btn-select` | Dòng 829 (onclick: `openFilterModal('skill')`) |

### JavaScript Variables:
| Tên biến | Kiểu dữ liệu | Mô tả | Cách gọi |
|---------|-------------|-------|----------|
| `filterSelections.skill` | `Array<string>` | Mảng chứa các ID skill đã chọn để filter | `filterSelections.skill` |

### Functions liên quan:
| Tên hàm | Mô tả | Cách gọi |
|---------|-------|----------|
| `renderFilterTags('skill')` | Render tags filter | `renderFilterTags('skill')` |
| `removeFilterTag('skill', id)` | Xóa skill khỏi filter | `removeFilterTag('skill', skillId)` |
| `clearDependentFilterFields('skill')` | Xóa các field phụ thuộc | `clearDependentFilterFields('skill')` |
| `openFilterModal('skill')` | Mở modal chọn skill | `openFilterModal('skill')` |

### Khi tìm kiếm (searchQuestions):
```javascript
skill: filterSelections.skill.length > 0 ? filterSelections.skill : null
```

### Format gửi lên Server:
```javascript
{
  skill: ["0H5-1-3", "0H5-1-4"]  // Array<string> - Mảng các ID skill
  // hoặc
  skill: null  // Nếu không chọn
}
```

---

## 3️⃣ TRANG CẤU HÌNH ĐỀ THI (TrangCauHinh.html)

### HTML Elements:
| Tên hiển thị | ID Element | Class | Mô tả |
|-------------|------------|-------|-------|
| Card dạng toán | `card-{id}` | - | Card chứa thông tin skill/topic |
| Data attribute | `data-name` | - | Tên hiển thị của skill/topic |
| Input số lượng | `.c-{id}-{type}.c-{level}` | - | Input nhập số lượng câu hỏi |

### JavaScript Variables:
| Tên biến | Kiểu dữ liệu | Mô tả | Cách gọi |
|---------|-------------|-------|----------|
| `selectedIds` | `Array<string>` | Mảng chứa các ID skill/topic đã chọn | `selectedIds` |
| `examData.config[].typeId` | `string` | ID của skill/topic trong config | `section.typeId` |
| `examData.selectedTypes` | `Array<string>` | Mảng các ID đã chọn (giống selectedIds) | `examData.selectedTypes` |

### Functions liên quan:
| Tên hàm | Mô tả | Cách gọi |
|---------|-------|----------|
| `findNameById(id)` | Tìm tên từ ID | `findNameById(skillId)` |
| `exportExam()` | Xuất đề thi, tạo examData | `exportExam()` |

### Khi tạo đề thi (exportExam):
```javascript
examData = {
  grade: "Lop10",
  selectedTypes: selectedIds,  // ["0H5-1-3", ...]
  config: [
    {
      typeId: "0H5-1-3",  // ID của skill
      typeName: "Vectơ bằng nhau",  // Tên hiển thị
      questionType: "tn",  // tn, ds, tl, kt
      level: "nb",  // nb, th, vd, vdc, hoặc "all" cho DS
      count: 5,  // Số lượng câu hỏi
      time: 25  // Thời gian (phút)
    },
    // ...
  ]
}
```

### Format gửi lên Server:
```javascript
{
  grade: "Lop10",
  selectedTypes: ["0H5-1-3"],
  config: [
    {
      typeId: "0H5-1-3",  // Có thể là skill ID (có dấu -) hoặc topic ID
      questionType: "tn",
      level: "nb",
      count: 1
    }
  ]
}
```

---

## 4️⃣ SERVER (server.js)

### Database Column:
| Tên cột | Kiểu dữ liệu | Mô tả |
|---------|-------------|-------|
| `skill` | `TEXT` | Lưu ID của skill (ví dụ: "0H5-1-3") |

### API Endpoints:

#### POST /api/questions (Lưu câu hỏi):
```javascript
// Request body:
{
  skill: "0H5-1-3"  // String
}

// SQL INSERT:
INSERT INTO questions (..., skill, ...) VALUES (..., ?, ...)
```

#### POST /api/questions/search (Tìm kiếm):
```javascript
// Request body:
{
  skill: ["0H5-1-3", "0H5-1-4"]  // Array<string> hoặc null
}

// SQL WHERE:
WHERE ... AND skill IN (?, ?)  // Nếu là array
// hoặc
WHERE ... AND skill = ?  // Nếu là string
```

#### POST /api/exams/generate (Tạo đề thi):
```javascript
// Request body:
{
  grade: "Lop10",
  config: [
    {
      typeId: "0H5-1-3",  // Skill ID (có dấu -)
      questionType: "tn",
      level: "nb",
      count: 1
    }
  ]
}

// Logic xử lý:
if (section.typeId.includes('-')) {
  // typeId có dấu - → là skill ID
  sql += ' AND skill = ?';
  params.push(section.typeId);
} else {
  // typeId không có dấu - → là topic ID
  sql += ' AND topic = ?';
  params.push(section.typeId);
}
```

---

## 5️⃣ DATA SOURCE (data_master.js)

### Cấu trúc dữ liệu:
```javascript
DATA_SOURCE = {
  DaiSo10: [
    {
      id: "DS10_1",  // Topic ID
      ten: "Chuyên đề 1. Mệnh đề",
      dang: [  // Array of skills
        { id: "0D1-1-1", txt: "Xác định mệnh đề" },
        { id: "0D1-1-2", txt: "Tính đúng-sai của mệnh đề" },
        // ...
      ]
    }
  ],
  HinhHoc10: [
    {
      id: "HH10_4",  // Topic ID
      ten: "Chuyên đề 4. Khái niệm vectơ",
      dang: [
        { id: "0H5-1-1", txt: "Xác định vectơ" },
        { id: "0H5-1-2", txt: "Phương và hướng" },
        { id: "0H5-1-3", txt: "Vectơ bằng nhau" },  // ← Skill ID này
        // ...
      ]
    }
  ]
}
```

### Pattern ID:
- **Topic ID**: `DS10_1`, `HH10_4` (chứa dấu `_`, không có dấu `-`)
- **Skill ID**: `0H5-1-3`, `0D1-1-1` (chứa dấu `-`, không có dấu `_`)

---

## 🔍 SO SÁNH VÀ KIỂM TRA

### ✅ Các điểm cần kiểm tra:

1. **Trang nhập liệu → Server:**
   - ✅ `currentSelections.skill[0]` → `skill` (string) ✅ MATCH

2. **Trang tìm kiếm → Server:**
   - ✅ `filterSelections.skill` (array) → `skill` (array hoặc null) ✅ MATCH

3. **Trang cấu hình → Server:**
   - ✅ `config[].typeId` → Kiểm tra có dấu `-` → `skill = ?` ✅ MATCH
   - ⚠️ **LƯU Ý**: `typeId` có thể là skill ID (có `-`) hoặc topic ID (có `_`)

4. **Database:**
   - ✅ Column `skill` lưu string ID ✅ MATCH

### ⚠️ VẤN ĐỀ TIỀM ẨN:

1. **Trang nhập liệu chỉ lấy skill đầu tiên:**
   ```javascript
   skill: currentSelections.skill[0] || ''  // Chỉ lấy phần tử đầu tiên
   ```
   → Nếu user chọn nhiều skill, chỉ skill đầu tiên được lưu.

2. **Trang cấu hình dùng `typeId` cho cả skill và topic:**
   ```javascript
   if (section.typeId.includes('-')) {
     // Skill ID
   } else {
     // Topic ID
   }
   ```
   → Logic này đúng, nhưng cần đảm bảo pattern ID nhất quán.

---

## 📝 KẾT LUẬN

Tất cả các trường đã **MATCH** với nhau:
- ✅ Trang nhập liệu: `currentSelections.skill[0]` → `skill` (string)
- ✅ Trang tìm kiếm: `filterSelections.skill` → `skill` (array)
- ✅ Trang cấu hình: `config[].typeId` → `skill` hoặc `topic` (dựa vào pattern)
- ✅ Server: Column `skill` (TEXT) lưu skill ID

**Khuyến nghị:**
- Đảm bảo pattern ID nhất quán (skill có `-`, topic có `_`)
- Có thể cải thiện: Cho phép lưu nhiều skill trong một câu hỏi (hiện tại chỉ lưu skill đầu tiên)

