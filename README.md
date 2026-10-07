# Booking Sharing Platform



Nền tảng chia sẻ và trao đổi sách giáo trình, tài liệu học tập cho sinh viên khối ngành kỹ thuật kết hợp hệ thống gợi ý thông minh.



## Công nghệ



- Frontend: HTML, CSS và JavaScript


- Backend: Node.js, Express.js, Sequelize và MySQL

- Database: MySQL

- Gợi ý tài liệu: dựa trên ngành học và lịch sử tương tác

## Chạy ứng dụng

1. Cài Node.js và MySQL, sau đó tạo database `book_platform_db` trong MySQL.
2. Mở terminal tại `backend-`, chạy `npm install`.
3. Sao chép `.env.example` thành `.env`, rồi điền thông tin MySQL và thay `JWT_SECRET` bằng một chuỗi bí mật ngẫu nhiên.
4. Chạy `npm run seed` để thêm một số tài liệu mẫu. Lệnh này không xóa dữ liệu hiện có.
5. Chạy `npm start`, sau đó mở `http://localhost:5000`.

Frontend và API được phục vụ cùng tại cổng 5000. API gồm `/api/auth`, `/api/books`, `/api/interactions` và `/api/recommendations`. Tạo tài khoản cần email, mật khẩu tối thiểu 8 ký tự và ngành học. Tài khoản cũ chưa có mật khẩu cần được quản trị viên đặt lại mật khẩu; hoặc đăng ký bằng email khác.

Khi phát triển giao diện riêng, file `frontend/giaodien.js` mặc định gọi API tại `http://localhost:5000/api`.
