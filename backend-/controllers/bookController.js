const { Book } = require('../models');
const { Op } = require('sequelize');

class BookController {
    async getAllBooks(req, res, next) {
        try {
            const { major, subject, search } = req.query;
            const where = {};

            if (typeof major === 'string' && major.trim()) where.major = major.trim();
            if (typeof subject === 'string' && subject.trim()) where.subject = subject.trim();
            if (typeof search === 'string' && search.trim()) {
                where[Op.or] = [
                    { title: { [Op.like]: `%${search.trim()}%` } },
                    { subject: { [Op.like]: `%${search.trim()}%` } },
                    { major: { [Op.like]: `%${search.trim()}%` } }
                ];
            }

            const books = await Book.findAll({ where, order: [['createdAt', 'DESC']], limit: 100 });
            return res.status(200).json({ success: true, data: books });
        } catch (error) {
            return next(error);
        }
    }

    async createBook(req, res, next) {
        try {
            const { title, subject, major, fileUrl } = req.body;
            if (![title, subject, major].every(value => typeof value === 'string' && value.trim())) {
                return res.status(400).json({ success: false, message: 'Vui lòng nhập tên tài liệu, môn học và ngành học.' });
            }
            if (fileUrl && typeof fileUrl !== 'string') {
                return res.status(400).json({ success: false, message: 'Đường dẫn tài liệu không hợp lệ.' });
            }

            const book = await Book.create({
                title: title.trim(),
                subject: subject.trim(),
                major: major.trim(),
                fileUrl: fileUrl ? fileUrl.trim() : null
            });
            return res.status(201).json({ success: true, data: book });
        } catch (error) {
            return next(error);
        }
    }
}

module.exports = new BookController();