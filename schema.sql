-- =========================================================================
-- DATABASE SCHEMA HOÀN CHỈNH & TƯƠNG THÍCH 100% VỚI TOÀN BỘ FOLDER API
-- Hệ thống tự động giám sát, tóm tắt và đánh giá chất lượng cuộc gọi Telesale
-- =========================================================================

-- 1. Bảng người dùng hệ thống (Telesale, QA Supervisor, Admin)
-- Tương thích API: /api/v1/users/ (UserCreate, UserResponse, UserService)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'telesales',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng nhà mạng / đơn vị vận hành tổng đài (Operators)
CREATE TABLE operators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng dự án / chiến dịch telesale (Projects)
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng bộ tiêu chí kịch bản đánh giá QA (Checklists)
CREATE TABLE checklists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    data JSON,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bảng bộ từ điển từ khóa cấm / nhạy cảm / bắt buộc (Vocabularies)
CREATE TABLE vocabularies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    type VARCHAR(20),
    color_hex VARCHAR(20),
    data JSON,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bảng liên kết N-N giữa Dự án và Bộ tiêu chí (Project - Checklists)
CREATE TABLE project_checklists (
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    checklist_id INTEGER NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, checklist_id)
);

-- 7. Bảng liên kết N-N giữa Dự án và Bộ từ điển (Project - Vocabularies)
CREATE TABLE project_vocabularies (
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    vocabulary_id INTEGER NOT NULL REFERENCES vocabularies(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, vocabulary_id)
);

-- 8. Bảng bản ghi cuộc gọi (Call Records)
-- Tương thích API: /api/v1/calls/ (CallRecordCreate, CallRecordResponse, CallService)
CREATE TABLE call_records (
    id SERIAL PRIMARY KEY,
    telesale_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    operator_id INTEGER REFERENCES operators(id) ON DELETE SET NULL,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    file_path VARCHAR(255) NOT NULL,
    audio_duration INTEGER,
    transcript TEXT,
    compliance_score DOUBLE PRECISION DEFAULT 100.0,
    sentiment VARCHAR(50),
    client_number VARCHAR(50),
    call_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Bảng chi tiết các lỗi vi phạm trong cuộc gọi (Violations)
-- Tương thích API: /api/v1/violations/ (ViolationResponse, CallService.get_violations)
CREATE TABLE violations (
    id SERIAL PRIMARY KEY,
    call_record_id INTEGER NOT NULL REFERENCES call_records(id) ON DELETE CASCADE,
    violation_type VARCHAR(50) NOT NULL,
    keyword_detected VARCHAR(100),
    snippet TEXT,
    timestamp DOUBLE PRECISION,
    severity VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Bảng quản lý tác vụ phiên âm bất đồng bộ với GPU Server (ASR Jobs)
-- Tương thích API: /api/v1/transcribe/ (upload, status, poll, AsrService)
CREATE TABLE asr_jobs (
    id SERIAL PRIMARY KEY,
    job_id VARCHAR(64) UNIQUE NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    status VARCHAR(20) DEFAULT 'queued' NOT NULL,
    telesale_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    call_record_id INTEGER REFERENCES call_records(id) ON DELETE SET NULL,
    error_message TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);