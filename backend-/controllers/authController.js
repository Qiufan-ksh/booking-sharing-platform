const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../middleware/authMiddleware');

function publicUser(user) {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        major: user.major,
        academicYear: user.academicYear
    };
}

function createToken(user) {
    return jwt.sign({}, getJwtSecret(), { subject: String(user.id), expiresIn: '7d' });
}

class AuthController {
    async register(req, res, next) {
        try {
            const { username, email, password, major, academicYear } = req.body;
            if (![username, email, password].every(value => typeof value === 'string' && value.trim())) {
                return res.status(400).json({ success: false, message: 'Vui lòng nhập họ tên, email và mật khẩu.' });
            }
            if (password.length < 8) {
                return res.status(400).json({ success: false, message: 'Mật khẩu cần có ít nhất 8 ký tự.' });
            }

            const user = await User.create({
                username: username.trim(),
                email: email.trim().toLowerCase(),
                passwordHash: await bcrypt.hash(password, 12),
                major: typeof major === 'string' && major.trim() ? major.trim() : 'Chưa cập nhật',
                academicYear: academicYear === '' || academicYear == null ? null : Number(academicYear)
            });

            return res.status(201).json({ success: true, token: createToken(user), data: publicUser(user) });
        } catch (error) {
            return next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
                return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu.' });
            }

            const user = await User.findOne({
                where: { email: email.trim().toLowerCase() },
                attributes: ['id', 'username', 'email', 'passwordHash', 'major', 'academicYear']
            });
            if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
                return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
            }

            return res.status(200).json({ success: true, token: createToken(user), data: publicUser(user) });
        } catch (error) {
            return next(error);
        }
    }
}

module.exports = new AuthController();