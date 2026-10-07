const recommendationService = require('../services/recommendationService');

class RecommendationController {
    async getRecommendations(req, res, next) {
        try {
            const userId = Number(req.params.userId);
            if (!Number.isInteger(userId) || userId <= 0) {
                return res.status(400).json({ success: false, message: 'Mã người dùng không hợp lệ.' });
            }
            if (!req.user || req.user.id !== userId) {
                return res.status(403).json({ success: false, message: 'Bạn chỉ có thể xem gợi ý dành cho tài khoản của mình.' });
            }

            const recommendations = await recommendationService.getRecommendationsForUser(userId);
            return res.status(200).json({ success: true, data: recommendations });
        } catch (error) {
            return next(error);
        }
    }
}

module.exports = new RecommendationController();