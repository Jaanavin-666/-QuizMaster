-- ========================================================
-- QuizMaster MySQL Database Schema
-- Production Schema for User Management, Questions & Quizzes
-- ========================================================

CREATE DATABASE IF NOT EXISTS quizmaster_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quizmaster_db;

-- 1. Persistent Users Entity (Google OIDC Authenticated)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    google_sub VARCHAR(128) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    picture_url VARCHAR(512),
    email_verified BOOLEAN DEFAULT TRUE,
    role ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    account_status ENUM('ACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
    INDEX idx_google_sub (google_sub),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Academic & Competitive Subjects
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_ta VARCHAR(150),
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'BookOpen',
    category ENUM('PROGRAMMING', 'ACADEMICS', 'COMPETITIVE', 'GENERAL') NOT NULL DEFAULT 'GENERAL',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bilingual Questions Table (English & Tamil)
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(64) PRIMARY KEY,
    subject_id VARCHAR(64) NOT NULL,
    sub_category VARCHAR(100),
    question_en TEXT NOT NULL,
    question_ta TEXT NOT NULL,
    options_en JSON NOT NULL, -- Array of 4 English strings: ["A", "B", "C", "D"]
    options_ta JSON NOT NULL, -- Array of 4 Tamil strings: ["அ", "ஆ", "இ", "ஈ"]
    correct_answer_index TINYINT NOT NULL, -- 0, 1, 2, or 3
    difficulty ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL DEFAULT 'MEDIUM',
    marks INT NOT NULL DEFAULT 1,
    explanation_en TEXT,
    explanation_ta TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    INDEX idx_subject_diff (subject_id, difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Quiz Attempt Summary
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    subject_id VARCHAR(64) NOT NULL,
    selected_language ENUM('en', 'ta') NOT NULL DEFAULT 'en',
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL DEFAULT 0,
    incorrect_answers INT NOT NULL DEFAULT 0,
    unanswered_questions INT NOT NULL DEFAULT 0,
    score DECIMAL(6,2) NOT NULL DEFAULT 0.00,
    max_score DECIMAL(6,2) NOT NULL DEFAULT 0.00,
    percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    time_taken_seconds INT NOT NULL,
    negative_marking BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    INDEX idx_user_attempts (user_id, submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Individual Question Answers per Attempt
CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_id VARCHAR(64) NOT NULL,
    question_id VARCHAR(64) NOT NULL,
    selected_answer_index TINYINT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    marks_awarded DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
