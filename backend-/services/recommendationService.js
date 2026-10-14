const { Book, Interaction, User } = require('../models');
const { Op } = require('sequelize');
const { normalizeMajor, normalizeSubject } = require('./dataPreprocessor');

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
                const subject = normalizeSubject(item.Book.subject);
                if (subject) {
                    subjectScores.set(subject, (subjectScores.get(subject) || 0) + Number(item.weight || 1));
                }
            }
        });

        const interactedBookIds = [...new Set(userInteractions.map(item => item.bookId))];
        const preferredMajor = normalizeMajor(user.major) || user.major;
        const candidates = await Book.findAll({
            where: {
                ...(preferredMajor ? { major: preferredMajor } : {}),
                ...(interactedBookIds.length ? { id: { [Op.notIn]: interactedBookIds } } : {})
            },
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        return candidates
            .map(book => {
                const normalizedSubject = normalizeSubject(book.subject);
                const subjectBoost = subjectScores.get(normalizedSubject) || 0;

                return {
                    ...book.toJSON(),
                    recommendationScore: subjectBoost * 2 + (normalizedSubject ? 1 : 0)
                };
            })
            .sort((first, second) =>
                second.recommendationScore - first.recommendationScore ||
                new Date(second.createdAt) - new Date(first.createdAt)
            )
            .slice(0, 10);
    }
}

module.exports = new RecommendationService();