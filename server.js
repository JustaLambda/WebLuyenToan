const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5503;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        // Create questions table if not exists
        db.run(`CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            program TEXT,
            grade TEXT,
            subject TEXT,
            topic TEXT,
            skill TEXT,
            question_type TEXT,
            difficulty INTEGER,
            content TEXT,
            answer TEXT,
            correct_answer TEXT,
            solution TEXT,
            year INTEGER,
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err);
            } else {
                console.log('Questions table ready');
            }
        });
    }
});

// ============ API ROUTES ============

// Lưu câu hỏi mới
app.post('/api/questions', (req, res) => {
    const {
        program, grade, subject, topic, skill,
        question_type, difficulty, content, answer,
        correct_answer, solution, year, note
    } = req.body;

    const sql = `INSERT INTO questions 
        (program, grade, subject, topic, skill, question_type, difficulty, content, answer, correct_answer, solution, year, note)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [program, grade, subject, topic, skill, question_type, difficulty, content, answer, correct_answer, solution, year, note], function(err) {
        if (err) {
            console.error('Error saving question:', err);
            res.json({ success: false, message: err.message });
        } else {
            res.json({ 
                success: true, 
                message: 'Lưu câu hỏi thành công!',
                data: { id: this.lastID }
            });
        }
    });
});

// Tìm kiếm câu hỏi - hỗ trợ mảng giá trị
app.post('/api/questions/search', (req, res) => {
    const { program, grade, subject, topic, skill, question_type, difficulty, year, keyword, page = 1, limit = 20 } = req.body;

    let sql = 'SELECT * FROM questions WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as total FROM questions WHERE 1=1';
    let params = [];
    let countParams = [];

    // Helper function để thêm điều kiện lọc (hỗ trợ mảng)
    const addFilter = (field, value, dbField) => {
        if (value && (Array.isArray(value) ? value.length > 0 : true)) {
            if (Array.isArray(value)) {
                const placeholders = value.map(() => '?').join(',');
                sql += ` AND ${dbField} IN (${placeholders})`;
                countSql += ` AND ${dbField} IN (${placeholders})`;
                params.push(...value);
                countParams.push(...value);
            } else {
                sql += ` AND ${dbField} = ?`;
                countSql += ` AND ${dbField} = ?`;
                params.push(value);
                countParams.push(value);
            }
        }
    };

    addFilter('program', program, 'program');
    addFilter('grade', grade, 'grade');
    addFilter('subject', subject, 'subject');
    addFilter('topic', topic, 'topic');
    addFilter('skill', skill, 'skill');
    addFilter('question_type', question_type, 'question_type');
    
    if (difficulty !== null && difficulty !== undefined) {
        if (Array.isArray(difficulty)) {
            const placeholders = difficulty.map(() => '?').join(',');
            sql += ` AND difficulty IN (${placeholders})`;
            countSql += ` AND difficulty IN (${placeholders})`;
            params.push(...difficulty);
            countParams.push(...difficulty);
        } else {
            sql += ' AND difficulty = ?';
            countSql += ' AND difficulty = ?';
            params.push(difficulty);
            countParams.push(difficulty);
        }
    }

    if (year) {
        sql += ' AND year = ?';
        countSql += ' AND year = ?';
        params.push(year);
        countParams.push(year);
    }

    if (keyword) {
        sql += ' AND (content LIKE ? OR answer LIKE ?)';
        countSql += ' AND (content LIKE ? OR answer LIKE ?)';
        const keywordPattern = `%${keyword}%`;
        params.push(keywordPattern, keywordPattern);
        countParams.push(keywordPattern, keywordPattern);
    }

    // Pagination
    const offset = (page - 1) * limit;
    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Get count first
    db.get(countSql, countParams, (err, countResult) => {
        if (err) {
            console.error('Error counting questions:', err);
            res.json({ success: false, message: err.message, data: [] });
            return;
        }

        // Then get data
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Error searching questions:', err);
                res.json({ success: false, message: err.message, data: [] });
            } else {
                res.json({
                    success: true,
                    data: rows,
                    total: countResult.total,
                    page: page,
                    totalPages: Math.ceil(countResult.total / limit)
                });
            }
        });
    });
});

// Lấy câu hỏi theo ID
app.get('/api/questions/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM questions WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.json({ success: false, message: err.message });
        } else if (row) {
            res.json({ success: true, data: row });
        } else {
            res.json({ success: false, message: 'Không tìm thấy câu hỏi' });
        }
    });
});

// Lấy tất cả câu hỏi (có phân trang)
app.get('/api/questions', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    db.get('SELECT COUNT(*) as total FROM questions', [], (err, countResult) => {
        if (err) {
            res.json({ success: false, message: err.message, data: [] });
            return;
        }

        db.all('SELECT * FROM questions ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset], (err, rows) => {
            if (err) {
                res.json({ success: false, message: err.message, data: [] });
            } else {
                res.json({
                    success: true,
                    data: rows,
                    total: countResult.total,
                    page: page,
                    totalPages: Math.ceil(countResult.total / limit)
                });
            }
        });
    });
});

// Xóa câu hỏi
app.delete('/api/questions/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM questions WHERE id = ?', [id], function(err) {
        if (err) {
            res.json({ success: false, message: err.message });
        } else if (this.changes > 0) {
            res.json({ success: true, message: 'Xóa câu hỏi thành công!' });
        } else {
            res.json({ success: false, message: 'Không tìm thấy câu hỏi để xóa' });
        }
    });
});

// Cập nhật câu hỏi
app.put('/api/questions/:id', (req, res) => {
    const { id } = req.params;
    const {
        program, grade, subject, topic, skill,
        question_type, difficulty, content, answer,
        correct_answer, solution, year, note
    } = req.body;

    const sql = `UPDATE questions SET 
        program = ?, grade = ?, subject = ?, topic = ?, skill = ?,
        question_type = ?, difficulty = ?, content = ?, answer = ?,
        correct_answer = ?, solution = ?, year = ?, note = ?,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`;

    db.run(sql, [program, grade, subject, topic, skill, question_type, difficulty, content, answer, correct_answer, solution, year, note, id], function(err) {
        if (err) {
            res.json({ success: false, message: err.message });
        } else if (this.changes > 0) {
            res.json({ success: true, message: 'Cập nhật câu hỏi thành công!' });
        } else {
            res.json({ success: false, message: 'Không tìm thấy câu hỏi để cập nhật' });
        }
    });
});

// Tạo đề thi
app.post('/api/exams/generate', (req, res) => {
    const { sections } = req.body;
    let allQuestions = [];
    let completed = 0;

    if (!sections || sections.length === 0) {
        res.json({ success: true, data: [], total: 0 });
        return;
    }

    sections.forEach((section, index) => {
        let sql = 'SELECT * FROM questions WHERE 1=1';
        let params = [];

        if (section.type) {
            sql += ' AND question_type = ?';
            params.push(section.type);
        }
        if (section.difficulty) {
            sql += ' AND difficulty = ?';
            params.push(section.difficulty);
        }
        if (section.topic) {
            sql += ' AND topic = ?';
            params.push(section.topic);
        }
        if (section.skill) {
            sql += ' AND skill = ?';
            params.push(section.skill);
        }

        sql += ' ORDER BY RANDOM() LIMIT ?';
        params.push(section.count || 1);

        db.all(sql, params, (err, rows) => {
            if (!err && rows) {
                allQuestions = allQuestions.concat(rows);
            }
            completed++;
            if (completed === sections.length) {
                res.json({
                    success: true,
                    data: allQuestions,
                    total: allQuestions.length
                });
            }
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('API endpoints:');
    console.log('  POST /api/questions - Lưu câu hỏi');
    console.log('  POST /api/questions/search - Tìm kiếm câu hỏi');
    console.log('  GET  /api/questions - Lấy danh sách câu hỏi');
    console.log('  GET  /api/questions/:id - Lấy câu hỏi theo ID');
    console.log('  PUT  /api/questions/:id - Cập nhật câu hỏi');
    console.log('  DELETE /api/questions/:id - Xóa câu hỏi');
});

