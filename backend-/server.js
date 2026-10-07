require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const syncDatabase = require('./config/syncDatabase');
const { getJwtSecret } = require('./middleware/authMiddleware');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const interactionRoutes = require('./routes/interactionRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'API đang hoạt động.' });
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'giaodien.html'));
});
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/recommendations', recommendationRoutes);

app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: 'Không tìm thấy API này.' });
});
app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);

    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ success: false, message: 'Email này đã được đăng ký.' });
    }
    if (error.statusCode === 404) {
        return res.status(404).json({ success: false, message: error.message });
    }
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeDatabaseError' && error.parent?.code === 'ER_TRUNCATED_WRONG_VALUE') {
        return res.status(400).json({ success: false, message: 'Dữ liệu gửi lên không hợp lệ.' });
    }

    console.error('Lỗi xử lý yêu cầu:', error);
    return res.status(500).json({ success: false, message: 'Máy chủ gặp lỗi. Vui lòng thử lại sau.' });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        getJwtSecret();

        await sequelize.authenticate();
        await syncDatabase();
        app.listen(PORT, () => {
            console.log(`Ứng dụng đang chạy tại http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Không thể khởi động ứng dụng:', error.message);
        await sequelize.close();
        process.exitCode = 1;
    }
}

if (require.main === module) {
    startServer();
}

module.exports = { app, startServer };