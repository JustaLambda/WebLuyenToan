// API Client for Question Management
// Hỗ trợ cả Server API và localStorage fallback

const API = {
    // Base URL cho API server
    // Sử dụng Render.com URL nếu đang chạy trên Render, nếu không dùng localhost
    BASE_URL: (() => {
        // Nếu đang chạy trên Render.com (có thể detect qua hostname)
        if (window.location.hostname.includes('render.com') || window.location.hostname.includes('onrender.com')) {
            return window.location.origin + '/api';
        }
        // Hoặc nếu có biến môi trường hoặc config
        return window.location.origin + '/api';
    })(),
    
    // Chế độ: 'server' hoặc 'local'
    MODE: 'server', // Luôn dùng server, không fallback tự động
    
    // ============ HELPER FUNCTIONS ============
    
    // Gọi API
    async _fetch(endpoint, options = {}) {
        const url = this.BASE_URL + endpoint;
        console.log('[API] Calling:', url, options.method || 'GET');
        
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                console.error('[API] Response error:', response.status, errorData);
                throw new Error(errorData.message || `Server error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('[API] Success:', endpoint, data);
            return data;
        } catch (error) {
            console.error('[API] Fetch error:', error);
            // KHÔNG tự động fallback - để caller quyết định
            throw error;
        }
    },
    
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
        if (this.MODE === 'server') {
            try {
                console.log('[API] Saving question to server:', questionData);
                const result = await this._fetch('/questions', {
                    method: 'POST',
                    body: JSON.stringify(questionData)
                });
                console.log('[API] Question saved successfully:', result);
                return result;
            } catch (e) {
                console.error('[API] Failed to save to server:', e);
                // KHÔNG fallback tự động - throw error để UI hiển thị
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.');
            }
        }
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
        if (this.MODE === 'server') {
            try {
                return await this._fetch('/questions/search', {
                    method: 'POST',
                    body: JSON.stringify(searchParams)
                });
            } catch (e) {
                return this._searchQuestionsLocal(searchParams);
            }
        }
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
        if (this.MODE === 'server') {
            try {
                return await this._fetch('/questions/' + id);
            } catch (e) {
                return this._getQuestionByIdLocal(id);
            }
        }
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
        if (this.MODE === 'server') {
            try {
                return await this._fetch(`/questions?page=${page}&limit=${limit}`);
            } catch (e) {
                return this._getAllQuestionsLocal(page, limit);
            }
        }
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
        if (this.MODE === 'server') {
            try {
                return await this._fetch('/questions/' + id, { method: 'DELETE' });
            } catch (e) {
                return this._deleteQuestionLocal(id);
            }
        }
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
        if (this.MODE === 'server') {
            try {
                return await this._fetch('/questions/' + id, {
                    method: 'PUT',
                    body: JSON.stringify(questionData)
                });
            } catch (e) {
                return this._updateQuestionLocal(id, questionData);
            }
        }
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
        if (this.MODE === 'server') {
            try {
                console.log('[API] Generating exam from server:', examConfig);
                const result = await this._fetch('/exams/generate', {
                    method: 'POST',
                    body: JSON.stringify(examConfig)
                });
                console.log('[API] Exam generated successfully:', result);
                return result;
            } catch (e) {
                console.error('[API] Failed to generate exam from server:', e);
                // KHÔNG fallback tự động - throw error để UI hiển thị
                throw new Error('Không thể tạo đề thi từ server. Vui lòng kiểm tra kết nối mạng và thử lại.');
            }
        }
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
