const { Book } = require('../models');
const { Op } = require('sequelize');
const { normalizeBookInput, normalizeMajor, normalizeSubject, normalizeText } = require('../services/dataPreprocessor');

class BookController {
    async getAllBooks(req, res, next) {
        try {
            const { major, subject, search } = req.query;
            const where = {};
            const normalizedMajor = typeof major === 'string' ? normalizeMajor(major) : '';
            const normalizedSubject = typeof subject === 'string' ? normalizeSubject(subject) : '';

            if (normalizedMajor) where.major = normalizedMajor;
            if (normalizedSubject) where.subject = normalizedSubject;
            if (typeof search === 'string' && search.trim()) {
                const cleanedSearch = normalizeText(search);
                where[Op.or] = [
                    { title: { [Op.iLike]: `%${cleanedSearch}%` } },
                    { subject: { [Op.iLike]: `%${cleanedSearch}%` } },
                    { major: { [Op.iLike]: `%${cleanedSearch}%` } }
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
            const normalizedBook = normalizeBookInput(req.body);
            if (![normalizedBook.title, normalizedBook.subject, normalizedBook.major].every(Boolean)) {
                return res.status(400).json({ success: false, message: 'Vui lòng nhập tên tài liệu, môn học và ngành học.' });
            }
            if (req.body.fileUrl && typeof req.body.fileUrl !== 'string') {
                return res.status(400).json({ success: false, message: 'Đường dẫn tài liệu không hợp lệ.' });
            }

            const book = await Book.create({
                title: normalizedBook.title,
                subject: normalizedBook.subject,
                major: normalizedBook.major,
                fileUrl: normalizedBook.fileUrl
            });
            return res.status(201).json({ success: true, data: book });
        } catch (error) {
            return next(error);
        }
    }
}

module.exports = new BookController();