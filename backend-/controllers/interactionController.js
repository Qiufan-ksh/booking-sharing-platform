const { Interaction } = require('../models');
const { Book } = require('../models');

class InteractionController {
    async trackInteraction(req, res, next) {
        try {
            const { bookId, type } = req.body;
            const parsedBookId = Number(bookId);
            const allowedTypes = ['VIEW', 'DOWNLOAD', 'FAVORITE', 'EXCHANGE'];

            if (!Number.isInteger(parsedBookId) || parsedBookId <= 0 || !allowedTypes.includes(type)) {
                return res.status(400).json({ success: false, message: 'Mã tài liệu hoặc loại tương tác không hợp lệ.' });
            }
            if (!(await Book.findByPk(parsedBookId))) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy tài liệu.' });
            }

            const weights = { VIEW: 1, DOWNLOAD: 2, FAVORITE: 1.5, EXCHANGE: 2.5 };
            const interaction = await Interaction.create({
                userId: req.user.id,
                bookId: parsedBookId,
                type,
                weight: weights[type]
            });

            return res.status(201).json({ success: true, data: interaction });
        } catch (error) {
            return next(error);
        }
    }
}

module.exports = new InteractionController();