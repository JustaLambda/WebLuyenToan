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
        // Note: Using program_type to match existing database schema
        db.run(`CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            program_type TEXT,
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
                // Migrate existing table: add missing columns if needed
                migrateDatabase();
            }
        });
    }
});

// Migration function to add missing columns
function migrateDatabase() {
    const columnsToCheck = [
        { name: 'program_type', type: 'TEXT' },
        { name: 'program', type: 'TEXT' }, // Also check for 'program' for backward compatibility
        { name: 'grade', type: 'TEXT' },
        { name: 'subject', type: 'TEXT' },
        { name: 'topic', type: 'TEXT' },
        { name: 'skill', type: 'TEXT' },
        { name: 'question_type', type: 'TEXT' },
        { name: 'difficulty', type: 'INTEGER' },
        { name: 'content', type: 'TEXT' },
        { name: 'answer', type: 'TEXT' },
        { name: 'correct_answer', type: 'TEXT' },
        { name: 'solution', type: 'TEXT' },
        { name: 'year', type: 'INTEGER' },
        { name: 'note', type: 'TEXT' },
        { name: 'created_at', type: 'DATETIME', defaultValue: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'DATETIME', defaultValue: 'CURRENT_TIMESTAMP' }
    ];

    // Get existing columns
    db.all("PRAGMA table_info(questions)", [], (err, rows) => {
        if (err) {
            console.error('Error checking table info:', err);
            return;
        }

        const existingColumns = rows.map(row => row.name);
        let migrationCount = 0;

        columnsToCheck.forEach(col => {
            if (!existingColumns.includes(col.name)) {
                migrationCount++;
                // SQLite doesn't support DEFAULT in ALTER TABLE ADD COLUMN for some versions
                // So we add the column first, then update existing rows if needed
                let sql = `ALTER TABLE questions ADD COLUMN ${col.name} ${col.type}`;
                if (col.defaultValue && (col.name === 'created_at' || col.name === 'updated_at')) {
                    // For timestamp columns, we'll handle defaults in INSERT/UPDATE queries
                    sql = `ALTER TABLE questions ADD COLUMN ${col.name} ${col.type}`;
                }
                
                db.run(sql, (err) => {
                    if (err) {
                        console.error(`Error adding column ${col.name}:`, err);
                    } else {
                        console.log(`✓ Added column: ${col.name}`);
                    }
                });
            }
        });

        if (migrationCount === 0) {
            console.log('Database schema is up to date');
        } else {
            console.log(`Migration: Added ${migrationCount} missing column(s)`);
        }
    });
}

// ============ API ROUTES ============

// Lưu câu hỏi mới
app.post('/api/questions', (req, res) => {
    const {
        program, program_type, grade, subject, topic, skill,
        question_type, difficulty, content, answer,
        correct_answer, solution, year, note
    } = req.body;

    // Map program to program_type if needed (for backward compatibility)
    const programValue = program_type || program || '';

    // Check which column exists in database and use appropriate SQL
    // Try to insert with both program and program_type support
    const sql = `INSERT INTO questions 
        (program_type, grade, subject, topic, skill, question_type, difficulty, content, answer, correct_answer, solution, year, note)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [programValue, grade, subject, topic, skill, question_type, difficulty, content, answer, correct_answer, solution, year, note], function(err) {
        if (err) {
            console.error('Error saving question:', err);
            res.json({ success: false, message: err.message });
        } else {
            console.log(`[Save Question] ✓ Đã lưu câu hỏi ID: ${this.lastID}`);
            console.log(`[Save Question] Chương trình: ${programValue}, Lớp: ${grade}, Môn: ${subject}`);
            console.log(`[Save Question] Chủ đề: ${topic || 'N/A'}, Kỹ năng: ${skill || 'N/A'}`);
            console.log(`[Save Question] Dạng: ${question_type}, Độ khó: ${difficulty}`);
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
    const { program, program_type, grade, subject, topic, skill, question_type, difficulty, year, keyword, page = 1, limit = 20 } = req.body;

    // Log để debug
    console.log('[Search] Request body:', {
        program,
        program_type,
        grade,
        subject,
        topic,
        skill,
        question_type,
        difficulty,
        year,
        keyword
    });

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

    // Check for both program and program_type - map to program_type column
    const programValue = program_type || program;
    if (programValue) {
        addFilter('program', programValue, 'program_type'); // Map to program_type column
    }
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
        console.log('[Search] SQL:', sql);
        console.log('[Search] Params:', params);
        
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Error searching questions:', err);
                res.json({ success: false, message: err.message, data: [] });
            } else {
                console.log(`[Search] Found ${rows ? rows.length : 0} questions (total: ${countResult.total})`);
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
        program, program_type, grade, subject, topic, skill,
        question_type, difficulty, content, answer,
        correct_answer, solution, year, note
    } = req.body;

    // Map program to program_type if needed
    const programValue = program_type || program || '';

    const sql = `UPDATE questions SET 
        program_type = ?, grade = ?, subject = ?, topic = ?, skill = ?,
        question_type = ?, difficulty = ?, content = ?, answer = ?,
        correct_answer = ?, solution = ?, year = ?, note = ?,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`;

    db.run(sql, [programValue, grade, subject, topic, skill, question_type, difficulty, content, answer, correct_answer, solution, year, note, id], function(err) {
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
    const { grade, config, selectedTypes } = req.body;
    
    // Log toàn bộ request để debug
    console.log('[Exam Generate] Full request body:', JSON.stringify(req.body, null, 2));
    
    // Validate input
    if (!config || !Array.isArray(config) || config.length === 0) {
        console.warn('[Exam Generate] Invalid config:', { config, grade, selectedTypes });
        res.json({ success: false, message: 'Cấu hình đề thi không hợp lệ: config array rỗng hoặc không tồn tại', data: [], total: 0 });
        return;
    }
    
    console.log(`[Exam Generate] Processing ${config.length} sections for grade: ${grade}`);

    let allQuestions = [];
    let completed = 0;
    let hasError = false;

    // Map difficulty levels: nb=1, th=2, vd=3, vdc=4
    const difficultyMap = {
        'nb': 1,
        'th': 2,
        'vd': 3,
        'vdc': 4
    };

    // Map question types: tn=mc, ds=tf, tl=short, kt=drag
    const questionTypeMap = {
        'tn': 'mc',
        'ds': 'tf',
        'tl': 'short',
        'kt': 'drag'
    };

    config.forEach((section, index) => {
        let sql = 'SELECT * FROM questions WHERE 1=1';
        let params = [];

        // Log để debug
        console.log(`[Exam Generate] Section ${index}:`, {
            grade,
            typeId: section.typeId,
            questionType: section.questionType,
            level: section.level,
            count: section.count
        });

        // Filter by grade if provided
        if (grade) {
            sql += ' AND grade = ?';
            params.push(grade);
        }

        // Map question type (tn -> mc, ds -> tf, etc.)
        const dbQuestionType = questionTypeMap[section.questionType] || section.questionType;
        if (dbQuestionType) {
            sql += ' AND question_type = ?';
            params.push(dbQuestionType);
        }

        // Map difficulty level
        if (section.level && section.level !== 'all') {
            const difficulty = difficultyMap[section.level];
            if (difficulty) {
                sql += ' AND difficulty = ?';
                params.push(difficulty);
            }
        } else if (section.level === 'all') {
            // For DS (Đúng/Sai), include all difficulty levels
            sql += ' AND difficulty IN (1, 2, 3, 4)';
        }

        // Filter by topic or skill (typeId can be either topic ID or skill ID)
        // Check if typeId matches a skill pattern (contains dashes like "0H5-1-3")
        // or a topic pattern (like "HH10_4", "DS10_1")
        if (section.typeId) {
            // If typeId contains dashes, it's likely a skill ID
            if (section.typeId.includes('-')) {
                sql += ' AND skill = ?';
                params.push(section.typeId);
            } else {
                // Otherwise, it's likely a topic ID
                sql += ' AND topic = ?';
                params.push(section.typeId);
            }
        }

        // Get the count of questions needed
        const count = section.count || 1;

        sql += ' ORDER BY RANDOM() LIMIT ?';
        params.push(count);

        // Log SQL query for debugging
        console.log(`[Exam Generate] SQL: ${sql}`);
        console.log(`[Exam Generate] Params:`, params);

        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Error fetching questions for section:', err);
                hasError = true;
            } else {
                console.log(`[Exam Generate] Found ${rows ? rows.length : 0} questions for section ${index}`);
                // Check if we got enough questions
                if (!rows || rows.length < count) {
                    console.warn(`Warning: Only found ${rows ? rows.length : 0} questions for section ${index}, requested ${count}`);
                    console.warn(`Query was: ${sql}`);
                    console.warn(`Params were:`, params);
                }
                if (rows && rows.length > 0) {
                    allQuestions = allQuestions.concat(rows);
                }
            }
            
            completed++;
            if (completed === config.length) {
                console.log(`[Exam Generate] Completed all ${config.length} sections. Total questions found: ${allQuestions.length}`);
                
                if (hasError) {
                    res.json({ 
                        success: false, 
                        message: 'Có lỗi xảy ra khi tạo đề thi', 
                        data: allQuestions, 
                        total: allQuestions.length 
                    });
                } else if (allQuestions.length === 0) {
                    // Không tìm thấy câu hỏi nào - cung cấp thông tin debug
                    console.warn('[Exam Generate] No questions found. Check database for matching questions.');
                    res.json({
                        success: true,
                        data: [],
                        total: 0,
                        message: `Đã tạo đề thi với 0 câu hỏi. Không tìm thấy câu hỏi phù hợp với cấu hình. Vui lòng kiểm tra:\n- Grade: ${grade}\n- Config sections: ${config.length}\n- Database có câu hỏi với skill/topic tương ứng không?`
                    });
                } else {
                    res.json({
                        success: true,
                        data: allQuestions,
                        total: allQuestions.length,
                        message: `Đã tạo đề thi với ${allQuestions.length} câu hỏi`
                    });
                }
            }
        });
    });
});

// Debug endpoint - Xem dữ liệu mẫu trong database
app.get('/api/debug/questions-sample', (req, res) => {
    db.all('SELECT id, program_type, grade, subject, topic, skill, question_type, difficulty FROM questions LIMIT 10', [], (err, rows) => {
        if (err) {
            res.json({ success: false, message: err.message, data: [] });
        } else {
            res.json({
                success: true,
                data: rows,
                message: `Found ${rows.length} sample questions`
            });
        }
    });
});

// Debug endpoint - Kiểm tra câu hỏi theo filter
app.post('/api/debug/check-questions', (req, res) => {
    const { grade, skill, topic, question_type, difficulty } = req.body;
    
    let sql = 'SELECT id, program_type, grade, subject, topic, skill, question_type, difficulty FROM questions WHERE 1=1';
    let params = [];
    
    if (grade) {
        sql += ' AND grade = ?';
        params.push(grade);
    }
    if (skill) {
        sql += ' AND skill = ?';
        params.push(skill);
    }
    if (topic) {
        sql += ' AND topic = ?';
        params.push(topic);
    }
    if (question_type) {
        sql += ' AND question_type = ?';
        params.push(question_type);
    }
    if (difficulty) {
        sql += ' AND difficulty = ?';
        params.push(difficulty);
    }
    
    sql += ' LIMIT 20';
    
    console.log('[Debug] Checking questions with SQL:', sql);
    console.log('[Debug] Params:', params);
    
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.json({ success: false, message: err.message, data: [] });
        } else {
            res.json({
                success: true,
                data: rows,
                count: rows.length,
                message: `Found ${rows.length} questions matching criteria`
            });
        }
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
    console.log('  GET  /api/debug/questions-sample - Xem mẫu dữ liệu (debug)');
});

