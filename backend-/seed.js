require('dotenv').config();
const { sequelize, Book } = require('./models');
const syncDatabase = require('./config/syncDatabase');
const { normalizeBookInput } = require('./services/dataPreprocessor');

async function seedData() {
    try {
        await sequelize.authenticate();
        await syncDatabase();

        const samples = [
            ['Giáo trình Cấu trúc dữ liệu và giải thuật', 'Cấu trúc dữ liệu', 'Công nghệ thông tin'],
            ['Lập trình Web nâng cao với Node.js', 'Lập trình Web', 'Công nghệ thông tin'],
            ['Giải tích 1 cho kỹ thuật', 'Toán cao cấp', 'Công nghệ thông tin'],
            ['Chi tiết máy và thiết kế cơ khí', 'Chi tiết máy', 'Cơ khí']
        ];

        for (const [title, subject, major] of samples) {
            const normalizedBook = normalizeBookInput({ title, subject, major });
            if (!normalizedBook.title || !normalizedBook.subject || !normalizedBook.major) {
                continue;
            }

            await Book.findOrCreate({
                where: { title: normalizedBook.title },
                defaults: { subject: normalizedBook.subject, major: normalizedBook.major }
            });
        }

        console.log('Đã thêm tài liệu mẫu; dữ liệu hiện có được giữ nguyên.');
    } catch (error) {
        console.error('Lỗi khi seed dữ liệu:', error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

seedData();