# Booking Sharing Platform



Nền tảng chia sẻ và trao đổi sách giáo trình, tài liệu học tập cho sinh viên khối ngành kỹ thuật kết hợp hệ thống gợi ý thông minh.



## Công nghệ



- Frontend: HTML, CSS và JavaScript


- Backend: Node.js, Express.js, Sequelize và PostgreSQL

- Database: PostgreSQL

- Gợi ý tài liệu: dựa trên ngành học và lịch sử tương tác

Dữ liệu như ngành học, môn học và tên tài liệu được chuẩn hóa trước khi lưu và khi tạo gợi ý, giúp các biến thể như "CNTT", "Công nghệ thông tin" hay "Cấu trúc dữ liệu"/"CTDL" được xử lý thống nhất.

## Chạy ứng dụng

1. Cài Node.js và PostgreSQL, sau đó tạo database `book_platform_db`.
2. Mở terminal tại `backend-`, chạy `npm install`.
3. Sao chép `.env.example` thành `.env`, rồi điền thông tin kết nối PostgreSQL và thay `JWT_SECRET` bằng một chuỗi bí mật ngẫu nhiên.
4. Chạy `npm run seed` để thêm một số tài liệu mẫu. Lệnh này không xóa dữ liệu hiện có.
5. Chạy `npm start`, sau đó mở `http://localhost:5000`.

Frontend và API được phục vụ cùng tại cổng 5000. API gồm `/api/auth`, `/api/books`, `/api/interactions` và `/api/recommendations`. Tạo tài khoản cần email, mật khẩu tối thiểu 8 ký tự và ngành học. Tài khoản cũ chưa có mật khẩu cần được quản trị viên đặt lại mật khẩu; hoặc đăng ký bằng email khác.

Frontend hiện được tách thành năm trang riêng trong `frontend/`: `giaodien.html` (trang chủ), `tailieu.html` (tìm kiếm/lọc), `chitiet.html` (chi tiết và đề nghị trao đổi), `tailieucuatoi.html` (đăng/quản lý tài liệu) và `hoso.html` (tài khoản/hồ sơ). Các trang dùng chung `giaodien.css` và `studyshare-pages.js`; khi mở trực tiếp bằng `file://`, frontend gọi API tại `http://localhost:5000/api`.
