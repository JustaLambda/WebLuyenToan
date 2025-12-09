// Script to insert 5 demo questions for testing
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    }
    console.log('Connected to SQLite database');
    
    // Demo questions data
    const demoQuestions = [
        {
            program_type: 'Chương trình phổ thông',
            grade: 'Lop10',
            subject: 'Hình học & Vectơ 10',
            topic: 'HH10_4',
            skill: '0H5-1-3',
            question_type: 'mc',
            difficulty: 1,
            content: '<p>Cho hai vectơ \\(\\vec{a} = (2, 3)\\) và \\(\\vec{b} = (1, -1)\\). Tính \\(\\vec{a} + \\vec{b}\\)?</p>',
            answer: JSON.stringify(['(3, 2)', '(1, 4)', '(2, 2)', '(3, 4)']),
            correct_answer: 'A',
            solution: '<p>Ta có: \\(\\vec{a} + \\vec{b} = (2+1, 3+(-1)) = (3, 2)\\)</p>',
            year: 2025,
            note: 'Demo question 1'
        },
        {
            program_type: 'Chương trình phổ thông',
            grade: 'Lop10',
            subject: 'Hình học & Vectơ 10',
            topic: 'HH10_4',
            skill: '0H5-1-3',
            question_type: 'mc',
            difficulty: 1,
            content: '<p>Vectơ \\(\\vec{u} = (4, 6)\\) có độ dài bằng bao nhiêu?</p>',
            answer: JSON.stringify(['\\(2\\sqrt{13}\\)', '\\(10\\)', '\\(\\sqrt{52}\\)', '\\(52\\)']),
            correct_answer: 'A',
            solution: '<p>Độ dài vectơ: \\(|\\vec{u}| = \\sqrt{4^2 + 6^2} = \\sqrt{16 + 36} = \\sqrt{52} = 2\\sqrt{13}\\)</p>',
            year: 2025,
            note: 'Demo question 2'
        },
        {
            program_type: 'Chương trình phổ thông',
            grade: 'Lop10',
            subject: 'Hình học & Vectơ 10',
            topic: 'HH10_4',
            skill: '0H5-1-3',
            question_type: 'mc',
            difficulty: 1,
            content: '<p>Cho \\(\\vec{a} = (3, 4)\\). Vectơ đối của \\(\\vec{a}\\) là:</p>',
            answer: JSON.stringify(['\\((-3, -4)\\)', '\\((3, -4)\\)', '\\((-3, 4)\\)', '\\((0, 0)\\)']),
            correct_answer: 'A',
            solution: '<p>Vectơ đối của \\(\\vec{a} = (3, 4)\\) là \\(-\\vec{a} = (-3, -4)\\)</p>',
            year: 2025,
            note: 'Demo question 3'
        },
        {
            program_type: 'Chương trình phổ thông',
            grade: 'Lop10',
            subject: 'Hình học & Vectơ 10',
            topic: 'HH10_4',
            skill: '0H5-1-3',
            question_type: 'mc',
            difficulty: 1,
            content: '<p>Cho \\(\\vec{a} = (1, 2)\\) và \\(\\vec{b} = (3, 1)\\). Tính \\(2\\vec{a} - \\vec{b}\\)?</p>',
            answer: JSON.stringify(['\\((-1, 3)\\)', '\\((5, 3)\\)', '\\((2, 4)\\)', '\\((1, 1)\\)']),
            correct_answer: 'A',
            solution: '<p>Ta có: \\(2\\vec{a} - \\vec{b} = 2(1, 2) - (3, 1) = (2, 4) - (3, 1) = (-1, 3)\\)</p>',
            year: 2025,
            note: 'Demo question 4'
        },
        {
            program_type: 'Chương trình phổ thông',
            grade: 'Lop10',
            subject: 'Hình học & Vectơ 10',
            topic: 'HH10_4',
            skill: '0H5-1-3',
            question_type: 'mc',
            difficulty: 1,
            content: '<p>Hai vectơ \\(\\vec{a}\\) và \\(\\vec{b}\\) bằng nhau khi và chỉ khi:</p>',
            answer: JSON.stringify([
                'Chúng có cùng hướng và cùng độ dài',
                'Chúng có cùng độ dài',
                'Chúng có cùng hướng',
                'Chúng có cùng điểm đầu'
            ]),
            correct_answer: 'A',
            solution: '<p>Hai vectơ bằng nhau khi và chỉ khi chúng có cùng hướng và cùng độ dài.</p>',
            year: 2025,
            note: 'Demo question 5'
        }
    ];

    // Check if correct_answer column exists
    db.all("PRAGMA table_info(questions)", [], (err, columns) => {
        if (err) {
            console.error('Error checking table info:', err);
            db.close();
            process.exit(1);
        }

        const hasCorrectAnswer = columns.some(col => col.name === 'correct_answer');
        const hasYear = columns.some(col => col.name === 'year');

        // Build SQL based on available columns
        let sql, paramsTemplate;
        if (hasCorrectAnswer && hasYear) {
            sql = `INSERT INTO questions 
                (program_type, grade, subject, topic, skill, question_type, difficulty, content, answer, correct_answer, solution, year, note)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        } else if (hasCorrectAnswer) {
            sql = `INSERT INTO questions 
                (program_type, grade, subject, topic, skill, question_type, difficulty, content, answer, correct_answer, solution, note)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        } else if (hasYear) {
            sql = `INSERT INTO questions 
                (program_type, grade, subject, topic, skill, question_type, difficulty, content, answer, solution, year, note)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        } else {
            sql = `INSERT INTO questions 
                (program_type, grade, subject, topic, skill, question_type, difficulty, content, answer, solution, note)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        }

        let inserted = 0;
        let errors = 0;

        demoQuestions.forEach((q, index) => {
            let params;
            if (hasCorrectAnswer && hasYear) {
                params = [
                    q.program_type, q.grade, q.subject, q.topic, q.skill,
                    q.question_type, q.difficulty, q.content, q.answer,
                    q.correct_answer, q.solution, q.year, q.note
                ];
            } else if (hasCorrectAnswer) {
                params = [
                    q.program_type, q.grade, q.subject, q.topic, q.skill,
                    q.question_type, q.difficulty, q.content, q.answer,
                    q.correct_answer, q.solution, q.note
                ];
            } else if (hasYear) {
                params = [
                    q.program_type, q.grade, q.subject, q.topic, q.skill,
                    q.question_type, q.difficulty, q.content, q.answer,
                    q.solution, q.year, q.note
                ];
            } else {
                params = [
                    q.program_type, q.grade, q.subject, q.topic, q.skill,
                    q.question_type, q.difficulty, q.content, q.answer,
                    q.solution, q.note
                ];
            }

            db.run(sql, params, function(err) {
            if (err) {
                console.error(`Error inserting question ${index + 1}:`, err);
                errors++;
            } else {
                console.log(`✓ Inserted question ${index + 1} (ID: ${this.lastID})`);
                inserted++;
            }

                // Check if all done
                if (inserted + errors === demoQuestions.length) {
                    console.log(`\n=== Summary ===`);
                    console.log(`Inserted: ${inserted}`);
                    console.log(`Errors: ${errors}`);
                    db.close();
                    process.exit(errors > 0 ? 1 : 0);
                }
            });
        });
    });
});

