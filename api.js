// API Client for Question Management (local-only)
// Giữ liên kết giữa các trang, không gọi server hay deploy online

const API = {
    // Chế độ chỉ dùng localStorage
    MODE: 'local',
    
    // ============ HELPER FUNCTIONS ============
    // LocalStorage helpers
    STORAGE_KEY: 'questions_database',
    
    _getQuestionsFromStorage() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },
    
    _saveQuestionsToStorage(questions) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(questions));
    },
    
    _generateId() {
        const questions = this._getQuestionsFromStorage();
        if (questions.length === 0) return 1;
        const maxId = Math.max(...questions.map(q => q.id || 0));
        return maxId + 1;
    },
    
    // ============ API METHODS ============
    
    // Lưu câu hỏi mới
    async saveQuestion(questionData) {
        return this._saveQuestionLocal(questionData);
    },
    
    _saveQuestionLocal(questionData) {
        try {
            const questions = this._getQuestionsFromStorage();
            const newId = this._generateId();
            const newQuestion = {
                ...questionData,
                id: newId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            questions.push(newQuestion);
            this._saveQuestionsToStorage(questions);
            return {
                success: true,
                message: 'Lưu câu hỏi thành công! (localStorage)',
                data: newQuestion
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Tìm kiếm câu hỏi
    async searchQuestions(searchParams) {
        return this._searchQuestionsLocal(searchParams);
    },
    
    _searchQuestionsLocal(searchParams) {
        try {
            let questions = this._getQuestionsFromStorage();
            
            const matchValue = (questionValue, filterValue) => {
                if (!filterValue) return true;
                if (Array.isArray(filterValue)) {
                    if (filterValue.length === 0) return true;
                    return filterValue.includes(questionValue);
                }
                return questionValue === filterValue;
            };
            
            if (searchParams.program) {
                questions = questions.filter(q => matchValue(q.program, searchParams.program));
            }
            if (searchParams.grade) {
                questions = questions.filter(q => matchValue(q.grade, searchParams.grade));
            }
            if (searchParams.subject) {
                questions = questions.filter(q => matchValue(q.subject, searchParams.subject));
            }
            if (searchParams.topic) {
                questions = questions.filter(q => matchValue(q.topic, searchParams.topic));
            }
            if (searchParams.skill) {
                questions = questions.filter(q => matchValue(q.skill, searchParams.skill));
            }
            if (searchParams.question_type) {
                questions = questions.filter(q => matchValue(q.question_type, searchParams.question_type));
            }
            if (searchParams.difficulty !== null && searchParams.difficulty !== undefined) {
                questions = questions.filter(q => {
                    if (Array.isArray(searchParams.difficulty)) {
                        return searchParams.difficulty.includes(q.difficulty) || 
                               searchParams.difficulty.includes(String(q.difficulty));
                    }
                    return q.difficulty == searchParams.difficulty;
                });
            }
            if (searchParams.year) {
                questions = questions.filter(q => q.year == searchParams.year);
            }
            if (searchParams.keyword) {
                const keyword = searchParams.keyword.toLowerCase();
                questions = questions.filter(q => 
                    (q.content && q.content.toLowerCase().includes(keyword)) ||
                    (q.question && q.question.toLowerCase().includes(keyword))
                );
            }
            
            const page = searchParams.page || 1;
            const limit = searchParams.limit || 20;
            const startIndex = (page - 1) * limit;
            const paginatedQuestions = questions.slice(startIndex, startIndex + limit);
            
            return {
                success: true,
                data: paginatedQuestions,
                total: questions.length,
                page: page,
                totalPages: Math.ceil(questions.length / limit)
            };
        } catch (error) {
            return { success: false, message: error.message, data: [] };
        }
    },
    
    // Lấy câu hỏi theo ID
    async getQuestionById(id) {
        return this._getQuestionByIdLocal(id);
    },
    
    _getQuestionByIdLocal(id) {
        const questions = this._getQuestionsFromStorage();
        const question = questions.find(q => q.id == id);
        if (question) {
            return { success: true, data: question };
        }
        return { success: false, message: 'Không tìm thấy câu hỏi' };
    },
    
    // Lấy tất cả câu hỏi
    async getAllQuestions(page = 1, limit = 20) {
        return this._getAllQuestionsLocal(page, limit);
    },
    
    _getAllQuestionsLocal(page = 1, limit = 20) {
        const questions = this._getQuestionsFromStorage();
        const startIndex = (page - 1) * limit;
        const paginatedQuestions = questions.slice(startIndex, startIndex + limit);
        return {
            success: true,
            data: paginatedQuestions,
            total: questions.length,
            page: page,
            totalPages: Math.ceil(questions.length / limit)
        };
    },
    
    // Xóa câu hỏi
    async deleteQuestion(id) {
        return this._deleteQuestionLocal(id);
    },
    
    _deleteQuestionLocal(id) {
        let questions = this._getQuestionsFromStorage();
        const initialLength = questions.length;
        questions = questions.filter(q => q.id != id);
        if (questions.length < initialLength) {
            this._saveQuestionsToStorage(questions);
            return { success: true, message: 'Xóa câu hỏi thành công!' };
        }
        return { success: false, message: 'Không tìm thấy câu hỏi để xóa' };
    },
    
    // Cập nhật câu hỏi
    async updateQuestion(id, questionData) {
        return this._updateQuestionLocal(id, questionData);
    },
    
    _updateQuestionLocal(id, questionData) {
        let questions = this._getQuestionsFromStorage();
        const index = questions.findIndex(q => q.id == id);
        if (index !== -1) {
            questions[index] = {
                ...questions[index],
                ...questionData,
                id: parseInt(id),
                updated_at: new Date().toISOString()
            };
            this._saveQuestionsToStorage(questions);
            return { success: true, message: 'Cập nhật thành công!', data: questions[index] };
        }
        return { success: false, message: 'Không tìm thấy câu hỏi' };
    },
    
    // Tạo đề thi
    async generateExam(examConfig) {
        return this._generateExamLocal(examConfig);
    },
    
    _generateExamLocal(examConfig) {
        let questions = this._getQuestionsFromStorage();
        let selectedQuestions = [];
        
        if (examConfig.sections) {
            examConfig.sections.forEach(section => {
                let filtered = questions.filter(q => {
                    let match = true;
                    if (section.type) match = match && q.question_type === section.type;
                    if (section.difficulty) match = match && q.difficulty == section.difficulty;
                    if (section.topic) match = match && q.topic === section.topic;
                    if (section.skill) match = match && q.skill === section.skill;
                    return match;
                });
                const count = section.count || 1;
                const shuffled = filtered.sort(() => 0.5 - Math.random());
                selectedQuestions = selectedQuestions.concat(shuffled.slice(0, count));
            });
        }
        
        return {
            success: true,
            data: selectedQuestions,
            total: selectedQuestions.length
        };
    }
};

console.log('API module loaded - Mode:', API.MODE);
