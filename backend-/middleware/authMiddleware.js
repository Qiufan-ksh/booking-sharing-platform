const jwt = require('jsonwebtoken');

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32 || secret === 'replace-this-with-a-long-random-secret') {
        throw new Error('Thiếu JWT_SECRET hợp lệ (cần ít nhất 32 ký tự ngẫu nhiên) trong backend-/.env.');
    }
    return secret;
}

function verifyToken(req, res, next) {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để tiếp tục.' });
    }

    try {
        const payload = jwt.verify(token, getJwtSecret());
        const id = Number(payload.sub);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(401).json({ success: false, message: 'Token không hợp lệ.' });
        }
        req.user = { id };
        return next();
    } catch (error) {
        if (error.message.startsWith('Thiếu JWT_SECRET')) {
            return res.status(500).json({ success: false, message: error.message });
        }
        return res.status(401).json({ success: false, message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
    }
}

module.exports = { verifyToken, getJwtSecret };