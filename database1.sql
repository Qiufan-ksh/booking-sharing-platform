DROP DATABASE IF EXISTS book_sharing;
CREATE DATABASE book_sharing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE book_sharing;

CREATE TABLE majors (
    major_id INT PRIMARY KEY AUTO_INCREMENT,
    major_name VARCHAR(150) NOT NULL,
    faculty VARCHAR(150),
    description TEXT
);

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    major_id INT,
    year_of_study INT,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_major FOREIGN KEY (major_id) REFERENCES majors(major_id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    course_code VARCHAR(30) NOT NULL UNIQUE,
    course_name VARCHAR(150) NOT NULL,
    major_id INT,
    description TEXT,
    CONSTRAINT fk_courses_major FOREIGN KEY (major_id) REFERENCES majors(major_id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE user_courses (
    user_id INT,
    course_id INT,
    semester VARCHAR(30),
    status ENUM('STUDYING', 'COMPLETED', 'PLANNED') DEFAULT 'STUDYING',
    PRIMARY KEY (user_id, course_id),
    CONSTRAINT fk_user_courses_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_courses_course FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE authors (
    author_id INT PRIMARY KEY AUTO_INCREMENT,
    author_name VARCHAR(150) NOT NULL,
    biography TEXT
);

CREATE TABLE books (
    book_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    isbn VARCHAR(50),
    description TEXT,
    publisher VARCHAR(150),
    publication_year YEAR,
    language VARCHAR(50) DEFAULT 'Vietnamese',
    condition_status ENUM('NEW', 'GOOD', 'USED', 'OLD') DEFAULT 'GOOD',
    file_url VARCHAR(500),
    cover_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE book_categories (
    book_id INT,
    category_id INT,
    PRIMARY KEY (book_id, category_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

CREATE TABLE book_authors (
    book_id INT,
    author_id INT,
    PRIMARY KEY (book_id, author_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors(author_id) ON DELETE CASCADE
);

CREATE TABLE book_courses (
    book_id INT,
    course_id INT,
    relevance_score DECIMAL(5,4) DEFAULT 1.0000,
    PRIMARY KEY (book_id, course_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

CREATE TABLE posts (
    post_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    post_type ENUM('SELL', 'EXCHANGE', 'GIVE') NOT NULL,
    price DECIMAL(12,2) DEFAULT 0,
    condition_status ENUM('NEW', 'GOOD', 'USED', 'OLD'),
    description TEXT,
    status ENUM('ACTIVE', 'SOLD', 'EXCHANGED', 'CLOSED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_posts_book FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
);

CREATE TABLE transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    buyer_id INT,
    seller_id INT,
    transaction_type ENUM('BUY', 'EXCHANGE', 'GIVE') NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE user_needs (
    need_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT,
    need_type ENUM('LEARN', 'EXAM', 'RESEARCH', 'REFERENCE', 'PRACTICE') NOT NULL,
    priority INT DEFAULT 1,
    description TEXT,
    status ENUM('ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE SET NULL,
    CHECK (priority BETWEEN 1 AND 5)
);

CREATE TABLE user_interactions (
    interaction_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    interaction_type ENUM('VIEW', 'CLICK', 'LIKE', 'SAVE', 'DOWNLOAD', 'SHARE', 'BUY', 'EXCHANGE') NOT NULL,
    duration_seconds INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
);

CREATE TABLE search_history (
    search_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    keyword VARCHAR(255) NOT NULL,
    course_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE SET NULL
);

CREATE TABLE favorites (
    user_id INT,
    book_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, book_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
);

CREATE TABLE ratings (
    rating_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    rating INT NOT NULL,
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
    CHECK (rating BETWEEN 1 AND 5),
    UNIQUE (user_id, book_id)
);

INSERT INTO majors (major_name, faculty, description) VALUES
('Công nghệ thông tin', 'Khoa Công nghệ thông tin', 'Đào tạo về phần mềm, hệ thống thông tin và công nghệ máy tính'),
('Khoa học máy tính', 'Khoa Công nghệ thông tin', 'Đào tạo về thuật toán, trí tuệ nhân tạo và khoa học máy tính'),
('Kỹ thuật điện', 'Khoa Điện', 'Đào tạo về điện và hệ thống điều khiển'),
('Kỹ thuật cơ khí', 'Khoa Cơ khí', 'Đào tạo về cơ khí và thiết kế máy'),
('Kinh tế', 'Khoa Kinh tế', 'Đào tạo về kinh tế và quản trị');

INSERT INTO courses (course_code, course_name, major_id, description) VALUES
('INT101', 'Lập trình cơ bản', 1, 'Kiến thức cơ bản về lập trình'),
('INT202', 'Cơ sở dữ liệu', 1, 'Cơ sở dữ liệu và hệ quản trị cơ sở dữ liệu'),
('INT203', 'Lập trình hướng đối tượng', 1, 'Lập trình hướng đối tượng'),
('CS301', 'Trí tuệ nhân tạo', 2, 'Các phương pháp và thuật toán AI'),
('CS302', 'Học máy', 2, 'Machine Learning'),
('MAT101', 'Toán cao cấp', 1, 'Giải tích và đại số'),
('NET201', 'Mạng máy tính', 1, 'Kiến thức cơ bản về mạng máy tính');

INSERT INTO categories (category_name, description) VALUES
('Giáo trình', 'Giáo trình chính thức của môn học'),
('Sách tham khảo', 'Sách tham khảo chuyên ngành'),
('Bài tập', 'Tài liệu bài tập'),
('Đề thi', 'Đề thi và đề kiểm tra'),
('Slide', 'Slide bài giảng'),
('Tài liệu nghiên cứu', 'Tài liệu phục vụ nghiên cứu');

INSERT INTO users (full_name, email, password_hash, major_id, year_of_study) VALUES
('Nguyễn Văn An', 'an@example.com', 'hashed_password_1', 1, 2),
('Trần Minh Bình', 'binh@example.com', 'hashed_password_2', 1, 3),
('Lê Thu Hà', 'ha@example.com', 'hashed_password_3', 2, 3),
('Phạm Minh Đức', 'duc@example.com', 'hashed_password_4', 1, 4),
('Hoàng Anh', 'anh@example.com', 'hashed_password_5', 2, 2);

INSERT INTO authors (author_name, biography) VALUES
('Abraham Silberschatz', 'Tác giả nổi tiếng trong lĩnh vực cơ sở dữ liệu và hệ điều hành'),
('Henry F. Korth', 'Tác giả sách Database System Concepts'),
('Robert Lafore', 'Tác giả tài liệu lập trình Java'),
('Thomas H. Cormen', 'Đồng tác giả Introduction to Algorithms');

INSERT INTO books (title, isbn, description, publisher, publication_year, language, condition_status) VALUES
('Database System Concepts', '9780073523323', 'Giáo trình cơ sở dữ liệu', 'McGraw-Hill', 2019, 'English', 'GOOD'),
('Lập trình Java cơ bản', 'JAVA001', 'Tài liệu học lập trình Java', 'NXB Giáo dục', 2023, 'Vietnamese', 'NEW'),
('Introduction to Algorithms', '9780262046305', 'Giáo trình thuật toán', 'MIT Press', 2022, 'English', 'GOOD'),
('Cơ sở dữ liệu', 'CSDL001', 'Giáo trình cơ sở dữ liệu dành cho sinh viên CNTT', 'NXB Đại học', 2023, 'Vietnamese', 'GOOD'),
('Machine Learning cơ bản', 'ML001', 'Tài liệu nhập môn học máy', 'NXB Khoa học', 2024, 'Vietnamese', 'NEW'),
('Mạng máy tính', 'NET001', 'Giáo trình mạng máy tính', 'NXB Giáo dục', 2022, 'Vietnamese', 'USED');

INSERT INTO book_authors (book_id, author_id) VALUES
(1, 1), (1, 2), (2, 3), (3, 4);

INSERT INTO book_categories (book_id, category_id) VALUES
(1, 1), (1, 2), (2, 1), (2, 2), (3, 1), (3, 2), (4, 1), (5, 1), (5, 2), (6, 1);

INSERT INTO book_courses (book_id, course_id, relevance_score) VALUES
(1, 2, 1.0000), (1, 3, 0.2000), (2, 3, 1.0000), (2, 1, 0.8000),
(3, 1, 0.7000), (3, 4, 0.5000), (4, 2, 1.0000), (5, 5, 1.0000),
(5, 4, 0.8000), (6, 7, 1.0000);

INSERT INTO user_courses (user_id, course_id, semester, status) VALUES
(1, 1, '2026-2027-1', 'COMPLETED'), (1, 2, '2026-2027-1', 'STUDYING'), (1, 3, '2026-2027-1', 'STUDYING'),
(2, 2, '2026-2027-1', 'COMPLETED'), (2, 3, '2026-2027-1', 'COMPLETED'), (2, 7, '2026-2027-1', 'STUDYING'),
(3, 4, '2026-2027-1', 'STUDYING'), (3, 5, '2026-2027-1', 'STUDYING'),
(4, 2, '2026-2027-1', 'COMPLETED'), (4, 7, '2026-2027-1', 'COMPLETED'),
(5, 4, '2026-2027-1', 'STUDYING');

INSERT INTO posts (user_id, book_id, post_type, price, condition_status, description) VALUES
(1, 4, 'SELL', 80000, 'GOOD', 'Giáo trình Cơ sở dữ liệu còn khá mới'),
(2, 2, 'EXCHANGE', 0, 'GOOD', 'Muốn đổi giáo trình Java lấy sách Python'),
(3, 5, 'SELL', 120000, 'NEW', 'Sách Machine Learning mới'),
(4, 6, 'GIVE', 0, 'USED', 'Tặng lại giáo trình Mạng máy tính');

INSERT INTO transactions (post_id, buyer_id, seller_id, transaction_type, status) VALUES
(1, 2, 1, 'BUY', 'COMPLETED'),
(3, 5, 3, 'BUY', 'COMPLETED'),
(4, 1, 4, 'GIVE', 'COMPLETED');

INSERT INTO user_needs (user_id, course_id, need_type, priority, description) VALUES
(1, 2, 'EXAM', 5, 'Cần tài liệu ôn thi Cơ sở dữ liệu'),
(1, 3, 'PRACTICE', 4, 'Cần bài tập Java OOP'),
(2, 2, 'REFERENCE', 3, 'Cần sách tham khảo về CSDL'),
(3, 5, 'LEARN', 5, 'Muốn học Machine Learning từ cơ bản'),
(4, 7, 'EXAM', 4, 'Cần tài liệu ôn thi Mạng máy tính');

INSERT INTO user_interactions (user_id, book_id, interaction_type, duration_seconds) VALUES
(1, 1, 'VIEW', 180), (1, 1, 'CLICK', 30), (1, 4, 'VIEW', 240), (1, 4, 'SAVE', 10), (1, 2, 'VIEW', 100), (1, 2, 'LIKE', 5),
(2, 1, 'VIEW', 300), (2, 4, 'VIEW', 250), (2, 4, 'LIKE', 5), (2, 6, 'VIEW', 200),
(3, 5, 'VIEW', 400), (3, 5, 'SAVE', 10), (3, 3, 'VIEW', 150),
(4, 1, 'VIEW', 220), (4, 6, 'VIEW', 300),
(5, 5, 'VIEW', 350);

INSERT INTO search_history (user_id, keyword, course_id) VALUES
(1, 'cơ sở dữ liệu', 2), (1, 'SQL JOIN', 2), (1, 'Java OOP', 3),
(2, 'database', 2), (2, 'SQL', 2), (2, 'mạng máy tính', 7),
(3, 'machine learning', 5), (3, 'Python AI', 5),
(4, 'network', 7),
(5, 'machine learning', 5);

INSERT INTO favorites (user_id, book_id) VALUES
(1, 1), (1, 4), (2, 1), (2, 4), (3, 5), (4, 6), (5, 5);

INSERT INTO ratings (user_id, book_id, rating, review) VALUES
(1, 1, 5, 'Giáo trình rất phù hợp để học CSDL'),
(2, 1, 5, 'Nội dung đầy đủ'),
(2, 4, 4, 'Dễ hiểu'),
(3, 5, 5, 'Phù hợp cho người mới học'),
(4, 6, 4, 'Nội dung tốt');

CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_created ON books(created_at);
CREATE INDEX idx_interactions_user ON user_interactions(user_id);
CREATE INDEX idx_interactions_book ON user_interactions(book_id);
CREATE INDEX idx_interactions_type ON user_interactions(interaction_type);
CREATE INDEX idx_search_user ON search_history(user_id);
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_book ON posts(book_id);
CREATE INDEX idx_ratings_book ON ratings(book_id);