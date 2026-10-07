const { Book, Interaction, User } = require('../models');
const { Op } = require('sequelize');

class RecommendationService {
    async getRecommendationsForUser(userId) {
        const user = await User.findByPk(userId);
        if (!user) {
            const error = new Error('Không tìm thấy người dùng.');
            error.statusCode = 404;
            throw error;
        }

        const userInteractions = await Interaction.findAll({
            where: { userId },
            include: [{ model: Book, attributes: ['id', 'subject'] }]
        });

        const subjectScores = new Map();
        userInteractions.forEach(item => {
            if (item.Book) {
                const subject = item.Book.subject;
                subjectScores.set(subject, (subjectScores.get(subject) || 0) + item.weight);
            }
        });

        const interactedBookIds = [...new Set(userInteractions.map(item => item.bookId))];
        const candidates = await Book.findAll({
            where: {
                major: user.major,
                ...(interactedBookIds.length ? { id: { [Op.notIn]: interactedBookIds } } : {})
            },
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        return candidates
            .map(book => ({
                ...book.toJSON(),
                recommendationScore: (subjectScores.get(book.subject) || 0) * 2 + 1
            }))
            .sort((first, second) =>
                second.recommendationScore - first.recommendationScore ||
                new Date(second.createdAt) - new Date(first.createdAt)
            )
            .slice(0, 10);
    }
}

module.exports = new RecommendationService();